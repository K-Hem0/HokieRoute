import { useState, useEffect, useCallback, useRef } from "react";
import { reverseGeocode, ReverseGeocodeResult } from "@/lib/reverse-geocode";

const BLACKSBURG_CENTER: [number, number] = [-80.4139, 37.2296];

interface CurrentLocationState {
  /** User's coordinates [lng, lat] */
  coordinates: [number, number] | null;
  /** GPS accuracy in meters */
  accuracy: number | null;
  /** OSRM-based address result */
  address: ReverseGeocodeResult | null;
  /** Loading geolocation */
  loadingLocation: boolean;
  /** Loading address lookup */
  loadingAddress: boolean;
  /** Error message */
  error: string | null;
  /** Whether location permission was denied */
  permissionDenied: boolean;
  /** Whether actively watching position */
  isWatching: boolean;
}

/**
 * Hook that provides user's current location with OSRM-based address resolution.
 * Combines geolocation with reverse geocoding for accurate street-level addresses.
 */
export function useCurrentLocation() {
  const [state, setState] = useState<CurrentLocationState>({
    coordinates: null,
    accuracy: null,
    address: null,
    loadingLocation: false,
    loadingAddress: false,
    error: null,
    permissionDenied: false,
    isWatching: false,
  });

  const watchIdRef = useRef<number | null>(null);
  const lastGeocodeRef = useRef<string | null>(null);

  // Fetch address for given coordinates
  const fetchAddress = useCallback(async (lng: number, lat: number) => {
    // Debounce: skip if same location (within ~10m)
    const key = `${lng.toFixed(4)},${lat.toFixed(4)}`;
    if (lastGeocodeRef.current === key) return;
    lastGeocodeRef.current = key;

    setState((prev) => ({ ...prev, loadingAddress: true }));

    try {
      const result = await reverseGeocode(lat, lng);
      setState((prev) => ({
        ...prev,
        address: result,
        loadingAddress: false,
      }));
    } catch (err) {
      console.error("[useCurrentLocation] Address lookup failed:", err);
      setState((prev) => ({
        ...prev,
        address: { label: "Address unavailable" },
        loadingAddress: false,
      }));
    }
  }, []);

  // Handle successful position update
  const handlePositionSuccess = useCallback(
    (position: GeolocationPosition) => {
      const coords: [number, number] = [
        position.coords.longitude,
        position.coords.latitude,
      ];

      setState((prev) => ({
        ...prev,
        coordinates: coords,
        accuracy: position.coords.accuracy,
        loadingLocation: false,
        error: null,
        permissionDenied: false,
      }));

      // Trigger address lookup
      fetchAddress(coords[0], coords[1]);
    },
    [fetchAddress]
  );

  // Handle position error
  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    const isDenied = error.code === error.PERMISSION_DENIED;
    setState((prev) => ({
      ...prev,
      loadingLocation: false,
      error: error.message,
      permissionDenied: isDenied,
    }));
  }, []);

  // Request current position once
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        coordinates: BLACKSBURG_CENTER,
        error: "Geolocation not supported",
        loadingLocation: false,
      }));
      fetchAddress(BLACKSBURG_CENTER[0], BLACKSBURG_CENTER[1]);
      return;
    }

    setState((prev) => ({ ...prev, loadingLocation: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [handlePositionSuccess, handlePositionError, fetchAddress]);

  // Start watching position continuously
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: "Geolocation not supported" }));
      return;
    }

    // Clear existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setState((prev) => ({ ...prev, loadingLocation: true, isWatching: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  }, [handlePositionSuccess, handlePositionError]);

  // Stop watching position
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((prev) => ({ ...prev, isWatching: false }));
  }, []);

  // Dismiss permission denied state
  const dismissPermissionDenied = useCallback(() => {
    setState((prev) => ({ ...prev, permissionDenied: false }));
  }, []);

  // Refresh address for current coordinates
  const refreshAddress = useCallback(() => {
    if (state.coordinates) {
      lastGeocodeRef.current = null; // Force refresh
      fetchAddress(state.coordinates[0], state.coordinates[1]);
    }
  }, [state.coordinates, fetchAddress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Computed values
  const isLoading = state.loadingLocation || state.loadingAddress;
  const isAccurate = state.accuracy !== null && state.accuracy < 50;
  const effectiveCoordinates = state.coordinates || BLACKSBURG_CENTER;
  const displayAddress = state.address?.label || "Locating...";

  return {
    ...state,
    isLoading,
    isAccurate,
    effectiveCoordinates,
    displayAddress,
    requestLocation,
    startWatching,
    stopWatching,
    dismissPermissionDenied,
    refreshAddress,
  };
}
