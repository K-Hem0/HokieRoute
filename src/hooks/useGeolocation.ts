import { useState, useCallback, useEffect, useRef } from "react";

const BLACKSBURG_CENTER: [number, number] = [-80.4139, 37.2296];

interface GeolocationState {
  location: [number, number] | null;
  accuracy: number | null; // meters
  loading: boolean;
  error: string | null;
  isWatching: boolean;
  permissionDenied: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    accuracy: null,
    loading: false,
    error: null,
    isWatching: false,
    permissionDenied: false,
  });
  
  const watchIdRef = useRef<number | null>(null);

  // Dismiss the permission denied state (user acknowledged the popup)
  const dismissPermissionDenied = useCallback(() => {
    setState((prev) => ({ ...prev, permissionDenied: false }));
  }, []);

  // Request current position once
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        location: BLACKSBURG_CENTER,
        loading: false,
        error: "Geolocation not supported",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          location: [position.coords.longitude, position.coords.latitude],
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
          permissionDenied: false,
        }));
      },
      (error) => {
        const isDenied = error.code === error.PERMISSION_DENIED;
        setState((prev) => ({
          ...prev,
          location: prev.location || BLACKSBURG_CENTER,
          loading: false,
          error: error.message,
          permissionDenied: isDenied,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // Always get fresh position
      }
    );
  }, []);

  // Start watching position continuously
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation not supported",
      }));
      return;
    }

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setState((prev) => ({ ...prev, loading: true, isWatching: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          location: [position.coords.longitude, position.coords.latitude],
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
          permissionDenied: false,
        }));
      },
      (error) => {
        const isDenied = error.code === error.PERMISSION_DENIED;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
          permissionDenied: isDenied,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000, // Use cached position up to 5 seconds old
      }
    );
  }, []);

  // Stop watching position
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((prev) => ({ ...prev, isWatching: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Helper to check if accuracy is good (< 50 meters)
  const isAccurate = state.accuracy !== null && state.accuracy < 50;

  return {
    ...state,
    isAccurate,
    requestLocation,
    startWatching,
    stopWatching,
    dismissPermissionDenied,
    // For demo purposes, if no location, use Blacksburg center
    effectiveLocation: state.location || BLACKSBURG_CENTER,
  };
};
