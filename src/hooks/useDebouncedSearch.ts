import { useState, useCallback, useRef, useEffect } from "react";
import { PlaceResult, usePlaceSearch } from "./usePlaceSearch";

interface UseDebouncedSearchOptions {
  debounceMs?: number;
  minLength?: number;
}

export const useDebouncedSearch = (options: UseDebouncedSearchOptions = {}) => {
  const { debounceMs = 300, minLength = 1 } = options;
  const { results, loading, error, searchPlaces, clearResults } = usePlaceSearch();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastQueryRef = useRef<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");

  const debouncedSearch = useCallback((query: string) => {
    // Clear any pending search
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Store the query for comparison
    lastQueryRef.current = query;
    setCurrentQuery(query);

    // Clear results if query is too short
    if (!query || query.length < minLength) {
      clearResults();
      setHasSearched(false);
      return;
    }

    // Debounce the search
    timerRef.current = setTimeout(() => {
      // Only search if query hasn't changed
      if (query === lastQueryRef.current) {
        setHasSearched(true);
        searchPlaces(query);
      }
    }, debounceMs);
  }, [debounceMs, minLength, searchPlaces, clearResults]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    lastQueryRef.current = "";
    setCurrentQuery("");
    setHasSearched(false);
    clearResults();
  }, [clearResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    results,
    loading,
    error,
    search: debouncedSearch,
    clear,
    hasSearched,
    currentQuery,
  };
};
