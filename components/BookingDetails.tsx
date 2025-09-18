"use client"

import React, { useState } from 'react'
import { BookingRecord } from '@/lib/BookingService'
import CityGuide from '@/lib/types/CityGuide'

type CheckInStatus = 'not-available' | 'available' | 'completed'

type BookingDetailsProps = {
  booking: BookingRecord
  cityGuide: CityGuide | null
  onBack: () => void
}

const BookingDetails: React.FC<BookingDetailsProps> = ({
  booking,
  cityGuide,
  onBack
}) => {
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  
  // Get baggage allowance based on cabin class
  const getBaggageAllowance = (cabinClass: string) => {
    switch (cabinClass.toLowerCase()) {
      case 'economy':
        return {
          carryon: '1 personal item + 1 carry-on bag',
          checked: '1 checked bag (up to 50lbs)'
        }
      case 'premium economy':
        return {
          carryon: '1 personal item + 1 carry-on bag',
          checked: '2 checked bags (up to 50lbs each)'
        }
      case 'business':
        return {
          carryon: '1 personal item + 1 carry-on bag',
          checked: '2 checked bags (up to 70lbs each)'
        }
      case 'first':
        return {
          carryon: '1 personal item + 1 carry-on bag',
          checked: '3 checked bags (up to 70lbs each)'
        }
      default:
        return {
          carryon: '1 personal item + 1 carry-on bag',
          checked: '1 checked bag (up to 50lbs)'
        }
    }
  }
  
  // Format date to more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  // Determine check-in status
  const getCheckInStatus = (): CheckInStatus => {
    if (booking.checkInAvailable) {
      return 'available'
    }
    return 'not-available'
  }
  
  const checkInStatus = getCheckInStatus()
  
  type FlightSegment = {
    id: string;
    airline: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    departureDate: string;
    arrivalDate: string;
    origin: { code: string; city: string };
    destination: { code: string; city: string };
    duration: string;
    stops: number;
    stopLocations?: string[];
  }
  
  const renderFlightSegment = (segment: FlightSegment, index: number, isReturn: boolean = false) => {
    return (
      <div key={segment.id} className={`mb-6 rounded-lg bg-gray-50 p-5 border-b border-gray-200 ${isReturn ? 'bg-gray-100' : ''}`}> 
        <div className="flex justify-between items-center mb-2">
          {isReturn && <div className="inline-block px-3 py-1 bg-purple-900 text-white rounded-full text-xs mr-3">Return</div>}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
              {/* Placeholder for airline logo */}
              <span className="text-white font-bold">CA</span>
            </div>
            <div>
              <div className="font-semibold">{segment.airline}</div>
              <div className="text-sm text-gray-500">{segment.flightNumber}</div>
            </div>
          </div>
          <div className="text-green-600 font-medium">On Time</div>
        </div>
        <div className="flex justify-between items-center gap-4">
          <div className="text-center w-24">
            <div className="text-lg font-bold">{segment.departureTime}</div>
            <div className="text-xs text-gray-500">{formatDate(segment.departureDate)}</div>
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
            <div className="text-xs text-gray-500">{formatDate(segment.arrivalDate)}</div>
            <div className="mt-1">
              <div className="font-semibold">{segment.destination.code}</div>
              <div className="text-xs text-gray-500">{segment.destination.city}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const renderPassengerInfo = () => {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Passenger Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {booking.passengerDetails.map((passenger, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="font-semibold text-purple-900 mb-1">
                {passenger.firstName} {passenger.lastName}
              </div>
              {passenger.email && (
                <div className="text-sm text-gray-700"><span className="font-medium">Email:</span> {passenger.email}</div>
              )}
              {passenger.phone && (
                <div className="text-sm text-gray-700"><span className="font-medium">Phone:</span> {passenger.phone}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  const renderBaggageInfo = () => {
    const baggage = getBaggageAllowance(booking.flight.cabinClass)
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Baggage Information</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <div className="font-medium">Carry-on Allowance:</div>
            <div>{baggage.carryon}</div>
          </div>
          <div className="flex justify-between">
            <div className="font-medium">Checked Baggage:</div>
            <div>{baggage.checked}</div>
          </div>
        </div>
      </div>
    )
  }
  
  const renderTravelGuide = () => {
    if (!cityGuide) {
      return (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Travel Guide</h3>
          <p className="text-gray-600">Travel guide information is not available for this destination.</p>
        </div>
      )
    }
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Travel Guide: {cityGuide.city}</h3>
        <div className="mb-2 text-gray-700">{cityGuide.description}</div>
        <div>
          <h4 className="font-semibold mb-2 text-purple-900">Highlights</h4>
          <ul className="list-disc ml-6 text-gray-700">
            {cityGuide.highlights.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
  
  const renderCheckInModal = () => {
    if (!showCheckInModal) return null
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => setShowCheckInModal(false)}>
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center bg-purple-900 text-white px-5 py-3 rounded-t-lg">
            <h3 className="text-lg font-semibold">Check-in Not Available</h3>
            <button 
              className="text-2xl font-bold hover:text-purple-300 transition" 
              onClick={() => setShowCheckInModal(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">ℹ️</div>
            <p className="mb-2 text-gray-700">
              Online check-in for your flight will be available 24 hours before your scheduled departure.
            </p>
            <p className="text-gray-700">
              Please check back closer to your departure date.
            </p>
          </div>
          <div className="px-6 pb-6 flex justify-center">
            <button 
              className="bg-purple-900 text-white px-6 py-2 rounded font-semibold hover:bg-purple-800 transition" 
              onClick={() => setShowCheckInModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 mt-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 border-b pb-4">
        <button className="text-purple-900 font-semibold hover:underline mb-2 md:mb-0" onClick={onBack} aria-label="Go back">
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-center flex-1">Your Booking</h2>
        <div className="text-sm text-gray-700 mt-2 md:mt-0 md:text-right">
          Confirmation Code: <span className="font-semibold text-purple-900">{booking.confirmationCode}</span>
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <button 
          className="bg-purple-900 text-white px-6 py-2 rounded font-semibold hover:bg-purple-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => setShowCheckInModal(true)}
          disabled={checkInStatus !== 'available'}
        >
          {checkInStatus === 'completed' ? 'Checked In' : 'Check-in'}
        </button>
      </div>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Flight Details</h3>
        {/* Render outbound flight */}
        {booking.flight.segments.length > 0 && renderFlightSegment(booking.flight.segments[0], 0)}
        {/* If round trip, render return flight */}
        {booking.flight.segments.length > 1 && renderFlightSegment(booking.flight.segments[1], 1, true)}
        <div className="flex flex-col md:flex-row md:justify-between gap-4 bg-gray-50 rounded-lg p-4 mt-4">
          <div className="font-medium"><span className="text-gray-700">Cabin Class:</span> {booking.flight.cabinClass}</div>
          <div className="font-medium"><span className="text-gray-700">Price:</span> {booking.flight.isReward ? `${booking.flight.rewardPoints?.toLocaleString()} points` : `$${booking.flight.totalPrice}`}</div>
        </div>
      </div>
      {renderPassengerInfo()}
      {renderBaggageInfo()}
      {renderTravelGuide()}
      {renderCheckInModal()}
    </div>
  )
}

export default BookingDetails