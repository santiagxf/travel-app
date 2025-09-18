"use client"

import React, { useState } from 'react'

type FindBookingFormProps = {
  onSubmit: (confirmationCode: string, lastName: string) => void
  isLoading?: boolean
  error?: string | null
}

const FindBookingForm: React.FC<FindBookingFormProps> = ({
  onSubmit,
  isLoading = false,
  error = null
}) => {
  const [confirmationCode, setConfirmationCode] = useState('')
  const [lastName, setLastName] = useState('')
  const [formErrors, setFormErrors] = useState({
    confirmationCode: '',
    lastName: ''
  })

  const validateForm = (): boolean => {
    let valid = true
    const errors = {
      confirmationCode: '',
      lastName: ''
    }

    // Validate confirmation code - should match pattern CA###### (CA followed by 6 digits)
    if (!confirmationCode.trim()) {
      errors.confirmationCode = 'Confirmation code is required'
      valid = false
    } else if (!/^CA\d{6}$/i.test(confirmationCode.trim())) {
      errors.confirmationCode = 'Invalid format. Should be CA followed by 6 digits (e.g., CA123456)'
      valid = false
    }

    // Validate last name - should not be empty
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required'
      valid = false
    }

    setFormErrors(errors)
    return valid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(confirmationCode.trim(), lastName.trim())
    }
  }

  return (
    <div className="flex justify-center items-center w-full max-w-lg mx-auto">
      <div className="w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-purple-900 mb-4 text-center">Find My Booking</h2>
        <p className="mb-6 text-center text-gray-600">
          Enter your confirmation code and last name to access your booking information.
        </p>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center font-medium">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="confirmationCode" className="block font-medium mb-1">Confirmation Code</label>
            <input
              type="text"
              id="confirmationCode"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              placeholder="e.g., CA123456"
              aria-invalid={!!formErrors.confirmationCode}
              aria-describedby={formErrors.confirmationCode ? 'confirmationCodeError' : undefined}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
            />
            {formErrors.confirmationCode && (
              <div id="confirmationCodeError" className="text-red-600 text-sm mt-1">
                {formErrors.confirmationCode}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block font-medium mb-1">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              aria-invalid={!!formErrors.lastName}
              aria-describedby={formErrors.lastName ? 'lastNameError' : undefined}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
            />
            {formErrors.lastName && (
              <div id="lastNameError" className="text-red-600 text-sm mt-1">
                {formErrors.lastName}
              </div>
            )}
          </div>
          <button 
            type="submit" 
            className="bg-purple-900 text-white font-semibold py-2 rounded hover:bg-purple-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Find Booking'}
          </button>
        </form>
        <div className="mt-8 border-t pt-4 text-sm text-gray-500">
          <details>
            <summary className="cursor-pointer text-purple-900 font-semibold">Test Credentials</summary>
            <p className="mt-2">For testing purposes, you can use the following credentials:</p>
            <ul className="list-disc ml-6 mt-2">
              <li><strong>CA123456</strong> / <strong>Reddington</strong></li>
              <li><strong>CA456789</strong> / <strong>Langreo</strong></li>
              <li><strong>CA345678</strong> / <strong>Brady</strong></li>
              <li><strong>CA234567</strong> / <strong>Woodward</strong></li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  )
}

export default FindBookingForm