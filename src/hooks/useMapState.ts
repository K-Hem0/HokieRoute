import { useState, useCallback, useMemo } from "react";

/**
 * Map application states:
 * - explore: Minimal UI, map-first, only search and essential actions visible
 * - planning: Bottom sheet expanded with route inputs, map subtly dimmed
 * - navigation: Active route emphasized, compact status bar, non-essentials hidden
 */
export type MapState = "explore" | "planning" | "navigation";

export interface MapStateConfig {
  /** Current application state */
  state: MapState;
  /** Whether the map should be dimmed */
  mapDimmed: boolean;
  /** Whether to show the search bar */
  showSearch: boolean;
  /** Whether to show side controls (theme, account, location) */
  showSideControls: boolean;
  /** Whether to show FAB buttons (SOS, Report) */
  showFABs: boolean;
  /** Whether to show the bottom quick access button */
  showBottomAccess: boolean;
  /** Whether the route should have enhanced glow effect */
  routeGlow: boolean;
}

export function useMapState(initialState: MapState = "explore") {
  const [state, setState] = useState<MapState>(initialState);

  const setExplore = useCallback(() => setState("explore"), []);
  const setPlanning = useCallback(() => setState("planning"), []);
  const setNavigation = useCallback(() => setState("navigation"), []);

  const config: MapStateConfig = useMemo(() => {
    switch (state) {
      case "explore":
        return {
          state: "explore",
          mapDimmed: false,
          showSearch: true,
          showSideControls: true,
          showFABs: true,
          showBottomAccess: true,
          routeGlow: false,
        };
      case "planning":
        return {
          state: "planning",
          mapDimmed: true,
          showSearch: true,
          showSideControls: true,
          showFABs: true,
          showBottomAccess: false,
          routeGlow: false,
        };
      case "navigation":
        return {
          state: "navigation",
          mapDimmed: false,
          showSearch: false,
          showSideControls: false,
          showFABs: false,
          showBottomAccess: false,
          routeGlow: true,
        };
      default:
        return {
          state: "explore",
          mapDimmed: false,
          showSearch: true,
          showSideControls: true,
          showFABs: true,
          showBottomAccess: true,
          routeGlow: false,
        };
    }
  }, [state]);

  return {
    state,
    config,
    setExplore,
    setPlanning,
    setNavigation,
    setState,
  };
}
