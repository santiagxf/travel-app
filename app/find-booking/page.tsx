"use client"

import React, { useState } from 'react'
import BookingService, { BookingRecord } from '@/lib/BookingService'
import CityGuide from '@/lib/types/CityGuide'
import FindBookingForm from '@/components/FindBookingForm'
import BookingDetails from '@/components/BookingDetails'

export default function FindBookingPage() {
  const [booking, setBooking] = useState<BookingRecord | null>(null)
  const [cityGuide, setCityGuide] = useState<CityGuide | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const bookingService = new BookingService()
  
  const handleFormSubmit = async (confirmationCode: string, lastName: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Search for the booking
      const foundBooking = bookingService.findBooking(confirmationCode, lastName)
      
      if (foundBooking) {
        setBooking(foundBooking)
        
        // Fetch destination guide info
        const guide = await bookingService.getDestinationGuide(foundBooking)
        setCityGuide(guide)
      } else {
        setError('No booking found with the provided confirmation code and last name.')
      }
    } catch (err) {
      setError('An error occurred while searching for your booking. Please try again.')
      console.error('Error finding booking:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleBackToForm = () => {
    setBooking(null)
    setCityGuide(null)
    setError(null)
  }
  
  return (
    <main className="w-full h-full flex items-center justify-center py-8 px-4">
      {/* Show booking details if a booking is found, otherwise show the form */}
      {booking ? (
        <BookingDetails 
          booking={booking} 
          cityGuide={cityGuide} 
          onBack={handleBackToForm} 
        />
      ) : (
        <FindBookingForm 
          onSubmit={handleFormSubmit} 
          isLoading={isLoading} 
          error={error} 
        />
      )}
    </main>
  )
}