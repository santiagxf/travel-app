"use client"

import Image from "next/image";
import React, { useState } from 'react'
import { FlightOption, FlightSegment } from '@/lib/flightDataGenerator'
import { 
  isValidCardName, 
  isValidCardNumber, 
  isValidCVV, 
  isValidExpiryDate, 
  formatCardNumber, 
  formatExpiryDate,
  getCardType
} from "@/lib/utils/PaymentValidationUtils";

// Types for booking steps and passenger info
type BookingStep = 'passenger-info' | 'payment' | 'confirmation'

type PassengerInfo = {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
}

type ValidationError = {
  hasError: boolean;
  message: string;
}

type PaymentFormErrors = {
  cardName: ValidationError;
  cardNumber: ValidationError;
  expiry: ValidationError;
  cvv: ValidationError;
}

type TouchedFields = {
  cardName: boolean;
  cardNumber: boolean;
  expiry: boolean;
  cvv: boolean;
}

type FlightBookingDetailsProps = {
  selectedFlight: FlightOption
  tripType: 'round-trip' | 'one-way' | 'multi-city'
  passengers: number
  onBack: () => void
}

const FlightBookingDetails: React.FC<FlightBookingDetailsProps> = ({
  selectedFlight,
  tripType,
  passengers,
  onBack
}) => {
  // State for booking progress and data
  const [currentStep, setCurrentStep] = useState<BookingStep>('passenger-info')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingReference, setBookingReference] = useState('')
  const [bookingComplete, setBookingComplete] = useState(false)
  
  // State for passenger information (array for each passenger)
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo[]>(
    Array(passengers).fill({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: ''
    })
  )
  
  // Update a specific field for a specific passenger
  const updatePassengerInfo = (index: number, field: keyof PassengerInfo, value: string) => {
    const newPassengerInfo = [...passengerInfo]
    newPassengerInfo[index] = {
      ...newPassengerInfo[index],
      [field]: value
    }
    setPassengerInfo(newPassengerInfo)
  }
  
  // Validate that all required passenger fields are filled before proceeding
  const validatePassengerInfo = () => {
    for (let i = 0; i < passengers; i++) {
      const passenger = passengerInfo[i]
      if (!passenger.firstName || !passenger.lastName || !passenger.email) {
        return false
      }
    }
    return true
  }

  // State for payment form fields
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCVV] = useState('');
  
  // State for tracking validation errors
  const [errors, setErrors] = useState<PaymentFormErrors>({
    cardName: { hasError: false, message: '' },
    cardNumber: { hasError: false, message: '' },
    expiry: { hasError: false, message: '' },
    cvv: { hasError: false, message: '' }
  });
  
  // State for tracking which fields have been touched
  const [touched, setTouched] = useState<TouchedFields>({
    cardName: false,
    cardNumber: false,
    expiry: false,
    cvv: false
  });
  
  // Mark a field as touched when focused
  const handleFieldFocus = (field: keyof TouchedFields) => {
    setTouched({
      ...touched,
      [field]: true
    });
  };

  // Validate credit card name
  const validateCardName = (name: string) => {
    if (!isValidCardName(name)) {
      setErrors(prev => ({
        ...prev,
        cardName: {
          hasError: true,
          message: name.trim() === '' 
            ? 'Cardholder name is required' 
            : 'Please enter a valid name (letters, spaces, hyphens, and apostrophes only)'
        }
      }));
      return false;
    } else {
      setErrors(prev => ({
        ...prev,
        cardName: { hasError: false, message: '' }
      }));
      return true;
    }
  };
  
  // Validate credit card number
  const validateCardNumber = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    
    if (cleanNumber.length === 0) {
      setErrors(prev => ({
        ...prev,
        cardNumber: {
          hasError: true,
          message: 'Card number is required'
        }
      }));
      return false;
    }
    
    const cardType = getCardType(cleanNumber);
    if (!cardType) {
      setErrors(prev => ({
        ...prev,
        cardNumber: {
          hasError: true,
          message: 'Unrecognized card type'
        }
      }));
      return false;
    }
    
    if (!isValidCardNumber(number)) {
      setErrors(prev => ({
        ...prev,
        cardNumber: {
          hasError: true,
          message: cleanNumber.length < cardType.maxLength
            ? `Please enter a complete card number (${cardType.maxLength} digits for ${cardType.name})`
            : 'Invalid card number'
        }
      }));
      return false;
    } else {
      setErrors(prev => ({
        ...prev,
        cardNumber: { hasError: false, message: '' }
      }));
      return true;
    }
  };
  
  // Validate expiry date
  const validateExpiryDate = (expiryDate: string) => {
    if (!isValidExpiryDate(expiryDate)) {
      setErrors(prev => ({
        ...prev,
        expiry: {
          hasError: true,
          message: expiryDate.trim() === '' 
            ? 'Expiry date is required' 
            : !expiryDate.includes('/') || expiryDate.length < 5
              ? 'Use MM/YY format'
              : 'Expiry date must be in the future'
        }
      }));
      return false;
    } else {
      setErrors(prev => ({
        ...prev,
        expiry: { hasError: false, message: '' }
      }));
      return true;
    }
  };
  
  // Validate CVV
  const validateCVV = (cvvValue: string, cardNumberValue: string) => {
    if (!isValidCVV(cvvValue, cardNumberValue)) {
      const cardType = getCardType(cardNumberValue.replace(/\D/g, ''));
      const expectedLength = cardType ? cardType.cvvLength : 3;
      
      setErrors(prev => ({
        ...prev,
        cvv: {
          hasError: true,
          message: cvvValue.trim() === '' 
            ? 'CVV is required' 
            : `CVV must be ${expectedLength} digits`
        }
      }));
      return false;
    } else {
      setErrors(prev => ({
        ...prev,
        cvv: { hasError: false, message: '' }
      }));
      return true;
    }
  };
  
  // Handle card name change
  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardName(value);
    if (touched.cardName) {
      validateCardName(value);
    }
  };
  
  // Handle card number change with formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove existing spaces to prevent double spacing
    const rawValue = value.replace(/\s/g, '');
    // Only proceed if input is numeric or empty (for backspace)
    if (/^[\d\s]*$/.test(value) || value === '') {
      const formattedValue = formatCardNumber(rawValue);
      setCardNumber(formattedValue);
      if (touched.cardNumber) {
        validateCardNumber(formattedValue);
      }
    }
  };
  
  // Handle expiry date change with formatting
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only proceed if input is numeric or / or empty (for backspace)
    if (/^[\d/]*$/.test(value) || value === '') {
      const cleanValue = value.replace(/\//g, '');
      if (cleanValue.length <= 4) {
        const formattedValue = formatExpiryDate(cleanValue);
        setExpiry(formattedValue);
        if (touched.expiry) {
          validateExpiryDate(formattedValue);
        }
      }
    }
  };
  
  // Handle CVV change
  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only proceed if input is numeric or empty (for backspace)
    if (/^\d*$/.test(value) || value === '') {
      // Limit CVV length to 4 digits max (for AMEX)
      if (value.length <= 4) {
        setCVV(value);
        if (touched.cvv) {
          validateCVV(value, cardNumber);
        }
      }
    }
  };

  // Validate credit card details 
  const validatePaymentInfo = () => {
    // Validate all fields and update error states
    const nameValid = validateCardName(cardName);
    const numberValid = validateCardNumber(cardNumber);
    const expiryValid = validateExpiryDate(expiry);
    const cvvValid = validateCVV(cvv, cardNumber);
    
    // Mark all fields as touched
    setTouched({
      cardName: true,
      cardNumber: true,
      expiry: true,
      cvv: true
    });
    
    return nameValid && numberValid && expiryValid && cvvValid;
  }

  // Handle navigation between booking steps
  const navigateToStep = (step: BookingStep) => {
    // Only allow navigation to confirmation if booking is complete
    // Also if the payment information is complete
    if (step === 'confirmation' && !bookingComplete) return;
    // Only allow navigation to payment if passenger info is valid
    if (step === 'payment' && !validatePassengerInfo()) return;
    setCurrentStep(step);
  }
  
  // Get credit card type name for display
  const getCardTypeName = () => {
    if (!cardNumber) return null;
    const type = getCardType(cardNumber);
    return type ? type.name : null;
  }

  // Handle form submission for booking steps
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault()
    // Move to payment if passenger info is valid
    if (currentStep === 'passenger-info' && validatePassengerInfo()) {
      setCurrentStep('payment')
    } else if (currentStep === 'payment' && validatePaymentInfo()) {
      setIsSubmitting(true)
      // Make the API call to process the booking
      setTimeout(() => {
        // Generate random booking reference
        const reference = `CA${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
        setBookingReference(reference)
        setBookingComplete(true)
        setIsSubmitting(false)
        setCurrentStep('confirmation')
      }, 1500)
    }
  }
  
  // Render a single flight segment summary
  const renderSegment = (segment: FlightSegment, index: number) => {
    return (
      <div key={segment.id} className="mb-6 rounded-lg bg-gray-50 p-5 border-b border-gray-200">
        {tripType === 'round-trip' && index === 1 && (
          <div className="inline-block px-3 py-1 bg-purple-900 text-white rounded-full text-xs mb-3">Return</div>
        )}
        {tripType === 'multi-city' && (
          <div className="inline-block px-3 py-1 bg-purple-900 text-white rounded-full text-xs mb-3">Flight {index + 1}</div>
        )}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                {segment.airlineLogo ? (
                  <Image src={segment.airlineLogo} alt={`${segment.airline} logo`} width={40} height={40} className="w-full h-full object-contain rounded-full" />
                ) : (
                  <span className="text-white font-bold">CA</span>
                )}
              </div>
              <div>
                <div className="font-semibold">{segment.airline}</div>
                <div className="text-sm text-gray-500">{segment.flightNumber}</div>
              </div>
            </div>
            <div className="font-medium text-right">
              {segment.duration}
              {segment.stops > 0 && (
                <span className="ml-2 inline-block bg-gray-200 text-xs text-gray-700 rounded-full px-2 py-0.5">{segment.stops} {segment.stops === 1 ? 'stop' : 'stops'}</span>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="text-center w-24">
              <div className="text-lg font-bold">{segment.departureTime}</div>
              <div className="text-xs text-gray-500">{new Date(segment.departureDate).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
              <div className="mt-1">
                <div className="font-semibold">{segment.origin.code}</div>
                <div className="text-xs text-gray-500">{segment.origin.city}</div>
              </div>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2 rounded-full relative">
              {segment.stops > 0 && segment.stopLocations && (
                <div className="absolute left-1/2 top-[-18px] -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">Stops: {segment.stopLocations.join(', ')}</div>
              )}
            </div>
            <div className="text-center w-24">
              <div className="text-lg font-bold">{segment.arrivalTime}</div>
              <div className="text-xs text-gray-500">{new Date(segment.arrivalDate).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
              <div className="mt-1">
                <div className="font-semibold">{segment.destination.code}</div>
                <div className="text-xs text-gray-500">{segment.destination.city}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Render form fields for a single passenger
  const renderPassengerForm = (index: number) => {
    const passenger = passengerInfo[index]
    
    return (
      <div key={index} className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-purple-900 border-b pb-2">
          Passenger {index + 1}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label htmlFor={`firstName-${index}`} className="text-sm font-medium text-gray-700 mb-1">
              First Name*
            </label>
            <input
              type="text"
              id={`firstName-${index}`}
              value={passenger.firstName}
              onChange={(e) => !bookingComplete && updatePassengerInfo(index, 'firstName', e.target.value)}
              required
              readOnly={bookingComplete}
              className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${bookingComplete ? "bg-gray-100 text-gray-600" : ""}`}
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor={`lastName-${index}`} className="text-sm font-medium text-gray-700 mb-1">
              Last Name*
            </label>
            <input
              type="text"
              id={`lastName-${index}`}
              value={passenger.lastName}
              onChange={(e) => !bookingComplete && updatePassengerInfo(index, 'lastName', e.target.value)}
              required
              readOnly={bookingComplete}
              className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${bookingComplete ? "bg-gray-100 text-gray-600" : ""}`}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label htmlFor={`email-${index}`} className="text-sm font-medium text-gray-700 mb-1">
              Email*
            </label>
            <input
              type="email"
              id={`email-${index}`}
              value={passenger.email}
              onChange={(e) => !bookingComplete && updatePassengerInfo(index, 'email', e.target.value)}
              required
              readOnly={bookingComplete}
              className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${bookingComplete ? "bg-gray-100 text-gray-600" : ""}`}
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor={`phone-${index}`} className="text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id={`phone-${index}`}
              value={passenger.phone}
              onChange={(e) => !bookingComplete && updatePassengerInfo(index, 'phone', e.target.value)}
              readOnly={bookingComplete}
              className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${bookingComplete ? "bg-gray-100 text-gray-600" : ""}`}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor={`dob-${index}`} className="text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id={`dob-${index}`}
              value={passenger.dateOfBirth}
              onChange={(e) => !bookingComplete && updatePassengerInfo(index, 'dateOfBirth', e.target.value)}
              readOnly={bookingComplete}
              className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${bookingComplete ? "bg-gray-100 text-gray-600" : ""}`}
            />
          </div>
        </div>
        
        {index === 0 && (
          <p className="text-xs text-gray-500 mt-4">* Required fields</p>
        )}
      </div>
    )
  }
  
  // Render the payment form
  const renderPaymentForm = () => {
    const cardTypeName = getCardTypeName();
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-purple-900 border-b pb-2">
          Credit Card Information
        </h3>
        
        <div className="flex flex-col mb-4">
          <label htmlFor="cardName" className="text-sm font-medium text-gray-700 mb-1">
            Name on Card*
          </label>
          <input 
            type="text" 
            id="cardName" 
            name="cardName" 
            required 
            readOnly={bookingComplete}
            aria-invalid={errors.cardName.hasError}
            aria-describedby={errors.cardName.hasError ? "cardName-error" : undefined}
            className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.cardName.hasError && touched.cardName ? 
                "border-red-500 focus:ring-red-500 focus:border-red-500" : 
                "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            } ${bookingComplete ? "bg-gray-100 text-gray-600" : ""}`}
            onChange={handleCardNameChange}
            onFocus={() => handleFieldFocus('cardName')}
            value={cardName}
          />
          {errors.cardName.hasError && touched.cardName && (
            <p id="cardName-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.cardName.message}
            </p>
          )}
        </div>
        
        <div className="flex flex-col mb-4">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">
              Card Number*
            </label>
            {cardTypeName && (
              <span className="text-sm text-purple-600 font-medium">
                {cardTypeName}
              </span>
            )}
          </div>
          <input 
            type="text" 
            id="cardNumber" 
            name="cardNumber" 
            placeholder="XXXX XXXX XXXX XXXX" 
            required 
            readOnly={bookingComplete}
            aria-invalid={errors.cardNumber.hasError}
            aria-describedby={errors.cardNumber.hasError ? "cardNumber-error" : undefined}
            className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.cardNumber.hasError && touched.cardNumber ? 
                "border-red-500 focus:ring-red-500 focus:border-red-500" : 
                "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            } ${bookingComplete ? "bg-gray-100 text-gray-600" : ""}`}
            onChange={handleCardNumberChange}
            onFocus={() => handleFieldFocus('cardNumber')}
            value={cardNumber}
          />
          {errors.cardNumber.hasError && touched.cardNumber && (
            <p id="cardNumber-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.cardNumber.message}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label htmlFor="expiry" className="text-sm font-medium text-gray-700 mb-1">
              Expiry Date*
            </label>
            <input 
              type="text" 
              id="expiry" 
              name="expiry" 
              placeholder="MM/YY" 
              required 
              readOnly={bookingComplete}
              aria-invalid={errors.expiry.hasError}
              aria-describedby={errors.expiry.hasError ? "expiry-error" : undefined}
              className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.expiry.hasError && touched.expiry ? 
                  "border-red-500 focus:ring-red-500 focus:border-red-500" : 
                  "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
              } ${bookingComplete ? "bg-gray-100 text-gray-600" : ""}`}
              onChange={handleExpiryChange}
              onFocus={() => handleFieldFocus('expiry')}
              value={expiry}
            />
            {errors.expiry.hasError && touched.expiry && (
              <p id="expiry-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.expiry.message}
              </p>
            )}
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="cvv" className="text-sm font-medium text-gray-700 mb-1">
              CVV*
            </label>
            <input 
              type="text" 
              id="cvv" 
              name="cvv" 
              placeholder={cardTypeName === 'American Express' ? 'XXXX' : 'XXX'} 
              required 
              readOnly={bookingComplete}
              aria-invalid={errors.cvv.hasError}
              aria-describedby={errors.cvv.hasError ? "cvv-error" : undefined}
              className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.cvv.hasError && touched.cvv ? 
                  "border-red-500 focus:ring-red-500 focus:border-red-500" : 
                  "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
              } ${bookingComplete ? "bg-gray-100 text-gray-600" : ""}`}
              onChange={handleCVVChange}
              onFocus={() => handleFieldFocus('cvv')}
              value={cvv}
            />
            {errors.cvv.hasError && touched.cvv && (
              <p id="cvv-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.cvv.message}
              </p>
            )}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">* Required fields</p>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h4 className="text-sm font-medium mb-2">Payment Summary</h4>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal:</span>
            <span>
              {selectedFlight.isReward 
                ? `${selectedFlight.rewardPoints?.toLocaleString()} points` 
                : `$${selectedFlight.totalPrice}`
              }
            </span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>
              {selectedFlight.isReward 
                ? `${selectedFlight.rewardPoints?.toLocaleString()} points` 
                : `$${selectedFlight.totalPrice}`
              }
            </span>
          </div>
        </div>
      </div>
    )
  }
  
  // Render confirmation UI after successful booking
  const renderConfirmation = () => {
    return (
      <div className="flex flex-col items-center p-8 max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Booking Confirmed</h2>
        <p className="mb-6 text-gray-600">Your booking reference is: <strong className="text-purple-900 font-medium">{bookingReference}</strong></p>
        <p className="mb-8 text-gray-600">A confirmation email has been sent to {passengerInfo[0].email || "your email address"}</p>
        
        <div className="w-full bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-lg mb-4 pb-2 border-b border-gray-200">Booking Details</h3>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Passengers:</span>
            <span className="font-medium">{passengers}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Class:</span>
            <span className="font-medium">{selectedFlight.cabinClass}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Price:</span>
            <span className="font-medium">
              {selectedFlight.isReward 
                ? `${selectedFlight.rewardPoints?.toLocaleString()} points` 
                : `$${selectedFlight.totalPrice}`
              }
            </span>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="booking-details-container w-full bg-gray-50">
      <div className="booking-form-wrapper max-w-6xl mx-auto w-[90%]">
        <div className="booking-header">
          {!bookingComplete && (
            <button className="back-button" onClick={onBack} type="button">
              ← Back to search results
            </button>
          )}
          <h2>
            {currentStep === 'passenger-info' && 'Enter Passenger Information'}
            {currentStep === 'payment' && 'Payment Details'}
            {currentStep === 'confirmation' && 'Booking Complete'}
          </h2>
        </div>
        
        <div className="booking-progress">
          <div
            className={`progress-step ${currentStep === 'passenger-info' ? 'active' : ''} ${(currentStep === 'payment' || currentStep === 'confirmation') ? 'completed' : ''}`}
            onClick={() => navigateToStep('passenger-info')}
            style={{ cursor: 'pointer' }}
            aria-current={currentStep === 'passenger-info'}
          >
            1. Passenger Details
          </div>
          <div
            className={`progress-step ${currentStep === 'payment' ? 'active' : ''} ${currentStep === 'confirmation' ? 'completed' : ''} ${!validatePassengerInfo() ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => navigateToStep('payment')}
            aria-disabled={!validatePassengerInfo()}
            style={{ cursor: validatePassengerInfo() ? 'pointer' : 'not-allowed' }}
          >
            2. Payment
          </div>
          <div
            className={`progress-step ${currentStep === 'confirmation' ? 'active' : ''} ${!bookingComplete ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => navigateToStep('confirmation')}
            aria-disabled={!bookingComplete}
            style={{ cursor: bookingComplete ? 'pointer' : 'not-allowed' }}
          >
            3. Confirmation
          </div>
        </div>
        
        {currentStep !== 'confirmation' ? (
          <div className="booking-form-content">
            {bookingComplete && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6" style={{ gridColumn: "span 2" }}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You&apos;ve already completed your booking. Information in this section cannot be edited.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flight-summary">
              <h3 className="text-lg font-semibold mb-4">Flight Summary</h3>
              {selectedFlight.segments.map((segment, index) => 
                renderSegment(segment, index)
              )}
              
              <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-800 font-medium">Total price:</span>
                  <span className="text-xl font-bold text-purple-900">
                    {selectedFlight.isReward 
                      ? `${selectedFlight.rewardPoints?.toLocaleString()} points` 
                      : `$${selectedFlight.totalPrice}`
                    }
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Includes all taxes and fees
                </div>
              </div>
            </div>
            
            <form className="booking-form" onSubmit={handleSubmitBooking} noValidate>
              {currentStep === 'passenger-info' && (
                <div className="passenger-info">
                  {Array.from({ length: passengers }).map((_, index) => 
                    renderPassengerForm(index)
                  )}
                </div>
              )}
              
              {currentStep === 'payment' && (
                <div className="payment-info">
                  {renderPaymentForm()}
                </div>
              )}
              
              <div className="mt-6">
                {currentStep === 'passenger-info' && (
                  <button 
                    type="submit" 
                    className="w-full bg-purple-900 text-white py-3 px-6 rounded-md font-medium hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                  >
                    Continue to Payment
                  </button>
                )}
                
                {currentStep === 'payment' && (
                  <button 
                    type={bookingComplete ? "button" : "submit"} 
                    className={`w-full py-3 px-6 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                      isSubmitting 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-purple-900 hover:bg-purple-800 text-white focus:ring-purple-500"
                    }`}
                    disabled={isSubmitting}
                    onClick={bookingComplete ? () => navigateToStep('confirmation') : undefined}
                  >
                    {isSubmitting 
                      ? 'Processing...' 
                      : (bookingComplete 
                          ? 'Continue to Confirmation' 
                          : 'Complete Booking')
                    }
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6">
            {renderConfirmation()}
          </div>
        )}
      </div>
    </div>
  )
}

export default FlightBookingDetails