import { useState, useCallback } from "react";
import { searchCampusBuildings, CampusBuilding } from "@/lib/campus-buildings";

// Blacksburg, VA center and bounding box for Nominatim search
const BLACKSBURG_CENTER = { lat: 37.2296, lon: -80.4139 };
const BLACKSBURG_VIEWBOX = "-80.5,37.15,-80.35,37.35"; // left,top,right,bottom

export interface PlaceResult {
  id: string;
  name: string;
  fullAddress: string;
  coordinates: [number, number]; // [lng, lat]
  category?: string;
  isLocal?: boolean; // Flag for local campus buildings
}

// Convert campus building to PlaceResult
function campusBuildingToPlaceResult(building: CampusBuilding): PlaceResult {
  return {
    id: `campus-${building.id}`,
    name: building.name,
    fullAddress: building.address,
    coordinates: building.coordinates,
    category: building.category,
    isLocal: true,
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
    isLocal: false,
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
      // First, search local campus buildings (instant, highest priority)
      const localResults = searchCampusBuildings(query).map(campusBuildingToPlaceResult);

      // Then fetch from Nominatim (OpenStreetMap geocoder)
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", query);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "5");
      url.searchParams.set("viewbox", BLACKSBURG_VIEWBOX);
      url.searchParams.set("bounded", "1"); // Strictly limit to viewbox
      url.searchParams.set("countrycodes", "us");

      const response = await fetch(url.toString(), {
        headers: {
          "Accept": "application/json",
          // Nominatim requires a User-Agent
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

      // Combine results: local first, then OSM (deduplicated by rough location)
      const combined = [...localResults];
      for (const osmResult of osmResults) {
        // Skip if we already have a local result at roughly the same location
        const isDuplicate = localResults.some((local) => {
          const [lng1, lat1] = local.coordinates;
          const [lng2, lat2] = osmResult.coordinates;
          return Math.abs(lng1 - lng2) < 0.001 && Math.abs(lat1 - lat2) < 0.001;
        });
        if (!isDuplicate) {
          combined.push(osmResult);
        }
      }

      setResults(combined.slice(0, 6)); // Limit total results
    } catch (err: any) {
      setError(err.message);
      // Even on error, show local results
      const localResults = searchCampusBuildings(query).map(campusBuildingToPlaceResult);
      setResults(localResults);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return { results, loading, error, searchPlaces, clearResults };
};
