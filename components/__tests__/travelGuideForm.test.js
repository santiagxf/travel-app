import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TravelGuideForm from '../travelGuideForm';

describe('TravelGuideForm', () => {
  it('renders form fields', () => {
    render(<TravelGuideForm />);
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add Highlight')).toBeInTheDocument();
  });

  it('can add a highlight', () => {
    render(<TravelGuideForm />);
    const addButton = screen.getByRole('button', { name: '+' });
    fireEvent.click(addButton);
    expect(screen.getAllByPlaceholderText('Add Highlight').length).toBeGreaterThan(1);
  });
});
