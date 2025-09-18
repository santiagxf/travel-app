// lib/utils/PaymentValidationUtils.ts
// Utility functions for validating credit card details

/**
 * Card type definitions with validation information
 */
export type CardType = {
    name: string;
    pattern: RegExp;
    format: RegExp;
    maxLength: number;
    cvvLength: number;
};

// Define common credit card types with their validation patterns
export const CARD_TYPES: CardType[] = [
    {
        name: 'Visa',
        pattern: /^4/,
        format: /(\d{1,4})/g,
        maxLength: 19,
        cvvLength: 3
    },
    {
        name: 'Mastercard',
        pattern: /^(5[1-5]|2[2-7])/,
        format: /(\d{1,4})/g,
        maxLength: 16,
        cvvLength: 3
    },
    {
        name: 'American Express',
        pattern: /^3[47]/,
        format: /(\d{1,4})/g,
        maxLength: 15,
        cvvLength: 4
    },
    {
        name: 'Discover',
        pattern: /^(6011|65|64[4-9]|622)/,
        format: /(\d{1,4})/g,
        maxLength: 16,
        cvvLength: 3
    }
];

/**
 * Validates if the card holder name is properly formatted
 * - Must not be empty
 * - Must contain only letters, spaces, hyphens, and apostrophes
 * - Must be at least 2 characters
 * 
 * @param name The cardholder name to validate
 * @returns boolean indicating if the name is valid
 */
export function isValidCardName(name: string): boolean {
    // Check if name is not empty and has at least 2 characters
    if (!name || name.trim().length < 2) {
        return false;
    }
    
    // Allow only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[A-Za-z\s\-']+$/;
    return nameRegex.test(name);
}

/**
 * Determines the card type based on the card number
 * 
 * @param number The credit card number
 * @returns The card type or undefined if not recognized
 */
export function getCardType(number: string): CardType | undefined {
    // Remove all non-digit characters
    const cleanNumber = number.replace(/\D/g, '');
    
    // Find the matching card type based on pattern
    return CARD_TYPES.find(card => card.pattern.test(cleanNumber));
}

/**
 * Validates a credit card number using the Luhn algorithm and card type rules
 * 
 * @param number The credit card number to validate
 * @returns boolean indicating if the card number is valid
 */
export function isValidCardNumber(number: string): boolean {
    if (!number) return false;
    
    // Remove all non-digit characters
    const cleanNumber = number.replace(/\D/g, '');
    
    // Check if empty or has non-digit characters
    if (cleanNumber.length === 0) {
        return false;
    }
    
    // Check against known card types
    const cardType = getCardType(cleanNumber);
    if (!cardType) {
        return false;
    }
    
    // Check length based on card type
    if (cleanNumber.length > cardType.maxLength) {
        return false;
    }
    
    // Skip Luhn check if the number is not complete yet
    if (cleanNumber.length < 13) {
        return false;
    }
    
    // Implementation of the Luhn algorithm (mod 10)
    // Reverse the card number for easier processing
    const digits = cleanNumber.split('').reverse();
    
    // Convert to numbers and apply Luhn algorithm
    const sum = digits.reduce((acc, digit, index) => {
        let num = parseInt(digit, 10);
        
        // Double every second digit
        if (index % 2 === 1) {
            num *= 2;
            // If doubling results in a number > 9, subtract 9
            if (num > 9) {
                num -= 9;
            }
        }
        
        return acc + num;
    }, 0);
    
    // Valid card number if sum is divisible by 10
    return sum % 10 === 0;
}

/**
 * Formats a credit card number with spaces for display
 * 
 * @param number The credit card number to format
 * @returns Formatted credit card number
 */
export function formatCardNumber(number: string): string {
    if (!number) return '';
    
    // Remove all non-digit characters
    const cleanNumber = number.replace(/\D/g, '');
    
    // Get card type to determine format
    const cardType = getCardType(cleanNumber) || CARD_TYPES[0]; // Default to Visa format
    
    // Format the number with spaces
    return cleanNumber.replace(cardType.format, '$1 ').trim();
}

/**
 * Validates if the expiry date is properly formatted and not expired
 * - Must be in MM/YY format
 * - Must be a future date
 * 
 * @param expiry The expiry date to validate in MM/YY format
 * @returns boolean indicating if the expiry date is valid
 */
export function isValidExpiryDate(expiry: string): boolean {
    if (!expiry) return false;
    
    // Check format (MM/YY)
    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!expiryRegex.test(expiry.replace(/\s/g, ''))) {
        return false;
    }
    
    // Extract month and year
    const parts = expiry.replace(/\s/g, '').split('/');
    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10) + 2000; // Assume 20xx
    
    // Create date object for the last day of the provided month
    const expiryDate = new Date(year, month, 0);
    const today = new Date();
    
    // Set the current date to the beginning of the month for proper comparison
    const currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Check if expiry date is in the future
    return expiryDate >= currentDate;
}

/**
 * Formats an expiry date input by adding a slash after the month
 * 
 * @param expiry The expiry date input
 * @returns Formatted expiry date
 */
export function formatExpiryDate(expiry: string): string {
    // Remove all non-digit characters
    const cleanExpiry = expiry.replace(/\D/g, '');
    
    if (cleanExpiry.length < 3) {
        return cleanExpiry;
    }
    
    // Format as MM/YY
    return `${cleanExpiry.substring(0, 2)}/${cleanExpiry.substring(2, 4)}`;
}

/**
 * Validates if the CVV is properly formatted based on card type
 * - Must be all digits
 * - Length must match card type (usually 3, but 4 for Amex)
 * 
 * @param cvv The CVV to validate
 * @param cardNumber The associated card number to determine card type
 * @returns boolean indicating if the CVV is valid
 */
export function isValidCVV(cvv: string, cardNumber?: string): boolean {
    if (!cvv) return false;
    
    // Remove any non-digit characters
    const cleanCVV = cvv.replace(/\D/g, '');
    
    // Must contain only digits
    if (!/^\d+$/.test(cleanCVV)) {
        return false;
    }
    
    // Determine expected CVV length based on card type
    let expectedLength = 3; // Default for most cards
    
    if (cardNumber) {
        const cardType = getCardType(cardNumber);
        if (cardType) {
            expectedLength = cardType.cvvLength;
        }
    }
    
    // Check if CVV has correct length
    return cleanCVV.length === expectedLength;
}
