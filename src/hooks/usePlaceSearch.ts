import { useState, useCallback, useRef } from "react";
import { searchLocalLocations, LocalLocation } from "@/lib/blacksburg-locations";

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
 * Convert local location to PlaceResult format
 */
function localToPlaceResult(location: LocalLocation): PlaceResult {
  return {
    id: location.id,
    name: location.name,
    fullAddress: location.fullAddress,
    coordinates: location.coordinates,
    category: location.category,
  };
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

/**
 * Build Nominatim search URL with common parameters
 */
function buildNominatimUrl(query: string): string {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");
  url.searchParams.set("viewbox", BLACKSBURG_VIEWBOX);
  url.searchParams.set("countrycodes", "us");
  return url.toString();
}

export const usePlaceSearch = () => {
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchPlaces = useCallback(async (query: string) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!query || query.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      // First, search local database for instant prefix matching
      const localResults = searchLocalLocations(query).map(localToPlaceResult);
      
      // If we have enough local results, show them immediately
      if (localResults.length >= 3) {
        setResults(localResults.slice(0, 5));
        setLoading(false);
        return;
      }

      // Also search Nominatim for additional results
      const nominatimQuery = `${query}, Blacksburg, Virginia`;
      const response = await fetch(buildNominatimUrl(nominatimQuery), {
        headers: { "Accept": "application/json", "User-Agent": "SafeRouteApp/1.0" },
        signal: abortControllerRef.current.signal,
      });

      let osmResults: PlaceResult[] = [];
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const seen = new Set(localResults.map(r => r.name.toLowerCase()));
          
          for (const item of data) {
            if (!item?.osm_id) continue;
            const result = nominatimToPlaceResult(item);
            const [lon, lat] = result.coordinates;
            
            // Filter to 15km radius and avoid duplicates
            if (
              distanceKm(lat, lon, BLACKSBURG_CENTER.lat, BLACKSBURG_CENTER.lon) < 15 &&
              !seen.has(result.name.toLowerCase())
            ) {
              osmResults.push(result);
              seen.add(result.name.toLowerCase());
            }
          }
        }
      }

      // Combine local and Nominatim results, prioritizing local
      const combined = [...localResults, ...osmResults].slice(0, 5);
      setResults(combined);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message);
      // Still show local results on error
      const localResults = searchLocalLocations(query).map(localToPlaceResult);
      setResults(localResults.slice(0, 5));
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setResults([]);
    setLoading(false);
  }, []);

  return { results, loading, error, searchPlaces, clearResults };
};
