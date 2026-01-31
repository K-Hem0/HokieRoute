import { useState, useCallback, useRef } from "react";
import { filterPopularLocations, QuickLocation } from "@/lib/popular-locations";

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

// Convert quick location to PlaceResult
function quickLocationToPlaceResult(loc: QuickLocation): PlaceResult {
  const fullAddress = /\bblacksburg\b/i.test(loc.address)
    ? loc.address
    : `${loc.address}, Blacksburg, VA`;

  return {
    id: `local-${loc.id}`,
    name: loc.name,
    fullAddress,
    coordinates: loc.coordinates,
    category: "Campus",
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

    if (!query || query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    // INSTANT: Show local results immediately (no waiting)
    const localResults = filterPopularLocations(query).map(quickLocationToPlaceResult);
    setResults(localResults);
    
    // If we have enough local results, don't hit the API
    if (localResults.length >= 3) {
      setLoading(false);
      return;
    }

    // Background: Fetch from Nominatim for additional results
    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", query + " Blacksburg VA");
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "5");
      url.searchParams.set("viewbox", BLACKSBURG_VIEWBOX);
      url.searchParams.set("bounded", "1");
      url.searchParams.set("countrycodes", "us");

      const response = await fetch(url.toString(), {
        headers: {
          "Accept": "application/json",
          "User-Agent": "SafeRouteApp/1.0",
        },
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        throw new Error("Geocoding request failed");
      }

      const data = await response.json();

      let osmResults: PlaceResult[] = [];
      if (Array.isArray(data) && data.length > 0) {
        osmResults = data
          .map(nominatimToPlaceResult)
          .filter((result) => {
            const [lon, lat] = result.coordinates;
            return distanceKm(lat, lon, BLACKSBURG_CENTER.lat, BLACKSBURG_CENTER.lon) < 15;
          });
      }

      // Merge: local first, then API results (deduplicated)
      const localIds = new Set(localResults.map(r => r.name.toLowerCase()));
      const merged = [
        ...localResults,
        ...osmResults.filter(r => !localIds.has(r.name.toLowerCase()))
      ];

      setResults(merged.slice(0, 6));
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Ignore aborted requests
      setError(err.message);
      setResults([]);
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
