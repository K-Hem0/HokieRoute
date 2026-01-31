import { useState, useCallback } from "react";

const BLACKSBURG_CENTER: [number, number] = [-80.4139, 37.2296];

interface GeolocationState {
  location: [number, number] | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        location: BLACKSBURG_CENTER, // Fallback to Blacksburg center
        loading: false,
        error: "Geolocation not supported",
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: [position.coords.longitude, position.coords.latitude],
          loading: false,
          error: null,
        });
      },
      (error) => {
        // Fallback to Blacksburg center on error
        setState({
          location: BLACKSBURG_CENTER,
          loading: false,
          error: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  return {
    ...state,
    requestLocation,
    // For demo purposes, if no location, use Blacksburg center
    effectiveLocation: state.location || BLACKSBURG_CENTER,
  };
};
