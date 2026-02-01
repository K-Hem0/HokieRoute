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

  // Request current position once (with loading state)
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

  // Quick recenter - uses cached location if available, no loading state
  const recenter = useCallback(() => {
    // If we already have a location, just return true (caller will pan map)
    if (state.location) {
      return true;
    }
    
    // No location yet - request one but don't show loading (background fetch)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState((prev) => ({
            ...prev,
            location: [position.coords.longitude, position.coords.latitude],
            accuracy: position.coords.accuracy,
            error: null,
            permissionDenied: false,
          }));
        },
        () => {
          // Silent fail - use default location
          setState((prev) => ({
            ...prev,
            location: prev.location || BLACKSBURG_CENTER,
          }));
        },
        {
          enableHighAccuracy: false, // Fast, less accurate
          timeout: 5000,
          maximumAge: 60000, // Accept cached positions up to 1 minute old
        }
      );
    }
    return false;
  }, [state.location]);

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
    recenter,
    startWatching,
    stopWatching,
    dismissPermissionDenied,
    // For demo purposes, if no location, use Blacksburg center
    effectiveLocation: state.location || BLACKSBURG_CENTER,
  };
};
