// lib/utils/PaymentValidationUtils.test.ts
import {
  isValidCardName,
  isValidCardNumber,
  isValidExpiryDate,
  isValidCVV,
  formatCardNumber,
  formatExpiryDate,
  getCardType
} from './PaymentValidationUtils';

describe('Payment Validation Utilities', () => {
  describe('Card Name Validation', () => {
    test('should validate proper card names', () => {
      expect(isValidCardName('John Doe')).toBe(true);
      expect(isValidCardName('Jane Smith-Jones')).toBe(true);
      expect(isValidCardName("O'Connor")).toBe(true);
    });

    test('should reject invalid card names', () => {
      expect(isValidCardName('')).toBe(false);
      expect(isValidCardName('J')).toBe(false);
      expect(isValidCardName('John123')).toBe(false);
      expect(isValidCardName('John@Doe')).toBe(false);
    });
  });

  describe('Card Number Validation', () => {
    test('should validate valid card numbers', () => {
      // Valid test card numbers for different card types
      expect(isValidCardNumber('4111 1111 1111 1111')).toBe(true); // Visa
      expect(isValidCardNumber('5555555555554444')).toBe(true); // Mastercard
      expect(isValidCardNumber('378282246310005')).toBe(true); // American Express
      expect(isValidCardNumber('6011111111111117')).toBe(true); // Discover
    });

    test('should reject invalid card numbers', () => {
      expect(isValidCardNumber('')).toBe(false);
      expect(isValidCardNumber('1234')).toBe(false); // Too short
      expect(isValidCardNumber('1234567890123456')).toBe(false); // Invalid pattern
      expect(isValidCardNumber('4111111111111112')).toBe(false); // Invalid checksum
    });

    test('should handle formatted card numbers', () => {
      expect(isValidCardNumber('4111-1111-1111-1111')).toBe(true);
      expect(isValidCardNumber('4111 1111 1111 1111')).toBe(true);
    });
  });

  describe('Card Type Detection', () => {
    test('should identify Visa cards', () => {
      const cardType = getCardType('4111111111111111');
      expect(cardType?.name).toBe('Visa');
    });

    test('should identify Mastercard', () => {
      const cardType = getCardType('5555555555554444');
      expect(cardType?.name).toBe('Mastercard');
    });

    test('should identify American Express', () => {
      const cardType = getCardType('378282246310005');
      expect(cardType?.name).toBe('American Express');
    });

    test('should identify Discover', () => {
      const cardType = getCardType('6011111111111117');
      expect(cardType?.name).toBe('Discover');
    });

    test('should return undefined for unknown card types', () => {
      const cardType = getCardType('9999999999999999');
      expect(cardType).toBeUndefined();
    });
  });

  describe('Card Number Formatting', () => {
    test('should format card numbers with proper spacing', () => {
      expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
      expect(formatCardNumber('378282246310005')).toBe('3782 8224 6310 005');
    });

    test('should handle partially entered card numbers', () => {
      expect(formatCardNumber('41111')).toBe('4111 1');
      expect(formatCardNumber('3782')).toBe('3782');
    });
  });

  describe('Expiry Date Validation', () => {
    test('should validate future expiry dates', () => {
      // Mock the current date to a fixed point for testing
      const realDate = Date;
      global.Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            // Mock current date to 2023-01-01
            return new realDate(2023, 0, 1);
          }
          return new realDate(...args);
        }
      };

      expect(isValidExpiryDate('01/24')).toBe(true);
      expect(isValidExpiryDate('12/23')).toBe(true);

      // Restore the original Date
      global.Date = realDate;
    });

    test('should reject past expiry dates', () => {
      // Mock the current date to a fixed point for testing
      const realDate = Date;
      global.Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            // Mock current date to 2023-01-01
            return new realDate(2023, 0, 1);
          }
          return new realDate(...args);
        }
      };

      expect(isValidExpiryDate('01/22')).toBe(false);
      expect(isValidExpiryDate('12/22')).toBe(false);

      // Restore the original Date
      global.Date = realDate;
    });

    test('should reject invalid date formats', () => {
      expect(isValidExpiryDate('')).toBe(false);
      expect(isValidExpiryDate('1223')).toBe(false);
      expect(isValidExpiryDate('13/23')).toBe(false); // Invalid month
      expect(isValidExpiryDate('ab/cd')).toBe(false);
    });
  });

  describe('Expiry Date Formatting', () => {
    test('should format expiry date with a slash', () => {
      expect(formatExpiryDate('1223')).toBe('12/23');
      expect(formatExpiryDate('0125')).toBe('01/25');
    });

    test('should handle partially entered expiry dates', () => {
      expect(formatExpiryDate('12')).toBe('12');
      expect(formatExpiryDate('1')).toBe('1');
    });
  });

  describe('CVV Validation', () => {
    test('should validate CVV for different card types', () => {
      expect(isValidCVV('123', '4111111111111111')).toBe(true); // Visa
      expect(isValidCVV('123', '5555555555554444')).toBe(true); // Mastercard
      expect(isValidCVV('1234', '378282246310005')).toBe(true); // American Express
      expect(isValidCVV('123', '6011111111111117')).toBe(true); // Discover
    });

    test('should reject invalid CVVs', () => {
      expect(isValidCVV('')).toBe(false);
      expect(isValidCVV('12')).toBe(false); // Too short
      expect(isValidCVV('12345')).toBe(false); // Too long
      expect(isValidCVV('abc')).toBe(false); // Non-numeric
      expect(isValidCVV('12a')).toBe(false); // Contains non-numeric
    });

    test('should validate CVV according to card type rules', () => {
      expect(isValidCVV('123', '4111111111111111')).toBe(true); // 3 digits for Visa
      expect(isValidCVV('1234', '4111111111111111')).toBe(false); // 4 digits not valid for Visa
      
      expect(isValidCVV('1234', '378282246310005')).toBe(true); // 4 digits for Amex
      expect(isValidCVV('123', '378282246310005')).toBe(false); // 3 digits not valid for Amex
    });
  });
});