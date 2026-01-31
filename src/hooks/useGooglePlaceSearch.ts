import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlaceResult {
  id: string;
  name: string;
  fullAddress: string;
  coordinates: { lat: number; lng: number };
  placeId?: string;
  uri?: string;
}

export const useGooglePlaceSearch = () => {
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = useCallback(async (query: string, userLocation?: [number, number] | null) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("place-search", {
        body: {
          query,
          latitude: userLocation ? userLocation[1] : 37.2296,
          longitude: userLocation ? userLocation[0] : -80.4139,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.success && data.places) {
        const places: PlaceResult[] = data.places.map((place: any) => ({
          id: place.id || place.placeId || `place-${Math.random()}`,
          name: place.name,
          fullAddress: place.address || "Blacksburg, VA",
          coordinates: { lat: 37.2296, lng: -80.4139 }, // Default to Blacksburg center
          placeId: place.placeId,
          uri: place.uri,
        }));
        setResults(places);
      } else if (data.error) {
        setError(data.error);
        setResults([]);
      }
    } catch (err: any) {
      console.error("Place search error:", err);
      setError(err.message || "Failed to search places");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const geocodePlace = useCallback(async (placeId: string): Promise<{ lat: number; lng: number } | null> => {
    // For places with a Google Maps placeId, we could use the Places API
    // For now, return Blacksburg coordinates as a fallback
    // In a full implementation, you would call the Places API to get exact coordinates
    return null;
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return { results, loading, error, searchPlaces, clearResults, geocodePlace };
};
