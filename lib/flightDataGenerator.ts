// Flight data generator utility for creating synthetic flight search results
// This file provides functions to generate realistic mock flight data

export type Airport = {
  code: string;
  name: string;
  city: string;
};

export type FlightClass = 'Economy' | 'Premium Economy' | 'Business' | 'First';

export type FlightSegment = {
  id: string;
  origin: Airport;
  destination: Airport;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  flightNumber: string;
  airline: string;
  airlineLogo?: string;
  duration: string;
  stops: number;
  stopLocations?: string[];
};

export type FlightOption = {
  id: string;
  segments: FlightSegment[];
  totalDuration: string;
  pricePerPassenger: number; // Single passenger price
  totalPrice: number; // Total price for all passengers
  cabinClass: FlightClass;
  isReward: boolean;
  rewardPoints?: number;
};

// Available airports to use in synthetic data
export const airports: Record<string, Airport> = {
  SFO: { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco' },
  NYC: { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York' },
  LAX: { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles' },
  CHI: { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago' },
  ATL: { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta' },
  DFW: { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas' },
  DEN: { code: 'DEN', name: 'Denver International Airport', city: 'Denver' },
  SEA: { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle' },
  LAS: { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas' },
  MIA: { code: 'MIA', name: 'Miami International Airport', city: 'Miami' },
  BOS: { code: 'BOS', name: 'Boston Logan International Airport', city: 'Boston' },
  PHX: { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix' },
  IAH: { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston' },
};

// Copilot Airways as the only airline
const airlineLogo = '/img/logo.svg';

// Generate a random time between start and end hours (24h format)
function generateRandomTime(startHour: number, endHour: number): string {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const minute = Math.floor(Math.random() * 12) * 5; // Ensure minutes are in 5-minute increments
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// Calculate arrival time and date based on departure time and duration
function calculateArrivalTimeAndDate(departureDate: string, departureTime: string, durationMinutes: number): { arrivalTime: string; arrivalDate: string } {
  const departureDateTime = new Date(`${departureDate}T${departureTime}:00`);
  const arrivalDateTime = new Date(departureDateTime.getTime() + durationMinutes * 60000);
  
  const arrivalTime = `${arrivalDateTime.getHours().toString().padStart(2, '0')}:${arrivalDateTime.getMinutes().toString().padStart(2, '0')}`;
  const arrivalDate = arrivalDateTime.toISOString().split('T')[0];
  
  return { arrivalTime, arrivalDate };
}

// Format duration in hours and minutes
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

// Generate a random flight segment between two airports
function generateFlightSegment(originCode: string, destinationCode: string, departureDate: string, stops: number = 0): FlightSegment {
  const origin = airports[originCode];
  const destination = airports[destinationCode];
  
  if (!origin || !destination) {
    throw new Error(`Invalid airport code: ${!origin ? originCode : destinationCode}`);
  }
  
  // Always use Copilot Airways
  const airline = 'Copilot Airways';
  // Generate flight number with 'CA' prefix for Copilot Airways
  const flightNumber = `CA${Math.floor(Math.random() * 9000) + 1000}`;
  
  // Generate random flight duration between 1 and 6 hours (plus some minutes)
  const baseDurationMinutes = Math.floor(Math.random() * 300) + 60;
  const stopDurationMinutes = stops * 40; // Add time for each stop
  const totalDurationMinutes = baseDurationMinutes + stopDurationMinutes;
  
  // Generate departure time between 6am and 10pm
  const departureTime = generateRandomTime(6, 22);
  
  // Calculate arrival time and date based on departure and duration
  const { arrivalTime, arrivalDate } = calculateArrivalTimeAndDate(departureDate, departureTime, totalDurationMinutes);
  
  // Generate stop locations if needed
  const stopLocations = stops > 0
    ? Array.from({ length: stops }, () => {
        const codes = Object.keys(airports);
        const randomCode = codes[Math.floor(Math.random() * codes.length)];
        return airports[randomCode].code;
      })
    : undefined;
  
  return {
    id: `${originCode}-${destinationCode}-${departureDate}-${departureTime}`.replace(/:/g, ''),
    origin,
    destination,
    departureDate,
    departureTime,
    arrivalDate,
    arrivalTime,
    flightNumber,
    airline,
    airlineLogo,
    duration: formatDuration(totalDurationMinutes),
    stops,
    stopLocations,
  };
}

// Calculate total flight duration across all segments
function calculateTotalDuration(segments: FlightSegment[]): string {
  // Extract hours and minutes from each segment's duration
  let totalMinutes = 0;
  
  segments.forEach(segment => {
    const durationParts = segment.duration.split('h ');
    const hours = parseInt(durationParts[0], 10);
    const minutes = parseInt(durationParts[1].replace('m', ''), 10);
    totalMinutes += hours * 60 + minutes;
  });
  
  return formatDuration(totalMinutes);
}

// Import the cache service
import FlightDataCache from './flightDataCache';

/**
 * Generate multiple flight options for a search
 * 
 * This function implements a cache-aside pattern:
 * 1. Generate a cache key based on search parameters
 * 2. Check if results exist in cache
 * 3. If found, return cached results
 * 4. If not found, generate new results, store in cache, and return
 */
export function generateFlightOptions(
  originCode: string,
  destinationCode: string,
  departureDate: string,
  returnDate?: string,
  cabinClass: FlightClass = 'Economy',
  multiCitySegments?: { origin: string; destination: string; date: string }[],
  isRewardSearch?: boolean,
  bypassCache?: boolean, // Optional parameter to bypass cache for testing
  passengers: number = 1 // Number of passengers
): FlightOption[] {
  // Get the cache instance
  const cache = FlightDataCache.getInstance();
  
  // Set debug mode if bypassCache is true
  if (bypassCache) {
    cache.setDebugMode(true);
  } else {
    cache.setDebugMode(false);
  }
  
  // Generate cache key from parameters - exclude passenger count since we'll adjust prices separately
  const cacheKey = cache.generateCacheKey({
    originCode,
    destinationCode,
    departureDate,
    returnDate,
    cabinClass,
    multiCitySegments,
    isRewardSearch
  });
  
  // Check cache first (cache-aside pattern)
  const cachedFlights = cache.getFlights(cacheKey);
  
  if (cachedFlights) {
    // Filter for reward flights if isRewardSearch is true
    let flights = cachedFlights;
    if (isRewardSearch) {
      flights = flights.filter(flight => flight.isReward);
    }
    
    // Update the total price based on the number of passengers
    // Ensure all values are valid numbers, providing fallbacks when needed
    return flights.map(flight => {
      // Ensure pricePerPassenger has a valid value
      const safePrice = isNaN(flight.pricePerPassenger) || flight.pricePerPassenger <= 0 
        ? (flight.isReward ? 200 : 250) 
        : flight.pricePerPassenger;
        
      // Calculate totalPrice with fallback
      const totalPrice = safePrice * passengers;
      
      // Calculate reward points with fallback
      let rewardPoints;
      if (flight.isReward) {
        if (flight.rewardPoints && !isNaN(flight.rewardPoints)) {
          rewardPoints = flight.rewardPoints * passengers;
        } else {
          rewardPoints = safePrice * 100 * passengers;
        }
      }
      
      return {
        ...flight,
        pricePerPassenger: safePrice,
        totalPrice,
        rewardPoints: flight.isReward ? rewardPoints : undefined
      };
    });
  }
  
  // Cache miss - generate new flight options
  const flightOptions: FlightOption[] = [];
  
  // Number of flight options to generate
  const numOptions = Math.floor(Math.random() * 8) + 3; // 3-10 options
  
  if (multiCitySegments) {
    // Generate multi-city flight options
    for (let i = 0; i < numOptions; i++) {
      const segments: FlightSegment[] = [];
      
      // Generate a segment for each leg of the multi-city journey
      multiCitySegments.forEach(leg => {
        const stops = Math.random() < 0.7 ? 0 : (Math.random() < 0.8 ? 1 : 2); // 70% direct, 24% 1 stop, 6% 2 stops
        segments.push(generateFlightSegment(leg.origin, leg.destination, leg.date, stops));
      });
      
      // Calculate price based on segments and cabin class, but for a SINGLE passenger
      const basePrice = 150 + Math.floor(Math.random() * 100);
      const segmentMultiplier = segments.length;
      const classMultiplier = 
        cabinClass === 'Economy' ? 1 :
        cabinClass === 'Premium Economy' ? 1.5 :
        cabinClass === 'Business' ? 2.5 :
        4; // First class
      
      // Ensure price calculation never returns NaN by providing fallbacks
      let pricePerPassenger = Math.floor(basePrice * segmentMultiplier * classMultiplier);
      if (isNaN(pricePerPassenger) || pricePerPassenger <= 0) pricePerPassenger = 200; // Fallback to 200
      
      const isReward = Math.random() < 0.2; // 20% chance of being a reward flight
      
      // Ensure reward points calculation never returns NaN
      let rewardPoints = isReward ? Math.floor(pricePerPassenger * 100) : undefined;
      if (isReward && (isNaN(rewardPoints as number) || rewardPoints as number <= 0)) rewardPoints = 20000;
      
      // Calculate total price with guaranteed value
      const totalPrice = pricePerPassenger * passengers;
      
      flightOptions.push({
        id: `multi-${i}-${originCode}-${destinationCode}`,
        segments,
        totalDuration: calculateTotalDuration(segments),
        pricePerPassenger,
        totalPrice, // Already calculated with proper validation
        cabinClass,
        isReward,
        rewardPoints: isReward ? (rewardPoints as number) * passengers : undefined,
      });
    }
  } else if (returnDate) {
    // Generate round-trip flight options
    for (let i = 0; i < numOptions; i++) {
      const outboundStops = Math.random() < 0.7 ? 0 : (Math.random() < 0.8 ? 1 : 2);
      const returnStops = Math.random() < 0.7 ? 0 : (Math.random() < 0.8 ? 1 : 2);
      
      const outbound = generateFlightSegment(originCode, destinationCode, departureDate, outboundStops);
      const returnFlight = generateFlightSegment(destinationCode, originCode, returnDate, returnStops);
      
      const basePrice = 150 + Math.floor(Math.random() * 100);
      const classMultiplier = 
        cabinClass === 'Economy' ? 1 :
        cabinClass === 'Premium Economy' ? 1.5 :
        cabinClass === 'Business' ? 2.5 :
        4; // First class
      
      // Ensure price calculation never returns NaN by providing fallbacks
      let pricePerPassenger = Math.floor(basePrice * 2 * classMultiplier);
      if (isNaN(pricePerPassenger) || pricePerPassenger <= 0) pricePerPassenger = 200; // Fallback to 200
      
      const isReward = Math.random() < 0.2;
      
      // Ensure reward points calculation never returns NaN
      let rewardPoints = isReward ? Math.floor(pricePerPassenger * 100) : undefined;
      if (isReward && (isNaN(rewardPoints as number) || rewardPoints as number <= 0)) rewardPoints = 20000;
      
      // Calculate total price with guaranteed value
      const totalPrice = pricePerPassenger * passengers;
      
      flightOptions.push({
        id: `round-${i}-${originCode}-${destinationCode}`,
        segments: [outbound, returnFlight],
        totalDuration: calculateTotalDuration([outbound, returnFlight]),
        pricePerPassenger,
        totalPrice, // Already calculated with proper validation
        cabinClass,
        isReward,
        rewardPoints: isReward ? (rewardPoints as number) * passengers : undefined,
      });
    }
  } else {
    // Generate one-way flight options
    for (let i = 0; i < numOptions; i++) {
      const stops = Math.random() < 0.7 ? 0 : (Math.random() < 0.8 ? 1 : 2);
      const segment = generateFlightSegment(originCode, destinationCode, departureDate, stops);
      
      const basePrice = 80 + Math.floor(Math.random() * 70);
      const classMultiplier = 
        cabinClass === 'Economy' ? 1 :
        cabinClass === 'Premium Economy' ? 1.5 :
        cabinClass === 'Business' ? 2.5 :
        4; // First class
      
      // Ensure price calculation never returns NaN by providing fallbacks
      let pricePerPassenger = Math.floor(basePrice * classMultiplier);
      if (isNaN(pricePerPassenger) || pricePerPassenger <= 0) pricePerPassenger = 100; // Fallback to 100
      
      const isReward = Math.random() < 0.2;
      
      // Ensure reward points calculation never returns NaN
      let rewardPoints = isReward ? Math.floor(pricePerPassenger * 100) : undefined;
      if (isReward && (isNaN(rewardPoints as number) || rewardPoints as number <= 0)) rewardPoints = 10000;
      
      // Calculate total price with guaranteed value
      const totalPrice = pricePerPassenger * passengers;
      
      flightOptions.push({
        id: `one-way-${i}-${originCode}-${destinationCode}`,
        segments: [segment],
        totalDuration: segment.duration,
        pricePerPassenger,
        totalPrice, // Already calculated with proper validation
        cabinClass,
        isReward,
        rewardPoints: isReward ? (rewardPoints as number) * passengers : undefined,
      });
    }
  }
  
  // Sort by price
  let sortedOptions = flightOptions.sort((a, b) => a.totalPrice - b.totalPrice);
  
  // Filter for reward flights if isRewardSearch is true and we're not using cache
  if (isRewardSearch) {
    // Only keep flights with isReward === true
    sortedOptions = sortedOptions.filter(flight => flight.isReward);
    
    // If no reward flights were found, create at least one
    if (sortedOptions.length === 0 && flightOptions.length > 0) {
      // Take the first flight and make it a reward flight
      const firstFlight = { ...flightOptions[0] };
      firstFlight.isReward = true;
      firstFlight.rewardPoints = Math.floor(firstFlight.pricePerPassenger * 100) * passengers || 10000 * passengers;
      sortedOptions = [firstFlight];
    }
  }
  
  // Store in cache (with price per passenger, so it can be adjusted based on passenger count)
  // Ensure we never cache invalid price or reward point values
  cache.setFlights(cacheKey, sortedOptions.map(flight => {
    // Validate pricePerPassenger and ensure it's not NaN
    const safePrice = isNaN(flight.pricePerPassenger) || flight.pricePerPassenger <= 0 
      ? (flight.isReward ? 200 : 250) 
      : flight.pricePerPassenger;
      
    // Calculate reward points with validation
    let safeRewardPoints;
    if (flight.isReward) {
      if (flight.rewardPoints && !isNaN(flight.rewardPoints / passengers)) {
        safeRewardPoints = flight.rewardPoints / passengers;
      } else {
        safeRewardPoints = safePrice * 100;
      }
    }
    
    return {
      ...flight,
      pricePerPassenger: safePrice,
      totalPrice: safePrice, // Store single passenger price for the cache
      rewardPoints: flight.isReward ? safeRewardPoints : undefined,
    };
  }));
  
  return sortedOptions;
}