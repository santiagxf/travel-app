/**
 * Flight Data Cache Service
 * 
 * Implements a cache-aside pattern for flight data to provide consistent results
 * across searches with the same parameters. This improves the demo experience by
 * showing the same flight options for identical searches.
 */

import { FlightOption, FlightClass } from './flightDataGenerator';

// Cache key parameters interface
interface CacheKeyParams {
  originCode: string;
  destinationCode: string;
  departureDate: string;
  returnDate?: string;
  cabinClass: FlightClass;
  multiCitySegments?: { origin: string; destination: string; date: string }[];
  isRewardSearch?: boolean;
}

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

// Default cache expiration time (24 hours in milliseconds)
const DEFAULT_CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

class FlightDataCache {
  private static instance: FlightDataCache;
  private memoryCache: Map<string, { data: FlightOption[]; timestamp: number }>;
  private cacheStats: CacheStats = { hits: 0, misses: 0, size: 0 };
  private readonly cachePrefix = 'flight_cache_';
  private readonly statsKey = 'flight_cache_stats';
  private debugMode: boolean = false; // Changed from readonly to private

  private constructor() {
    this.memoryCache = new Map();
    this.loadCacheStats();
  }

  /**
   * Get the singleton cache instance
   */
  public static getInstance(): FlightDataCache {
    if (!FlightDataCache.instance) {
      FlightDataCache.instance = new FlightDataCache();
    }
    return FlightDataCache.instance;
  }

  /**
   * Enable or disable debug mode
   * When debug mode is enabled, cache will be bypassed
   */
  public setDebugMode(debug: boolean): void {
    // Use a direct property assignment with a more specific type
    this.debugMode = debug;
  }

  /**
   * Generate a cache key from search parameters
   */
  public generateCacheKey(params: CacheKeyParams): string {
    if (params.multiCitySegments) {
      // For multi-city, create a key based on all segments
      const segmentsKey = params.multiCitySegments.map(seg => 
        `${seg.origin}-${seg.destination}-${seg.date}`
      ).join('|');
      
      return `multi-${segmentsKey}-${params.cabinClass}-${params.isRewardSearch ? 'reward' : 'cash'}`;
    } else if (params.returnDate) {
      // For round-trip
      return `round-${params.originCode}-${params.destinationCode}-${params.departureDate}-${params.returnDate}-${params.cabinClass}-${params.isRewardSearch ? 'reward' : 'cash'}`;
    } else {
      // For one-way
      return `one-way-${params.originCode}-${params.destinationCode}-${params.departureDate}-${params.cabinClass}-${params.isRewardSearch ? 'reward' : 'cash'}`;
    }
  }

  /**
   * Check if two searches are similar enough to use cached results
   * This implements the bias towards cached results
   */
  public isSimilarSearch(key1: string, key2: string): boolean {
    // If the keys are identical, they are definitely similar
    if (key1 === key2) return true;
    
    // Parse the keys to check for similarities
    const parts1 = key1.split('-');
    const parts2 = key2.split('-');
    
    // If the trip types are different, they're not similar
    if (parts1[0] !== parts2[0]) return false;
    
    // We'll only consider exact origin/destination pairs as similar
    // and not use date similarity as was done previously.
    // This ensures that changing dates will generate new results.
    if ((parts1[0] === 'round' || parts1[0] === 'one') && (parts2[0] === 'round' || parts2[0] === 'one')) {
      // Only consider exact matches for origin/destination AND dates now
      return key1 === key2;
    }
    
    // For multi-city, we'll only consider exact matches
    return false;
  }

  /**
   * Get flights from cache
   * Returns null if cache miss or expired
   */
  public getFlights(cacheKey: string): FlightOption[] | null {
    // If in debug mode, always return null (cache miss)
    if (this.debugMode) {
      this.cacheStats.misses++;
      this.saveCacheStats();
      return null;
    }

    // First try memory cache
    const memoryResult = this.memoryCache.get(cacheKey);
    if (memoryResult) {
      // Check expiration
      if (Date.now() - memoryResult.timestamp < DEFAULT_CACHE_EXPIRATION) {
        this.cacheStats.hits++;
        this.saveCacheStats();
        return memoryResult.data;
      }
    }

    // Try localStorage if browser environment
    if (typeof window !== 'undefined') {
      try {
        const storageKey = this.cachePrefix + cacheKey;
        const cachedDataStr = localStorage.getItem(storageKey);
        
        if (cachedDataStr) {
          const cachedData = JSON.parse(cachedDataStr);
          
          // Check if data is still valid
          if (Date.now() - cachedData.timestamp < DEFAULT_CACHE_EXPIRATION) {
            // Store in memory cache too
            this.memoryCache.set(cacheKey, cachedData);
            
            this.cacheStats.hits++;
            this.saveCacheStats();
            
            return cachedData.data;
          }
        }
      } catch (error) {
        console.error('Error retrieving from cache:', error);
      }
    }

    // Check for similar cached searches
    if (typeof window !== 'undefined') {
      try {
        // Get all localStorage keys
        const allKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.cachePrefix)) {
            allKeys.push(key);
          }
        }
        
        for (const key of allKeys) {
          const pureKey = key.replace(this.cachePrefix, '');
          
          if (this.isSimilarSearch(cacheKey, pureKey)) {
            const cachedDataStr = localStorage.getItem(key);
            
            if (cachedDataStr) {
              const cachedData = JSON.parse(cachedDataStr);
              
              // Check if data is still valid
              if (Date.now() - cachedData.timestamp < DEFAULT_CACHE_EXPIRATION) {
                // Store in memory cache too
                this.memoryCache.set(cacheKey, cachedData);
                
                this.cacheStats.hits++;
                this.saveCacheStats();
                
                return cachedData.data;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error searching for similar results:', error);
      }
    }

    // Cache miss
    this.cacheStats.misses++;
    this.saveCacheStats();
    
    return null;
  }

  /**
   * Store flights in cache
   */
  public setFlights(cacheKey: string, flights: FlightOption[]): void {
    // If in debug mode, don't cache
    if (this.debugMode) return;

    const cacheData = {
      data: flights,
      timestamp: Date.now()
    };

    // Store in memory cache
    this.memoryCache.set(cacheKey, cacheData);
    
    // Store in localStorage if browser environment
    if (typeof window !== 'undefined') {
      try {
        const storageKey = this.cachePrefix + cacheKey;
        localStorage.setItem(storageKey, JSON.stringify(cacheData));
        
        // Update cache stats
        this.cacheStats.size = this.getCacheSize();
        this.saveCacheStats();
      } catch (error) {
        console.error('Error storing in cache:', error);
      }
    }
  }

  /**
   * Clear all cached flight data
   */
  public clearCache(): void {
    // Clear memory cache
    this.memoryCache.clear();
    
    // Reset cache statistics
    this.cacheStats = { hits: 0, misses: 0, size: 0 };
    
    // Clear localStorage if browser environment
    if (typeof window !== 'undefined') {
      try {
        // Get all localStorage keys that belong to our cache
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.cachePrefix)) {
            keysToRemove.push(key);
          }
        }
        
        // Remove all matching keys
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Also remove the stats
        localStorage.removeItem(this.statsKey);
          
        // Reset stats
        this.cacheStats.size = 0;
        this.saveCacheStats();
      } catch (error) {
        console.error('Error clearing cache:', error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): CacheStats {
    return { ...this.cacheStats };
  }

  /**
   * Get current cache size
   */
  private getCacheSize(): number {
    if (typeof window !== 'undefined') {
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.cachePrefix)) {
          count++;
        }
      }
      return count;
    }
    
    return this.memoryCache.size;
  }

  /**
   * Load cache statistics from localStorage
   */
  private loadCacheStats(): void {
    if (typeof window !== 'undefined') {
      try {
        const statsStr = localStorage.getItem(this.statsKey);
        if (statsStr) {
          this.cacheStats = { ...JSON.parse(statsStr) };
        }
        // Update the size which may have changed
        this.cacheStats.size = this.getCacheSize();
      } catch (error) {
        console.error('Error loading cache stats:', error);
      }
    }
  }

  /**
   * Save cache statistics to localStorage
   */
  private saveCacheStats(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.statsKey, JSON.stringify(this.cacheStats));
      } catch (error) {
        console.error('Error saving cache stats:', error);
      }
    }
  }
}

export default FlightDataCache;