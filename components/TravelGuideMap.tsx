"use client"
import React, { useEffect } from "react";
import { MapContainer, GeoJSON, CircleMarker, useMap } from "react-leaflet";
import { LatLngTuple } from "leaflet";
import type { GeoJsonObject } from 'geojson';
import "leaflet/dist/leaflet.css";
import CityGuideData from "@/lib/data/CityGuideData";

// Helper to disable all interactions
function DisableMapInteractions() {
  const map = useMap();
  useEffect(() => {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    // Safe check for touch support
    if ("tap" in map.options) {
      map.options["tap"] = false;
    }
  }, [map]);
  return null;
}

interface TravelGuideMapProps {
  geoJsonData: GeoJsonObject;
  selectedCity?: string | null;
  onMarkerClick?: (cityName: string) => void;
}

const TravelGuideMap: React.FC<TravelGuideMapProps> = ({ geoJsonData, selectedCity, onMarkerClick }) => {
  // Centered on the continental United States
  const defaultCenter: LatLngTuple = [39.8283, -98.5795];  // Geographic center of the continental US
  const zoom = 3.5;  // Closer zoom to show US clearly

  // GeoJSON style function
  const geoJsonStyle = {
    color: "#444",
    weight: 1,
    fillColor: "#222",
    fillOpacity: 1
  };

  return (
    <MapContainer
      center={defaultCenter}
      zoom={zoom}
      style={{ height: "100%", width: "100%", minHeight: 400, background: "#222", borderRadius: 12 }}
      zoomControl={false}
      dragging={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
      attributionControl={false}
      keyboard={false}
      boxZoom={false}
      touchZoom={false}
    >
      <DisableMapInteractions />
      <GeoJSON data={geoJsonData} pathOptions={geoJsonStyle} />
      {CityGuideData.map((city) => {
        const position: LatLngTuple = [city.latlong[0], city.latlong[1]];
        return (
          <CircleMarker
            key={city.city}
            center={position}
            radius={selectedCity === city.city ? 10 : 6}
            pathOptions={{ 
              color: selectedCity === city.city ? "#4EA0E9" : "#fff", 
              fillColor: selectedCity === city.city ? "#4EA0E9" : "#fff", 
              fillOpacity: 1 
            }}
            eventHandlers={onMarkerClick ? { click: () => onMarkerClick(city.city) } : undefined}
          >
            <title>{city.city}, {city.country}</title>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
};

export default TravelGuideMap;
