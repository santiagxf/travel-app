import React from 'react';
import { render, screen } from '@testing-library/react';
import PointsActivityTable from '../pointsActivityTable';

describe('PointsActivityTable', () => {
  it('renders activity data', () => {
    const data = [
      { description: 'Earned', date: '2024-01-01', points: 100 },
      { description: 'Spent', date: '2024-01-02', points: -50 },
    ];
    render(<PointsActivityTable activityData={data} />);
    expect(screen.getByText('Earned')).toBeInTheDocument();
    expect(screen.getByText('Spent')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('-50')).toBeInTheDocument();
  });
});
