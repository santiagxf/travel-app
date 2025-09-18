import React from 'react';
import { render, screen } from '@testing-library/react';
import TravelGuideMap from '../TravelGuideMap';

// Mock leaflet's map container and related browser APIs for Jest
global.URL.createObjectURL = jest.fn();
jest.mock('react-leaflet', () => {
  const actual = jest.requireActual('react-leaflet');
  const mockDisable = jest.fn();
  return {
    ...actual,
    MapContainer: ({ children }) => <div role="region">{children}</div>,
    GeoJSON: () => <div>GeoJSON</div>,
    CircleMarker: () => <div>CircleMarker</div>,
    useMap: () => ({
      dragging: { disable: mockDisable },
      touchZoom: { disable: mockDisable },
      doubleClickZoom: { disable: mockDisable },
      scrollWheelZoom: { disable: mockDisable },
      boxZoom: { disable: mockDisable },
      keyboard: { disable: mockDisable },
      tap: { disable: mockDisable },
      removeControl: mockDisable,
      zoomControl: { remove: mockDisable },
      options: { tap: true }
    })
  };
});

const mockGeoJson = { type: 'FeatureCollection', features: [] };

describe('TravelGuideMap', () => {
  it('renders without crashing', () => {
    render(
      <TravelGuideMap geoJsonData={mockGeoJson} selectedCity={null} onMarkerClick={() => {}} />
    );
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});
