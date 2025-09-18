"use client"

import React, { useState, useEffect, useCallback } from 'react'
import Image from "next/image";
import { useRouter } from 'next/navigation'
import { generateFlightOptions, FlightOption, FlightClass, airports } from '@/lib/flightDataGenerator'
import FlightBookingDetails from './FlightBookingDetails'

type TripType = 'round-trip' | 'one-way' | 'multi-city'
type CabinClass = 'economy' | 'premium-economy' | 'business' | 'first'

type CitySegment = {
  id: string;
  from: string;
  to: string;
  departDate: string;
}

type InitialValues = {
  from?: string;
  to?: string;
  tripType?: TripType;
  departDate?: string;
  returnDate?: string;
  passengers?: number;
  cabinClass?: CabinClass;
  searchRewards?: boolean;
  citySegments?: CitySegment[];
}

type SearchMode = 'initial' | 'results'

interface FindYourTripFormProps {
  initialSearchMode?: SearchMode;
  initialValues?: InitialValues;
  onSearchComplete?: () => void;
  hideResults?: boolean;
}

const cabinClassMap: Record<CabinClass, FlightClass> = {
  'economy': 'Economy',
  'premium-economy': 'Premium Economy',
  'business': 'Business',
  'first': 'First'
}

const FindYourTripForm: React.FC<FindYourTripFormProps> = ({ 
  initialSearchMode = 'initial',
  initialValues = {},
  onSearchComplete,
  hideResults = false
}) => {
  const router = useRouter()
  
  // Trip type state
  const [tripType, setTripType] = useState<TripType>(initialValues.tripType || 'round-trip')
  
  // From/To state for round-trip and one-way
  const [from, setFrom] = useState<string>(initialValues.from || 'SFO')
  const [to, setTo] = useState<string>(initialValues.to || 'NYC')
  
  // Date states
  const [departDate, setDepartDate] = useState<string>(initialValues.departDate || '')
  const [returnDate, setReturnDate] = useState<string>(initialValues.returnDate || '')
  
  // Multi-city segments state
  const [citySegments, setCitySegments] = useState<CitySegment[]>(
    initialValues.citySegments || [
      { id: '1', from: 'SFO', to: 'NYC', departDate: '' },
      { id: '2', from: 'NYC', to: 'SFO', departDate: '' }
    ]
  )
  
  // Cabin class and reward flight states
  const [cabinClass, setCabinClass] = useState<CabinClass>(initialValues.cabinClass || 'economy')
  const [searchRewards, setSearchRewards] = useState<boolean>(initialValues.searchRewards || false)
  
  // Passengers state
  const [passengers, setPassengers] = useState<number>(initialValues.passengers || 1)
  
  // Search results state
  const [searchResults, setSearchResults] = useState<FlightOption[] | null>(null)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Selected flight state
  const [selectedFlight, setSelectedFlight] = useState<FlightOption | null>(null)

  // Determine if we're in results mode (with collapsed form)
  const [searchMode, setSearchMode] = useState<SearchMode>(initialSearchMode)


  // Perform the actual search operation
  const performSearch = useCallback(() => {
    setIsSearching(true)
    
    // Simulate API delay
    setTimeout(() => {
      try {
        let results: FlightOption[] = []
        
        if (tripType === 'round-trip') {
          results = generateFlightOptions(
            from, 
            to, 
            departDate, 
            returnDate,
            cabinClassMap[cabinClass],
            undefined,
            searchRewards,
            false, // bypassCache
            passengers // pass passenger count
          )
        } else if (tripType === 'one-way') {
          results = generateFlightOptions(
            from, 
            to, 
            departDate, 
            undefined,
            cabinClassMap[cabinClass],
            undefined,
            searchRewards,
            false, // bypassCache
            passengers // pass passenger count
          )
        } else if (tripType === 'multi-city') {
          const segments = citySegments.map(segment => ({
            origin: segment.from,
            destination: segment.to,
            date: segment.departDate
          }))
          
          results = generateFlightOptions(
            '', 
            '', 
            '', 
            undefined,
            cabinClassMap[cabinClass],
            segments,
            searchRewards,
            false, // bypassCache
            passengers // pass passenger count
          )
        }
        
        // Filter out non-reward flights if searching for rewards only
        if (searchRewards) {
          results = results.filter(flight => flight.isReward)
        }
        
        setSearchResults(results)
        
        if (results.length === 0) {
          setSearchError("No flights found for your search criteria. Please try different dates or destinations.")
        } else {
          // Set mode to results which shows collapsed form
          setSearchMode('results')
          
          // Scroll to search results
          setTimeout(() => {
            const resultsElement = document.querySelector('.search-results')
            if (resultsElement) {
              resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }, 100)
        }
      } catch (error) {
        setSearchError("An error occurred while searching for flights. Please try again.")
        console.error(error)
      } finally {
        setIsSearching(false)
        // Notify parent component that search is complete
        if (onSearchComplete) {
          onSearchComplete()
        }
      }
    }, 1000)
  }, [from, to, departDate, returnDate, tripType, cabinClass, citySegments, searchRewards, onSearchComplete, passengers])

  // Initialize dates on component mount if not provided
  useEffect(() => {
    // Only set default dates if they weren't provided
    if (!departDate || !returnDate) {
      const today = new Date()
      const departure = new Date(today)
      departure.setDate(today.getDate() + 7)
      const returnD = new Date(departure)
      returnD.setDate(departure.getDate() + 7)

      const formatDate = (date: Date) => date.toISOString().split('T')[0]
      
      if (!departDate) setDepartDate(formatDate(departure))
      if (!returnDate) setReturnDate(formatDate(returnD))
      
      // Initialize multi-city dates as well if not provided
      if (!initialValues.citySegments) {
        setCitySegments(prevSegments => 
          prevSegments.map((segment, index) => ({
            ...segment,
            departDate: segment.departDate || formatDate(new Date(departure.getTime() + index * 7 * 24 * 60 * 60 * 1000))
          }))
        )
      }
    }
    
    // If we're in results mode, immediately perform a search with the initial values
    if (initialSearchMode === 'results') {
      // Use a flag to prevent double searches
      const timeoutId = setTimeout(() => {
        performSearch()
      }, 0)
      
      return () => clearTimeout(timeoutId)
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departDate, returnDate, initialValues.citySegments, initialSearchMode])

  // Handle trip type selection
  const handleTripTypeChange = (type: TripType) => {
    setTripType(type)
    // Reset search results when changing trip type
    setSearchResults(null)
    setSearchError(null)
    setSelectedFlight(null)
    setSearchMode('initial')
  }

  // Handle adding a new segment for multi-city
  const handleAddSegment = () => {
    if (citySegments.length >= 5) {
      setSearchError("Maximum of 5 flight segments allowed.")
      return
    }
    
    const lastSegment = citySegments[citySegments.length - 1]
    const newSegmentDate = new Date(lastSegment.departDate)
    newSegmentDate.setDate(newSegmentDate.getDate() + 3)
    
    setCitySegments([
      ...citySegments, 
      { 
        id: (citySegments.length + 1).toString(), 
        from: lastSegment.to, 
        to: from, 
        departDate: newSegmentDate.toISOString().split('T')[0]
      }
    ])
  }

  // Handle removing a segment for multi-city
  const handleRemoveSegment = (id: string) => {
    if (citySegments.length <= 2) {
      setSearchError("At least 2 flight segments are required for multi-city trips.")
      return
    }
    
    setCitySegments(citySegments.filter(segment => segment.id !== id))
    setSearchError(null)
  }

  // Handle updating a multi-city segment
  const handleUpdateSegment = (id: string, field: 'from' | 'to' | 'departDate', value: string) => {
    setCitySegments(citySegments.map(segment => 
      segment.id === id ? { ...segment, [field]: value } : segment
    ))
  }

  // Validate the form before searching
  const validateForm = (): boolean => {
    setSearchError(null)
    
    if (tripType === 'round-trip' || tripType === 'one-way') {
      if (from === to) {
        setSearchError("Origin and destination cannot be the same.")
        return false
      }
      
      if (!departDate) {
        setSearchError("Please select a departure date.")
        return false
      }
      
      if (tripType === 'round-trip' && !returnDate) {
        setSearchError("Please select a return date.")
        return false
      }
      
      if (tripType === 'round-trip' && new Date(returnDate) < new Date(departDate)) {
        setSearchError("Return date cannot be before departure date.")
        return false
      }
    } else if (tripType === 'multi-city') {
      for (let i = 0; i < citySegments.length; i++) {
        const segment = citySegments[i]
        
        if (segment.from === segment.to) {
          setSearchError(`Segment ${i+1}: Origin and destination cannot be the same.`)
          return false
        }
        
        if (!segment.departDate) {
          setSearchError(`Segment ${i+1}: Please select a departure date.`)
          return false
        }
        
        if (i > 0) {
          const prevSegment = citySegments[i-1]
          if (new Date(segment.departDate) < new Date(prevSegment.departDate)) {
            setSearchError(`Segment ${i+1}: Departure date cannot be before the previous segment's departure date.`)
            return false
          }
        }
      }
    }
    
    return true
  }

  // Navigate to search results page with parameters
  const navigateToSearchResults = () => {
    // Build query parameters
    const params = new URLSearchParams()
    params.set('from', from)
    params.set('to', to)
    params.set('tripType', tripType)
    params.set('departDate', departDate)
    
    if (tripType === 'round-trip') {
      params.set('returnDate', returnDate)
    }
    
    params.set('passengers', passengers.toString())
    params.set('cabinClass', cabinClass)
    
    if (searchRewards) {
      params.set('rewards', 'true')
    }
    
    if (tripType === 'multi-city') {
      // Serialize city segments to JSON
      params.set('segments', JSON.stringify(citySegments))
    }
    
    // Navigate to search page with parameters
    router.push(`/search?${params.toString()}`)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Navigate to search results page
    navigateToSearchResults()
  }

  // Handle search from collapsed form
  const handleCollapsedSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Directly perform the search without navigating
    performSearch()
  }

  // Effect to filter results when searchRewards changes without a full search
  useEffect(() => {
    // Only filter if we already have search results and not currently searching
    if (searchResults && !isSearching) {
      if (searchRewards) {
        // Filter for reward flights only
        setSearchResults(prevResults => 
          prevResults ? prevResults.filter(flight => flight.isReward) : null
        )
        
        // Show error if no reward flights after filtering
        if (searchResults.filter(flight => flight.isReward).length === 0) {
          setSearchError("No reward flights found for your search criteria. Try a different route or date.")
        } else {
          setSearchError(null)
        }
      } else {
        // If checkbox is unchecked, do a new search to get all flights
        performSearch()
      }
    }
  // Only trigger when searchRewards changes, not on every render or when searchResults changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchRewards])

  // Handle selecting a flight
  const handleSelectFlight = (flight: FlightOption) => {
    setSelectedFlight(flight)
    // Scroll to top for better user experience
    window.scrollTo(0, 0)
  }

  // Handle going back from flight details
  const handleBackToResults = () => {
    setSelectedFlight(null)
  }

  // Handle expanding the form again
  const handleExpandForm = () => {
    // Navigate back to the home page with the form
    router.push('/')
  }

  if (selectedFlight) {
    return (
      <FlightBookingDetails
        selectedFlight={selectedFlight}
        tripType={tripType}
        passengers={passengers}
        onBack={handleBackToResults}
      />
    )
  }

  return (
    <div className={searchMode === 'initial' ? "page-container home" : "w-full max-w-6xl mx-auto"}>
      <div className={searchMode === 'initial' ? "content" : "w-full"}>
        {/* Collapsed Form View (shown in results mode) */}
        {searchMode === 'results' ? (
          <div className="w-full bg-[#3B1F4D] rounded-lg shadow-md px-8 py-6 mb-6">
            <form onSubmit={handleCollapsedSearch} className="relative">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                {/* Trip Type Tag */}
                <div className="flex items-center mr-2">
                  <span className="inline-block px-4 py-2.5 bg-white/20 text-white rounded text-sm font-medium">
                    {tripType === 'round-trip' ? 'Round Trip' : 
                     tripType === 'one-way' ? 'One Way' : 'Multi-City'}
                  </span>
                </div>
                
                {/* From/To Fields */}
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <label htmlFor="collapsed-from" className="text-white text-xs font-medium mb-1.5">From</label>
                    <select 
                      id="collapsed-from" 
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className="w-40 p-2.5 rounded bg-white border-none text-gray-900 text-sm focus:ring-2 focus:ring-white/50 focus:outline-none"
                      aria-label="Origin airport"
                    >
                      {Object.entries(airports).map(([code, airport]) => (
                        <option key={code} value={code}>{airport.city} ({code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="collapsed-to" className="text-white text-xs font-medium mb-1.5">To</label>
                    <select 
                      id="collapsed-to" 
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="w-40 p-2.5 rounded bg-white border-none text-gray-900 text-sm focus:ring-2 focus:ring-white/50 focus:outline-none"
                      aria-label="Destination airport"
                    >
                      {Object.entries(airports).map(([code, airport]) => (
                        <option key={code} value={code}>{airport.city} ({code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date Fields */}
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <label htmlFor="collapsed-depart" className="text-white text-xs font-medium mb-1.5">Depart</label>
                    <input 
                      type="date" 
                      id="collapsed-depart" 
                      value={departDate}
                      onChange={(e) => setDepartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-40 p-2.5 rounded bg-white border-none text-gray-900 text-sm focus:ring-2 focus:ring-white/50 focus:outline-none"
                      aria-label="Departure date"
                    />
                  </div>

                  {tripType === 'round-trip' && (
                    <div className="flex flex-col">
                      <label htmlFor="collapsed-return" className="text-white text-xs font-medium mb-1.5">Return</label>
                      <input 
                        type="date" 
                        id="collapsed-return"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={departDate}
                        className="w-40 p-2.5 rounded bg-white border-none text-gray-900 text-sm focus:ring-2 focus:ring-white/50 focus:outline-none"
                        aria-label="Return date"
                      />
                    </div>
                  )}
                </div>

                {/* Passengers */}
                <div className="flex flex-col">
                  <label htmlFor="collapsed-passengers" className="text-white text-xs font-medium mb-1.5">Passengers</label>
                  <select 
                    id="collapsed-passengers" 
                    value={passengers}
                    onChange={(e) => setPassengers(parseInt(e.target.value))}
                    className="w-28 p-2.5 rounded bg-white border-none text-gray-900 text-sm focus:ring-2 focus:ring-white/50 focus:outline-none"
                    aria-label="Number of passengers"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                {/* Class */}
                <div className="flex flex-col">
                  <label htmlFor="collapsed-class" className="text-white text-xs font-medium mb-1.5">Class</label>
                  <select 
                    id="collapsed-class" 
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                    className="w-44 p-2.5 rounded bg-white border-none text-gray-900 text-sm focus:ring-2 focus:ring-white/50 focus:outline-none"
                    aria-label="Cabin class"
                  >
                    <option value="economy">Economy</option>
                    <option value="premium-economy">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First</option>
                  </select>
                </div>

                {/* Reward Flights Option */}
                <div className="flex items-end h-[42px] ml-2">
                  <label className="flex items-center text-white text-sm cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={searchRewards}
                      onChange={(e) => setSearchRewards(e.target.checked)}
                      className="mr-2 w-4 h-4 rounded bg-white border-none text-[#3B1F4D] focus:ring-2 focus:ring-white/50"
                      aria-label="Search reward flights only"
                    />
                    <span>Rewards</span>
                  </label>
                </div>

                {/* Search and Reset Buttons */}
                <div className="flex space-x-3 ml-auto">
                  <button 
                    type="submit"
                    className="!h-[42px] !w-auto !px-6 rounded !bg-white !text-[#3B1F4D] font-medium text-sm whitespace-nowrap hover:!bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    disabled={isSearching}
                    aria-label="Search for flights"
                    style={{backgroundColor: 'white', color: '#3B1F4D', width: 'auto', height: '42px'}}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                  <button 
                    type="button"
                    className="!h-[42px] !w-auto !px-6 rounded !bg-white !text-[#3B1F4D] font-medium text-sm whitespace-nowrap hover:!bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    onClick={handleExpandForm}
                    aria-label="Show full search form"
                    style={{backgroundColor: 'white', color: '#3B1F4D', width: 'auto', height: '42px'}}
                  >
                    Full Form
                  </button>
                </div>
              </div>
              
              {/* Display error if any */}
              {searchError && (
                <div className="mt-4 p-3 rounded bg-red-500/80 text-white font-medium backdrop-blur" role="alert" aria-live="polite">
                  {searchError}
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="flex flex-wrap w-full">
            <div className="hero-text w-full md:w-1/2">
              <h1>Where Your Journey Takes Flight</h1>
            </div>
            <div className="search-trip w-full md:w-1/2 z-20">
              <div className="form mx-auto max-w-md">
                <form onSubmit={handleSubmit}>
                  <div className="trip">
                    <nav>
                      <ul>
                        <li className={tripType === 'round-trip' ? 'selected' : ''}>
                          <label>
                            <input
                              type="radio"
                              name="tripType"
                              value="round-trip"
                              checked={tripType === 'round-trip'}
                              onChange={() => handleTripTypeChange('round-trip')}
                              className="oneway"
                            />
                            Round Trip
                          </label>
                        </li>
                        
                        <li className={tripType === 'one-way' ? 'selected' : ''}>
                          <label>
                            <input
                              type="radio"
                              name="tripType"
                              value="one-way"
                              checked={tripType === 'one-way'}
                              onChange={() => handleTripTypeChange('one-way')}
                              className="oneway"
                            />
                            One Way
                          </label>
                        </li>

                        <li className={tripType === 'multi-city' ? 'selected' : ''}>
                          <label>
                            <input
                              type="radio"
                              name="tripType"
                              value="multi-city"
                              checked={tripType === 'multi-city'}
                              onChange={() => handleTripTypeChange('multi-city')}
                              className="oneway"
                            />
                            Multi-City
                          </label>
                        </li>
                      </ul>
                    </nav>
                  </div>

                  {/* Round Trip and One Way Form Fields */}
                  {(tripType === 'round-trip' || tripType === 'one-way') && (
                    <>
                      <div className="fields-container">
                        <label htmlFor="from">From</label>
                        <select 
                          id="from" 
                          name="from" 
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                        >
                          {Object.entries(airports).map(([code, airport]) => (
                            <option key={code} value={code}>{airport.city} ({code})</option>
                          ))}
                        </select>
                      </div>

                      <div className="fields-container">
                        <label htmlFor="to">To</label>
                        <select 
                          id="to" 
                          name="to" 
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                        >
                          {Object.entries(airports).map(([code, airport]) => (
                            <option key={code} value={code}>{airport.city} ({code})</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="date-container">
                        <div>
                          <label htmlFor="depart">Depart</label>
                          <input 
                            type="date" 
                            id="depart" 
                            name="depart" 
                            value={departDate}
                            onChange={(e) => setDepartDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                        <div 
                          style={{ marginLeft: '12px' }}
                          className={tripType === 'one-way' ? 'date-disabled' : ''}
                        >
                          <label htmlFor="returnDate">Return</label>
                          <input
                            type="date"
                            id="returnDate"
                            name="returnDate"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            disabled={tripType === 'one-way'}
                            min={departDate}
                            required={tripType === 'round-trip'}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Multi-City Form Fields */}
                  {tripType === 'multi-city' && (
                    <div className="multi-city-container">
                      {citySegments.map((segment, index) => (
                        <div key={segment.id} className="multi-city-segment">
                          <div className="segment-header">
                            <h3>Flight {index + 1}</h3>
                            {citySegments.length > 2 && (
                              <button 
                                type="button"
                                className="remove-segment"
                                onClick={() => handleRemoveSegment(segment.id)}
                                aria-label={`Remove flight segment ${index + 1}`}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          
                          <div className="fields-container">
                            <label htmlFor={`from-${segment.id}`}>From</label>
                            <select 
                              id={`from-${segment.id}`} 
                              value={segment.from}
                              onChange={(e) => handleUpdateSegment(segment.id, 'from', e.target.value)}
                            >
                              {Object.entries(airports).map(([code, airport]) => (
                                <option key={code} value={code}>{airport.city} ({code})</option>
                              ))}
                            </select>
                          </div>

                          <div className="fields-container">
                            <label htmlFor={`to-${segment.id}`}>To</label>
                            <select 
                              id={`to-${segment.id}`} 
                              value={segment.to}
                              onChange={(e) => handleUpdateSegment(segment.id, 'to', e.target.value)}
                            >
                              {Object.entries(airports).map(([code, airport]) => (
                                <option key={code} value={code}>{airport.city} ({code})</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="fields-container">
                            <label htmlFor={`depart-${segment.id}`}>Depart</label>
                            <input 
                              type="date" 
                              id={`depart-${segment.id}`} 
                              value={segment.departDate}
                              onChange={(e) => handleUpdateSegment(segment.id, 'departDate', e.target.value)}
                              min={index > 0 ? citySegments[index - 1].departDate : new Date().toISOString().split('T')[0]}
                              required
                            />
                          </div>
                        </div>
                      ))}
                      
                      <button 
                        type="button" 
                        className="add-segment-btn"
                        onClick={handleAddSegment}
                        disabled={citySegments.length >= 5}
                      >
                        + Add another flight
                      </button>
                    </div>
                  )}
                  
                  <div className="form-footer">
                    <div className="fields-container">
                      <label htmlFor="passengers">Passengers</label>
                      <select 
                        id="passengers" 
                        value={passengers}
                        onChange={(e) => setPassengers(parseInt(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="fields-container">
                      <label htmlFor="class">Cabin Class</label>
                      <select 
                        id="class" 
                        name="class" 
                        value={cabinClass}
                        onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                      >
                        <option value="economy">Economy</option>
                        <option value="premium-economy">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First</option>
                      </select>
                    </div>

                    <div className="checkbox-container">
                      <input 
                        type="checkbox" 
                        id="rewards" 
                        name="rewards" 
                        checked={searchRewards}
                        onChange={(e) => setSearchRewards(e.target.checked)}
                      />
                      <label htmlFor="rewards">Search reward flights</label>
                    </div>
                  </div>
                  
                  {searchError && (
                    <div className="error-message">
                      {searchError}
                    </div>
                  )}
                  
                  <button type="submit" disabled={isSearching}>
                    {isSearching ? 'Searching...' : 'Find your trip'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Flight Search Results */}
      {searchResults && searchResults.length > 0 && !hideResults && (
        <div className="search-results mx-auto w-full max-w-4xl bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold mb-6 text-[#3B1F4D]">Found {searchResults.length} flights</h2>
          
          {searchResults.map((flight) => (
            <div key={flight.id} className="flight-option">
              <div className="flight-option-header">
                <div className="flight-price">
                  {flight.isReward ? (
                    <span className="reward-points">{(flight.rewardPoints || 0).toLocaleString()} points</span>
                  ) : (
                    <span>${Math.max(0, isNaN(flight.totalPrice) ? 0 : Math.round(flight.totalPrice)).toLocaleString()}</span>
                  )}
                  <span className="cabin-class">{flight.cabinClass}</span>
                </div>
                <div className="flight-duration">
                  Total duration: {flight.totalDuration}
                </div>
              </div>
              
              {flight.segments.map((segment, index) => (
                <div key={segment.id} className="flight-segment">
                  {tripType === 'round-trip' && index === 1 && (
                    <div className="segment-label">Return</div>
                  )}
                  
                  {tripType === 'multi-city' && (
                    <div className="segment-label">Flight {index + 1}</div>
                  )}
                  
                  <div className="segment-details">
                    <div className="airline-info">
                      <div className="airline-logo">
                        {segment.airlineLogo ? (
                          <Image src={segment.airlineLogo} width={40} height={40} alt={segment.airline} className="w-full h-full object-contain" />
                        ) : (
                          <div className="airline-logo-placeholder">{segment.airline.substring(0, 2)}</div>
                        )}
                      </div>
                      <div>
                        <div className="airline-name">{segment.airline}</div>
                        <div className="flight-number">{segment.flightNumber}</div>
                      </div>
                    </div>
                    
                    <div className="flight-route">
                      <div className="departure">
                        <div className="time">{segment.departureTime}</div>
                        <div className="airport">{segment.origin.code}</div>
                        <div className="date">{new Date(segment.departureDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                      </div>
                      
                      <div className="flight-path">
                        <div className="duration">{segment.duration}</div>
                        <div className="path-line"></div>
                        <div className="stops">
                          {segment.stops === 0 ? (
                            <span>Nonstop</span>
                          ) : (
                            <span>{segment.stops} {segment.stops === 1 ? 'stop' : 'stops'}{segment.stopLocations ? `: ${segment.stopLocations.join(', ')}` : ''}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="arrival">
                        <div className="time">{segment.arrivalTime}</div>
                        <div className="airport">{segment.destination.code}</div>
                        <div className="date">{new Date(segment.arrivalDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flight-option-footer">
                <button 
                  className="select-flight-btn" 
                  onClick={() => handleSelectFlight(flight)}
                  type="button"
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FindYourTripForm