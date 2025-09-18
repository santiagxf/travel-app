"use client"
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import CityGuideData from "@/lib/data/CityGuideData";
import { TravelGuideClient, SuggestionInfo } from "@/lib/TravelGuideClient";
import type { GeoJsonObject } from 'geojson';

const DEFAULT_CITY_NAME = 'Detroit';
// Dynamically import the map to avoid SSR issues
const TravelGuideMap = dynamic(() => import("@/components/TravelGuideMap"), { ssr: false });

export default function TravelGuidePage() {
    const [selectedCityName, setSelectedCityName] = useState<string | null>(DEFAULT_CITY_NAME);
    const [geoJsonData, setGeoJsonData] = useState<GeoJsonObject | null>(null);
    const [tripDescription, setTripDescription] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestionInfo, setSuggestionInfo] = useState<SuggestionInfo | null>(null);

    useEffect(() => {
        fetch("/map.json")
            .then((res) => res.json())
            .then((data) => {
                setGeoJsonData(data as GeoJsonObject);
            });
    }, []);

    const handleMarkerClick = (cityName: string) => {
        setSelectedCityName(cityName);
        // Clear suggestion info when manually selecting a city
        setSuggestionInfo(null);
    };

    const handleSuggestCity = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!tripDescription.trim()) {
            setError("Please describe your ideal trip");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            const travelGuideClient = new TravelGuideClient();
            const suggestion = await travelGuideClient.suggestCity(tripDescription);
            setSelectedCityName(suggestion.suggestedCity);
            setSuggestionInfo({
                title: suggestion.title,
                suggestedCity: suggestion.suggestedCity,
                explanation: suggestion.explanation || null
            });
        } catch (err) {
            setError("Failed to get city suggestion. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="guide page-container">
            <div className="map">
                {geoJsonData ? (
                    <TravelGuideMap
                        geoJsonData={geoJsonData}
                        selectedCity={selectedCityName}
                        onMarkerClick={handleMarkerClick}
                    />
                ) : (
                    <div>Loading Map...</div>
                )}
            </div>
            <div className="sticky-sidebar">
                <div className="mb-6 p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-3">Find Your Ideal Destination</h2>
                    <form onSubmit={handleSuggestCity}>
                        <div className="mb-3">
                            <label htmlFor="tripDescription" className="block text-sm font-medium mb-1">
                                Describe your ideal trip:
                            </label>
                            <textarea 
                                id="tripDescription"
                                className="w-full p-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                value={tripDescription}
                                onChange={(e) => setTripDescription(e.target.value)}
                                placeholder="E.g., I want a relaxing beach vacation with great seafood and water activities"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                            {isLoading ? "Finding your destination..." : "Suggest Destination"}
                        </button>
                    </form>
                </div>
                
                <div className="travel-guides">
                    <h3 className="font-bold mb-2">All Destinations</h3>
                    <ul>
                        {CityGuideData.map((city) => (
                            <li key={city.city} id={city.city}>
                                <h3 onClick={() => handleMarkerClick(city.city)}>{city.city}, {city.country}</h3>
                            </li>
                        ))}
                    </ul>
                </div>
                {CityGuideData.map((city) => (
                    <div key={city.city} className={"sticky-sidebar guide-extra " + (city.city === selectedCityName ? 'highlight' : '')}>
                        <div className={city.city === selectedCityName ? 'highlight' : ''}>
                            <strong><a href="#" onClick={(e) => {e.preventDefault(); setSelectedCityName(null); setSuggestionInfo(null);}}>← Back</a></strong>
                            <h3>{city.city}, {city.country}</h3>
                            <p>{city.description}</p>
                            <strong>Highlights:</strong>
                            <ul>
                                {city.highlights.map((highlight: string, idx: number) => (
                                    <li key={idx}>{highlight}</li>
                                ))}
                            </ul>
                            
                            {suggestionInfo && suggestionInfo.explanation && (
                                <div className="mt-5 pt-2">
                                    <div className="suggestion-content">
                                        <strong className="block mb-1">{suggestionInfo.title}:</strong>
                                        <p className="p-0">{suggestionInfo.explanation}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}