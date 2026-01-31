import { useState, useCallback } from "react";

// Blacksburg, VA center and bounding box for Nominatim search
const BLACKSBURG_CENTER = { lat: 37.2296, lon: -80.4139 };
const BLACKSBURG_VIEWBOX = "-80.5,37.15,-80.35,37.35"; // left,top,right,bottom

export interface PlaceResult {
  id: string;
  name: string;
  fullAddress: string;
  coordinates: [number, number]; // [lng, lat]
  category?: string;
}

/**
 * Parse Nominatim response into PlaceResult format
 */
function nominatimToPlaceResult(item: any): PlaceResult {
  return {
    id: `osm-${item.osm_type}-${item.osm_id}`,
    name: item.name || item.display_name.split(",")[0],
    fullAddress: item.display_name,
    coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
    category: item.type || item.class,
  };
}

/**
 * Calculate distance between two points (Haversine formula)
 */
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const usePlaceSearch = () => {
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch from Nominatim (OpenStreetMap geocoder)
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", query + " Blacksburg VA");
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "6");
      url.searchParams.set("viewbox", BLACKSBURG_VIEWBOX);
      url.searchParams.set("bounded", "1"); // Strictly limit to viewbox
      url.searchParams.set("countrycodes", "us");

      const response = await fetch(url.toString(), {
        headers: {
          "Accept": "application/json",
          "User-Agent": "SafeRouteApp/1.0",
        },
      });
      
      if (!response.ok) {
        throw new Error("Geocoding request failed");
      }

      const data = await response.json();

      let osmResults: PlaceResult[] = [];
      if (Array.isArray(data) && data.length > 0) {
        osmResults = data
          .map(nominatimToPlaceResult)
          // Filter out results too far from Blacksburg (>15km)
          .filter((result) => {
            const [lon, lat] = result.coordinates;
            return distanceKm(lat, lon, BLACKSBURG_CENTER.lat, BLACKSBURG_CENTER.lon) < 15;
          });
      }

      setResults(osmResults.slice(0, 6));
    } catch (err: any) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return { results, loading, error, searchPlaces, clearResults };
};
