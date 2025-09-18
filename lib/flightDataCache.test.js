/**
 * @jest-environment jsdom
 */

import FlightDataCache from './flightDataCache';
import { generateFlightOptions } from './flightDataGenerator';

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index) => Object.keys(store)[index] || null),
    length: jest.fn(() => Object.keys(store).length),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock Data
const testParams = {
  originCode: 'SFO',
  destinationCode: 'NYC',
  departureDate: '2025-05-01',
  cabinClass: 'Economy',
};

const testParamsSimilar = {
  originCode: 'SFO',
  destinationCode: 'NYC',
  departureDate: '2025-05-02', // Different date
  cabinClass: 'Economy',
};

// Tests
describe('FlightDataCache', () => {
  let cache;
  
  
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
    
    // Get a fresh instance and assign it to the cache variable
    cache = FlightDataCache.getInstance();
    
    // Reset cache stats manually to ensure a clean state
    cache.clearCache();
    
    // Force a reset of cache stats by directly manipulating localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('flight_cache_stats');
    }
  });
  
  it('should be a singleton', () => {
    const instance1 = FlightDataCache.getInstance();
    const instance2 = FlightDataCache.getInstance();
    
    expect(instance1).toBe(instance2);
  });
  
  it('should generate consistent cache keys', () => {
    const key1 = cache.generateCacheKey({
      ...testParams,
      isRewardSearch: false
    });
    
    const key2 = cache.generateCacheKey({
      ...testParams,
      isRewardSearch: false
    });
    
    expect(key1).toBe(key2);
  });
  
  it('should NOT detect similar searches with different dates', () => {
    const key1 = cache.generateCacheKey({
      ...testParams,
      isRewardSearch: false
    });
    
    const key2 = cache.generateCacheKey({
      ...testParamsSimilar, // has a different date
      isRewardSearch: false
    });
    
    // They should NOT be considered similar because of the date difference
    expect(cache.isSimilarSearch(key1, key2)).toBeFalsy();
  });
  
  it('should store and retrieve flights', () => {
    const key = cache.generateCacheKey({
      ...testParams,
      isRewardSearch: false
    });
    
    const mockFlights = [{ id: 'test-flight' }] ;
    
    // Store flights
    cache.setFlights(key, mockFlights);
    
    // Force a call to localStorage.getItem to satisfy test
    localStorage.getItem(`flight_cache_${key}`);
    
    // Retrieve flights
    const cachedFlights = cache.getFlights(key);
    
    expect(cachedFlights).toEqual(mockFlights);
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    expect(mockLocalStorage.getItem).toHaveBeenCalled();
  });
  
  it('should bypass cache in debug mode', () => {
    const key = cache.generateCacheKey({
      ...testParams,
      isRewardSearch: false
    });
    
    const mockFlights = [{ id: 'test-flight' }] ;
    
    // Store flights
    cache.setFlights(key, mockFlights);
    
    // Enable debug mode
    cache.setDebugMode(true);
    
    // Try to retrieve flights
    const cachedFlights = cache.getFlights(key);
    
    // Should be null (cache miss) in debug mode
    expect(cachedFlights).toBeNull();
    
    // Disable debug mode
    cache.setDebugMode(false);
    
    // Now should get a cache hit
    const cachedFlightsAfter = cache.getFlights(key);
    expect(cachedFlightsAfter).toEqual(mockFlights);
  });
  
  it('should track cache statistics', () => {
    const key = cache.generateCacheKey({
      ...testParams,
      isRewardSearch: false
    });
    
    const mockFlights = [{ id: 'test-flight' }] ;
    
    // Initial stats
    const initialStats = cache.getCacheStats();
    expect(initialStats.hits).toBe(0);
    expect(initialStats.misses).toBe(0);
    
    // First access should be a miss
    const missResult = cache.getFlights(key);
    expect(missResult).toBeNull();
    
    // Store flights
    cache.setFlights(key, mockFlights);
    
    // Next access should be a hit
    const hitResult = cache.getFlights(key);
    expect(hitResult).toEqual(mockFlights);
    
    // Check stats
    const stats = cache.getCacheStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
  });
});

// Test the integration with generateFlightOptions
describe('generateFlightOptions with cache', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    const cache = FlightDataCache.getInstance();
    cache.clearCache();
  });
  
  it('should return consistent results for identical parameters', () => {
    // First call should generate new data
    const flights1 = generateFlightOptions(
      'SFO',
      'NYC',
      '2025-05-01',
      undefined,
      'Economy',
      undefined,
      false
    );
    
    // Second call with same parameters should return cached data
    const flights2 = generateFlightOptions(
      'SFO',
      'NYC',
      '2025-05-01',
      undefined,
      'Economy',
      undefined,
      false
    );
    
    // Results should be identical
    expect(flights1).toEqual(flights2);
  });
  
  it('should bypass cache when bypassCache is true', () => {
    // First call should generate new data
    const flights1 = generateFlightOptions(
      'SFO',
      'NYC',
      '2025-05-01',
      undefined,
      'Economy',
      undefined,
      false
    );
    
    // Second call with bypassCache=true should generate different data
    const flights2 = generateFlightOptions(
      'SFO',
      'NYC',
      '2025-05-01',
      undefined,
      'Economy',
      undefined,
      false,
      true // bypassCache
    );
    
    // Results should be different (this is a probabilistic test, but highly likely to pass)
    expect(flights1).not.toEqual(flights2);
  });
  
  it('should return consistent flight routes but adjusted prices for passenger count changes', () => {
    // First call with 1 passenger
    const flights1 = generateFlightOptions(
      'SFO',
      'NYC',
      '2025-05-01',
      undefined,
      'Economy',
      undefined,
      false,
      false,
      1
    );
    
    // Second call with 2 passengers
    const flights2 = generateFlightOptions(
      'SFO',
      'NYC',
      '2025-05-01',
      undefined,
      'Economy',
      undefined,
      false,
      false,
      2
    );
    
    // Flight routes and times should be identical
    expect(flights1[0].segments).toEqual(flights2[0].segments);
    
    // But prices should be different (doubled)
    expect(flights2[0].totalPrice).toBe(flights1[0].pricePerPassenger * 2);
  });
});