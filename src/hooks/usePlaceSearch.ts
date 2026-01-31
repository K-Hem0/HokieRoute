import { useState, useCallback } from "react";

// Use environment variable for Mapbox token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

// Blacksburg bounding box for search bias
const BLACKSBURG_BBOX = "-80.5,37.15,-80.35,37.35";

export interface PlaceResult {
  id: string;
  name: string;
  fullAddress: string;
  coordinates: [number, number];
  category?: string;
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
      const url = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent(query) + ".json");
      url.searchParams.set("access_token", MAPBOX_TOKEN);
      url.searchParams.set("bbox", BLACKSBURG_BBOX);
      url.searchParams.set("limit", "5");
      url.searchParams.set("types", "poi,address,place");
      url.searchParams.set("proximity", "-80.4139,37.2296"); // Bias toward Blacksburg center

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.features) {
        const places: PlaceResult[] = data.features.map((feature: any) => ({
          id: feature.id,
          name: feature.text,
          fullAddress: feature.place_name,
          coordinates: feature.center as [number, number],
          category: feature.properties?.category,
        }));
        setResults(places);
      }
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
