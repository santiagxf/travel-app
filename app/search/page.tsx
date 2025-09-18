"use client"

import React, { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import FindYourTripForm from '@/components/FindYourTripForm'

type TripType = 'round-trip' | 'one-way' | 'multi-city'
type CabinClass = 'economy' | 'business' | 'first' | 'premium-economy'

// Search content component that uses useSearchParams
function SearchContent() {
  const searchParams = useSearchParams()
  const [, setIsLoading] = useState(true)
  // Control the visibility of the search form until results are ready
  const [showForm, setShowForm] = useState(false)
  
  // Get search parameters from URL
  const from = searchParams.get('from') || 'SFO'
  const to = searchParams.get('to') || 'NYC'
  const tripType = searchParams.get('tripType') || 'round-trip'
  const departDate = searchParams.get('departDate') || ''
  const returnDate = searchParams.get('returnDate') || ''
  const passengers = parseInt(searchParams.get('passengers') || '1')
  const cabinClass = searchParams.get('cabinClass') || 'economy'
  const searchRewards = searchParams.get('rewards') === 'true'
  
  // For multi-city, we'd need to parse the segments from JSON in the URL
  let citySegments = []
  const segmentsParam = searchParams.get('segments')
  
  if (segmentsParam) {
    try {
      citySegments = JSON.parse(segmentsParam)
    } catch (e) {
      console.error('Failed to parse segments from URL', e)
    }
  }

  // Handle loading state completion
  const handleSearchComplete = () => {
    setIsLoading(false)
    setShowForm(true) // Show form once the search is complete and results are ready
  }

  return (
    <div className="w-full max-w-6xl px-4 py-8">
      {/* Only show the form when results are ready */}
      {showForm ? (
        <div className="w-full max-w-4xl mx-auto mb-8">
          <FindYourTripForm 
            initialSearchMode="results"
            initialValues={{
              from,
              to,
              tripType: tripType as TripType,
              departDate,
              returnDate,
              cabinClass: cabinClass as CabinClass,
              passengers,
              searchRewards,
              citySegments: citySegments.length > 0 ? citySegments : undefined
            }}
            hideResults={false} // Never hide results once they're ready
          />
        </div>
      ) : (
        // Hidden form that will perform the search but not be visible
        <div className="hidden">
          <FindYourTripForm 
            initialSearchMode="results"
            initialValues={{
              from,
              to,
              tripType: tripType as TripType,
              departDate,
              returnDate,
              cabinClass: cabinClass as CabinClass,
              passengers,
              searchRewards,
              citySegments: citySegments.length > 0 ? citySegments : undefined
            }}
            onSearchComplete={handleSearchComplete}
            hideResults={true}
          />
        </div>
      )}
      
      {/* Loading indicator while results are being prepared */}
      {!showForm && (
        <div className="flex flex-col items-center justify-center min-h-[200px] w-full max-w-md mx-auto p-8 bg-white/90 rounded-lg shadow-md">
          <div className="flex gap-3 mb-6">
            <span className="w-4 h-4 rounded-full bg-purple-900 opacity-70 animate-pulse" />
            <span className="w-4 h-4 rounded-full bg-purple-900 opacity-70 animate-pulse delay-150" />
            <span className="w-4 h-4 rounded-full bg-purple-900 opacity-70 animate-pulse delay-300" />
          </div>
          <div className="text-lg font-medium text-purple-900">Searching for the best flights...</div>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="loading">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  )
}