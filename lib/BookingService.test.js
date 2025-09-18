// lib/BookingService.test.js
import BookingService, { mockBookings } from './BookingService';

describe('BookingService', () => {
  let bookingService;

  beforeEach(() => {
    bookingService = new BookingService();
  });

  describe('findBooking', () => {
    it('should find a booking with valid confirmation code and last name', () => {
      const booking = bookingService.findBooking('CA123456', 'Reddington');
      expect(booking).not.toBeNull();
      expect(booking.confirmationCode).toBe('CA123456');
      expect(booking.lastName).toBe('Reddington');
    });

    it('should handle case insensitivity for last name', () => {
      const booking = bookingService.findBooking('CA123456', 'reddington');
      expect(booking).not.toBeNull();
      expect(booking.confirmationCode).toBe('CA123456');
    });

    it('should normalize whitespace and formatting in input', () => {
      const booking = bookingService.findBooking(' CA123456 ', ' Reddington ');
      expect(booking).not.toBeNull();
      expect(booking.confirmationCode).toBe('CA123456');
    });

    it('should return null for invalid confirmation code', () => {
      const booking = bookingService.findBooking('CA999999', 'Reddington');
      expect(booking).toBeNull();
    });

    it('should return null for invalid last name', () => {
      const booking = bookingService.findBooking('CA123456', 'Jones');
      expect(booking).toBeNull();
    });
  });

  describe('getBaggageAllowance', () => {
    it('should return correct baggage allowance for Economy class', () => {
      const allowance = bookingService.getBaggageAllowance('Economy');
      expect(allowance.carryon).toBe('1 personal item + 1 carry-on bag');
      expect(allowance.checked).toBe('1 checked bag (up to 50lbs)');
    });

    it('should return correct baggage allowance for Premium Economy class', () => {
      const allowance = bookingService.getBaggageAllowance('Premium Economy');
      expect(allowance.carryon).toBe('1 personal item + 1 carry-on bag');
      expect(allowance.checked).toBe('2 checked bags (up to 50lbs each)');
    });

    it('should return correct baggage allowance for Business class', () => {
      const allowance = bookingService.getBaggageAllowance('Business');
      expect(allowance.carryon).toBe('1 personal item + 1 carry-on bag');
      expect(allowance.checked).toBe('2 checked bags (up to 70lbs each)');
    });

    it('should return correct baggage allowance for First class', () => {
      const allowance = bookingService.getBaggageAllowance('First');
      expect(allowance.carryon).toBe('1 personal item + 1 carry-on bag');
      expect(allowance.checked).toBe('3 checked bags (up to 70lbs each)');
    });

    it('should be case insensitive when determining baggage allowance', () => {
      const allowance = bookingService.getBaggageAllowance('business');
      expect(allowance.checked).toBe('2 checked bags (up to 70lbs each)');
    });
  });

  // Testing the mock data
  describe('mockBookings', () => {
    it('should have at least 10 bookings', () => {
      expect(mockBookings.length).toBeGreaterThanOrEqual(10);
    });

    it('should have valid data in each booking', () => {
      for (const booking of mockBookings) {
        expect(booking).toHaveProperty('confirmationCode');
        expect(booking).toHaveProperty('lastName');
        expect(booking).toHaveProperty('flight');
        expect(booking).toHaveProperty('passengerDetails');
        expect(Array.isArray(booking.passengerDetails)).toBe(true);
        expect(booking.passengerDetails.length).toBeGreaterThan(0);
      }
    });
  });
});