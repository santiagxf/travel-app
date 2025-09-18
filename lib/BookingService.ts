import { FlightOption } from './flightDataGenerator';
import TravelGuideService from './TravelGuideService';

// Define booking record type
export type BookingRecord = {
  confirmationCode: string;
  lastName: string;
  flight: FlightOption;
  passengerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }[];
  checkInAvailable: boolean;
};

// Helper to get a date string for today + N days
function getDateNDaysFromToday(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

// Mock booking database for testing
export const mockBookings: BookingRecord[] = [
  {
    confirmationCode: 'CA123456',
    lastName: 'Reddington',
    flight: {
      id: 'fl-1001',
      segments: [
        {
          id: 'seg-1001',
          airline: 'Copilot Airways',
          flightNumber: 'CA101',
          departureTime: '08:30',
          arrivalTime: '10:45',
          departureDate: getDateNDaysFromToday(1),
          arrivalDate: getDateNDaysFromToday(1),
          origin: { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles' },
          destination: { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle' },
          duration: '2h 15m',
          stops: 0
        }
      ],
      totalPrice: 299.99,
      pricePerPassenger: 299.99,
      totalDuration: '2h 15m',
      cabinClass: 'Economy',
      isReward: false
    },
    passengerDetails: [
      {
        firstName: 'Chris',
        lastName: 'Reddington',
        email: 'chris.reddington@example.com',
        phone: '+1-555-123-4567'
      }
    ],
    checkInAvailable: false
  },
  {
    confirmationCode: 'CA234567',
    lastName: 'Woodward',
    flight: {
      id: 'fl-1002',
      segments: [
        {
          id: 'seg-1002',
          airline: 'Copilot Airways',
          flightNumber: 'CA202',
          departureTime: '14:20',
          arrivalTime: '02:45',
          departureDate: getDateNDaysFromToday(2),
          arrivalDate: getDateNDaysFromToday(3),
          origin: { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York' },
          destination: { code: 'LHR', name: 'London Heathrow Airport', city: 'London' },
          duration: '7h 25m',
          stops: 0
        },
        {
          id: 'seg-1003',
          airline: 'Copilot Airways',
          flightNumber: 'CA203',
          departureTime: '10:30',
          arrivalTime: '12:45',
          departureDate: getDateNDaysFromToday(9),
          arrivalDate: getDateNDaysFromToday(9),
          origin: { code: 'LHR', name: 'London Heathrow Airport', city: 'London' },
          destination: { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York' },
          duration: '7h 15m',
          stops: 0
        }
      ],
      totalPrice: 899.99,
      pricePerPassenger: 899.99,
      totalDuration: '9h 40m',
      cabinClass: 'Premium Economy',
      isReward: false
    },
    passengerDetails: [
      {
        firstName: 'Martin',
        lastName: 'Woodward',
        email: 'martin.Woodward@example.com'
      }
    ],
    checkInAvailable: false
  },
  {
    confirmationCode: 'CA345678',
    lastName: 'Brady',
    flight: {
      id: 'fl-1003',
      segments: [
        {
          id: 'seg-1004',
          airline: 'Copilot Airways',
          flightNumber: 'CA303',
          departureTime: '09:15',
          arrivalTime: '12:20',
          departureDate: getDateNDaysFromToday(4),
          arrivalDate: getDateNDaysFromToday(4),
          origin: { code: 'MIA', name: 'Miami International Airport', city: 'Miami' },
          destination: { code: 'MEX', name: 'Benito Juárez International Airport', city: 'Mexico City' },
          duration: '4h 05m',
          stops: 0
        }
      ],
      totalPrice: 399.99,
      pricePerPassenger: 199.99,
      totalDuration: '4h 05m',
      cabinClass: 'Business',
      isReward: false
    },
    passengerDetails: [
      {
        firstName: 'Damian',
        lastName: 'Brady',
        email: 'damian.brady@example.com',
        phone: '+1-555-987-6543'
      }
    ],
    checkInAvailable: false
  },
  {
    confirmationCode: 'CA456789',
    lastName: 'Langreo',
    flight: {
      id: 'fl-1004',
      segments: [
        {
          id: 'seg-1005',
          airline: 'Copilot Airways',
          flightNumber: 'CA404',
          departureTime: '11:30',
          arrivalTime: '14:15',
          departureDate: getDateNDaysFromToday(5),
          arrivalDate: getDateNDaysFromToday(5),
          origin: { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago' },
          destination: { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas' },
          duration: '2h 45m',
          stops: 0
        }
      ],
      isReward: true,
      rewardPoints: 15000,
      cabinClass: 'Economy',
      totalDuration: '2h 45m',
      pricePerPassenger: 0,
      totalPrice: 0
    },
    passengerDetails: [
      {
        firstName: 'Glòria',
        lastName: 'Langreo',
        email: 'gloria.langreo@example.com'
      }
    ],
    checkInAvailable: false
  },
  {
    confirmationCode: 'CA567890',
    lastName: 'Younas',
    flight: {
      id: 'fl-1005',
      segments: [
        {
          id: 'seg-1006',
          airline: 'Copilot Airways',
          flightNumber: 'CA505',
          departureTime: '07:45',
          arrivalTime: '09:50',
          departureDate: getDateNDaysFromToday(6),
          arrivalDate: getDateNDaysFromToday(6),
          origin: { code: 'BOS', name: 'Boston Logan International Airport', city: 'Boston' },
          destination: { code: 'PHL', name: 'Philadelphia International Airport', city: 'Philadelphia' },
          duration: '2h 05m',
          stops: 0
        },
        {
          id: 'seg-1007',
          airline: 'Copilot Airways',
          flightNumber: 'CA506',
          departureTime: '16:20',
          arrivalTime: '18:30',
          departureDate: getDateNDaysFromToday(9),
          arrivalDate: getDateNDaysFromToday(9),
          origin: { code: 'PHL', name: 'Philadelphia International Airport', city: 'Philadelphia' },
          destination: { code: 'BOS', name: 'Boston Logan International Airport', city: 'Boston' },
          duration: '2h 10m',
          stops: 0
        }
      ],
      totalPrice: 349.99,
      pricePerPassenger: 349.99,
      totalDuration: '4h 15m',
      cabinClass: 'Economy',
      isReward: false
    },
    passengerDetails: [
      {
        firstName: 'Shokat',
        lastName: 'Younas',
        email: 'shokat.younas@example.com'
      }
    ],
    checkInAvailable: false
  },
  {
    confirmationCode: 'CA678901',
    lastName: 'Williams',
    flight: {
      id: 'fl-1006',
      segments: [
        {
          id: 'seg-1008',
          airline: 'Copilot Airways',
          flightNumber: 'CA606',
          departureTime: '16:45',
          arrivalTime: '19:30',
          departureDate: getDateNDaysFromToday(7),
          arrivalDate: getDateNDaysFromToday(7),
          origin: { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco' },
          destination: { code: 'HNL', name: 'Daniel K. Inouye International Airport', city: 'Honolulu' },
          duration: '5h 45m',
          stops: 0
        },
        {
          id: 'seg-1009',
          airline: 'Copilot Airways',
          flightNumber: 'CA607',
          departureTime: '10:15',
          arrivalTime: '18:30',
          departureDate: getDateNDaysFromToday(14),
          arrivalDate: getDateNDaysFromToday(14),
          origin: { code: 'HNL', name: 'Daniel K. Inouye International Airport', city: 'Honolulu' },
          destination: { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco' },
          duration: '5h 15m',
          stops: 0
        }
      ],
      totalPrice: 799.99,
      pricePerPassenger: 799.99,
      totalDuration: '11h 0m',
      cabinClass: 'First',
      isReward: false
    },
    passengerDetails: [
      {
        firstName: 'Dylan',
        lastName: 'Williams',
        email: 'dylan.williams@example.com',
        phone: '+1-555-456-7890'
      },
      {
        firstName: 'Matiass',
        lastName: 'Polis',
        email: 'matiass.polis@example.com'
      }
    ],
    checkInAvailable: false
  },
  {
    confirmationCode: 'CA789012',
    lastName: 'Zeltina',
    flight: {
      id: 'fl-1007',
      segments: [
        {
          id: 'seg-1010',
          airline: 'Copilot Airways',
          flightNumber: 'CA707',
          departureTime: '13:10',
          arrivalTime: '14:25',
          departureDate: getDateNDaysFromToday(8),
          arrivalDate: getDateNDaysFromToday(8),
          origin: { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta' },
          destination: { code: 'DEN', name: 'Denver International Airport', city: 'Denver' },
          duration: '3h 15m',
          stops: 0
        }
      ],
      totalPrice: 499.99,
      pricePerPassenger: 499.99,
      totalDuration: '3h 15m',
      isReward: true,
      rewardPoints: 25000,
      cabinClass: 'Business'
    },
    passengerDetails: [
      {
        firstName: 'Aira',
        lastName: 'Zeltina',
        email: 'aira.zeltina@example.com'
      }
    ],
    checkInAvailable: false
  },
  {
    confirmationCode: 'CA890123',
    lastName: 'Medhi',
    flight: {
      id: 'fl-1008',
      segments: [
        {
          id: 'seg-1011',
          airline: 'Copilot Airways',
          flightNumber: 'CA808',
          departureTime: '10:30',
          arrivalTime: '13:45',
          departureDate: getDateNDaysFromToday(10),
          arrivalDate: getDateNDaysFromToday(11),
          origin: { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle' },
          destination: { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo' },
          duration: '11h 15m',
          stops: 1,
          stopLocations: ['ANC']
        }
      ],
      totalPrice: 1299.99,
      pricePerPassenger: 1299.99,
      totalDuration: '11h 15m',
      cabinClass: 'Premium Economy',
      isReward: false
    },
    passengerDetails: [
      {
        firstName: 'Dubori',
        lastName: 'Medhi',
        email: 'dubori.medhi@example.com',
        phone: '+1-555-789-0123'
      }
    ],
    checkInAvailable: false
  },
  {
    confirmationCode: 'CA901234',
    lastName: 'Siahaan',
    flight: {
      id: 'fl-1009',
      segments: [
        {
          id: 'seg-1012',
          airline: 'Copilot Airways',
          flightNumber: 'CA909',
          departureTime: '08:15',
          arrivalTime: '12:30',
          departureDate: getDateNDaysFromToday(12),
          arrivalDate: getDateNDaysFromToday(12),
          origin: { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas' },
          destination: { code: 'CUN', name: 'Cancún International Airport', city: 'Cancun' },
          duration: '4h 15m',
          stops: 0
        },
        {
          id: 'seg-1013',
          airline: 'Copilot Airways',
          flightNumber: 'CA910',
          departureTime: '13:45',
          arrivalTime: '17:55',
          departureDate: getDateNDaysFromToday(19),
          arrivalDate: getDateNDaysFromToday(19),
          origin: { code: 'CUN', name: 'Cancún International Airport', city: 'Cancun' },
          destination: { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas' },
          duration: '4h 10m',
          stops: 0
        }
      ],
      totalPrice: 649.99,
      pricePerPassenger: 649.99,
      totalDuration: '8h 25m',
      cabinClass: 'Economy',
      isReward: false
    },
    passengerDetails: [
      {
        firstName: 'Eka',
        lastName: 'Siahaan',
        email: 'eka.siahaan@example.com'
      },
      {
        firstName: 'Jostein',
        lastName: 'Siahaan',
        email: 'jostein.siahaan@example.com'
      }
    ],
    checkInAvailable: false
  },
  {
    confirmationCode: 'CA012345',
    lastName: 'Hegg',
    flight: {
      id: 'fl-1010',
      segments: [
        {
          id: 'seg-1014',
          airline: 'Copilot Airways',
          flightNumber: 'CA010',
          departureTime: '15:20',
          arrivalTime: '17:35',
          departureDate: getDateNDaysFromToday(13),
          arrivalDate: getDateNDaysFromToday(13),
          origin: { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas' },
          destination: { code: 'PDX', name: 'Portland International Airport', city: 'Portland' },
          duration: '2h 15m',
          stops: 0
        }
      ],
      totalPrice: 249.99,
      pricePerPassenger: 249.99,
      totalDuration: '2h 15m',
      cabinClass: 'Economy',
      isReward: false
    },
    passengerDetails: [
      {
        firstName: 'Hegg',
        lastName: 'Susanne',
        email: 'susanne.hegg@example.com',
        phone: '+1-555-234-5678'
      }
    ],
    checkInAvailable: false
  }
];

class BookingService {
  private bookings: BookingRecord[] = mockBookings;
  private travelGuideService: TravelGuideService;

  constructor() {
    this.travelGuideService = new TravelGuideService();
  }

  /**
   * Find a booking by confirmation code and last name
   */
  findBooking(confirmationCode: string, lastName: string): BookingRecord | null {
    const normalizedLastName = lastName.trim().toLowerCase();
    const normalizedConfirmationCode = confirmationCode.trim().toUpperCase();

    return this.bookings.find(
      booking => 
        booking.confirmationCode === normalizedConfirmationCode && 
        booking.lastName.toLowerCase() === normalizedLastName
    ) || null;
  }

  /**
   * Get travel guide information for a booking's destination
   */
  async getDestinationGuide(booking: BookingRecord) {
    // Get the destination city of the first segment (outbound flight)
    const destinationCity = booking.flight.segments[0].destination.city;
    
    try {
      // Try to get the travel guide for the destination
      const cityGuides = this.travelGuideService.getCityGuideData();
      return cityGuides.find(guide => guide.city.toLowerCase() === destinationCity.toLowerCase()) || null;
    } catch (error) {
      console.error('Error fetching destination guide:', error);
      return null;
    }
  }

  /**
   * Get baggage allowance information based on cabin class
   */
  getBaggageAllowance(cabinClass: string): { carryon: string; checked: string } {
    switch (cabinClass.toLowerCase()) {
      case 'economy':
        return {
          carryon: '1 personal item + 1 carry-on bag',
          checked: '1 checked bag (up to 50lbs)'
        };
      case 'premium economy':
        return {
          carryon: '1 personal item + 1 carry-on bag',
          checked: '2 checked bags (up to 50lbs each)'
        };
      case 'business':
        return {
          carryon: '1 personal item + 1 carry-on bag',
          checked: '2 checked bags (up to 70lbs each)'
        };
      case 'first':
        return {
          carryon: '1 personal item + 1 carry-on bag',
          checked: '3 checked bags (up to 70lbs each)'
        };
      default:
        return {
          carryon: '1 personal item + 1 carry-on bag',
          checked: '1 checked bag (up to 50lbs)'
        };
    }
  }
}

export default BookingService;