import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FindBookingForm from '../FindBookingForm';

describe('FindBookingForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders correctly', () => {
    render(<FindBookingForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByText('Find My Booking')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmation Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /find booking/i })).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'No booking found with these details';
    render(<FindBookingForm onSubmit={mockOnSubmit} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('validates confirmation code format', () => {
    render(<FindBookingForm onSubmit={mockOnSubmit} />);
    
    const confirmationInput = screen.getByLabelText('Confirmation Code');
    const lastNameInput = screen.getByLabelText('Last Name');
    const submitButton = screen.getByRole('button', { name: /find booking/i });
    
    // Empty input
    fireEvent.change(confirmationInput, { target: { value: '' } });
    fireEvent.change(lastNameInput, { target: { value: 'Reddington' } });
    fireEvent.click(submitButton);
    expect(screen.getByText('Confirmation code is required')).toBeInTheDocument();
    
    // Invalid format
    fireEvent.change(confirmationInput, { target: { value: 'ABC123' } });
    fireEvent.click(submitButton);
    expect(screen.getByText(/invalid format/i)).toBeInTheDocument();
  });

  it('validates last name is not empty', () => {
    render(<FindBookingForm onSubmit={mockOnSubmit} />);
    
    const confirmationInput = screen.getByLabelText('Confirmation Code');
    const lastNameInput = screen.getByLabelText('Last Name');
    const submitButton = screen.getByRole('button', { name: /find booking/i });
    
    fireEvent.change(confirmationInput, { target: { value: 'CA123456' } });
    fireEvent.change(lastNameInput, { target: { value: '' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
  });

  it('submits the form with valid inputs', () => {
    render(<FindBookingForm onSubmit={mockOnSubmit} />);
    
    const confirmationInput = screen.getByLabelText('Confirmation Code');
    const lastNameInput = screen.getByLabelText('Last Name');
    const submitButton = screen.getByRole('button', { name: /find booking/i });
    
    fireEvent.change(confirmationInput, { target: { value: 'CA123456' } });
    fireEvent.change(lastNameInput, { target: { value: 'Reddington' } });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith('CA123456', 'Reddington');
  });

  it('disables the submit button when isLoading is true', () => {
    render(<FindBookingForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    const submitButton = screen.getByRole('button');
    
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Searching...');
  });
});