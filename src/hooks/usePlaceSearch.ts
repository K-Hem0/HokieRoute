import { useState, useCallback } from "react";
import { searchCampusBuildings, CampusBuilding } from "@/lib/campus-buildings";

// Mapbox public token
const MAPBOX_TOKEN = "pk.eyJ1IjoiMmtoZW0yIiwiYSI6ImNtbDJub2t0ZzBqaDgzZG9taTNibDc4NmMifQ._--O2_C9mapakXYDWdehmQ";

// Blacksburg bounding box for search bias
const BLACKSBURG_BBOX = "-80.5,37.15,-80.35,37.35";

export interface PlaceResult {
  id: string;
  name: string;
  fullAddress: string;
  coordinates: [number, number];
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
      // First, search local campus buildings (instant)
      const localResults = searchCampusBuildings(query).map(campusBuildingToPlaceResult);

      // Then fetch from Mapbox for additional results
      const url = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent(query) + ".json");
      url.searchParams.set("access_token", MAPBOX_TOKEN);
      url.searchParams.set("bbox", BLACKSBURG_BBOX);
      url.searchParams.set("limit", "5");
      url.searchParams.set("types", "poi,address,place");
      url.searchParams.set("proximity", "-80.4139,37.2296"); // Bias toward Blacksburg center

      const response = await fetch(url.toString());
      const data = await response.json();

      let mapboxResults: PlaceResult[] = [];
      if (data.features) {
        mapboxResults = data.features.map((feature: any) => ({
          id: feature.id,
          name: feature.text,
          fullAddress: feature.place_name,
          coordinates: feature.center as [number, number],
          category: feature.properties?.category,
          isLocal: false,
        }));
      }

      // Combine results: local first, then Mapbox (deduplicated by rough location)
      const combined = [...localResults];
      for (const mapboxResult of mapboxResults) {
        // Skip if we already have a local result at roughly the same location
        const isDuplicate = localResults.some((local) => {
          const [lng1, lat1] = local.coordinates;
          const [lng2, lat2] = mapboxResult.coordinates;
          return Math.abs(lng1 - lng2) < 0.001 && Math.abs(lat1 - lat2) < 0.001;
        });
        if (!isDuplicate) {
          combined.push(mapboxResult);
        }
      }

      setResults(combined.slice(0, 5)); // Limit total results
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
