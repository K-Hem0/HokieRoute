import { useState, useCallback } from "react";

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  maneuver: string;
}

export interface CalculatedRoute {
  coordinates: [number, number][]; // [lng, lat] pairs
  distance: number; // meters
  duration: number; // seconds
  steps: RouteStep[];
}

/**
 * Hook for calculating pedestrian-only routes using OSRM
 * Uses OpenStreetMap data with foot profile for accurate walking paths
 */
export function useRouting() {
  const [route, setRoute] = useState<CalculatedRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = useCallback(
    async (
      origin: [number, number],
      destination: [number, number]
    ): Promise<CalculatedRoute | null> => {
      setLoading(true);
      setError(null);

      try {
        // Use OSRM with foot profile via routing.openstreetmap.de
        const url = `https://routing.openstreetmap.de/routed-foot/route/v1/walking/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson&steps=true`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
          throw new Error("No walking route found");
        }

        const osrmRoute = data.routes[0];
        const coordinates: [number, number][] = osrmRoute.geometry.coordinates;

        const steps: RouteStep[] = osrmRoute.legs[0].steps.map((step: any) => ({
          instruction: step.maneuver.instruction || formatPedestrianManeuver(step),
          distance: step.distance,
          duration: step.duration,
          maneuver: step.maneuver.type,
        }));

        const calculatedRoute: CalculatedRoute = {
          coordinates,
          distance: osrmRoute.distance,
          duration: osrmRoute.duration,
          steps,
        };

        setRoute(calculatedRoute);
        return calculatedRoute;
      } catch (err: any) {
        setError(err.message || "Failed to calculate walking route");
        setRoute(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearRoute = useCallback(() => {
    setRoute(null);
    setError(null);
  }, []);

  return { route, loading, error, calculateRoute, clearRoute };
}

function formatPedestrianManeuver(step: any): string {
  const type = step.maneuver?.type || "";
  const modifier = step.maneuver?.modifier || "";
  const name = step.name || "";
  const pathPrefix = name ? `on ${name}` : "";

  switch (type) {
    case "depart":
      return name ? `Start walking on ${name}` : "Start walking";
    case "arrive":
      return "You have arrived at your destination";
    case "turn":
      return `Turn ${modifier}${pathPrefix ? ` ${pathPrefix}` : ""}`.trim();
    case "continue":
      return `Continue straight${pathPrefix ? ` ${pathPrefix}` : ""}`.trim();
    case "new name":
      return name ? `Continue onto ${name}` : "Continue straight";
    case "merge":
      return `Merge ${modifier}`.trim();
    case "fork":
      return `Take the ${modifier || "ahead"} path`.trim();
    case "roundabout":
      return "Go around the roundabout";
    case "exit roundabout":
      return "Exit the roundabout";
    case "end of road":
      return `At the end, turn ${modifier || "ahead"}`.trim();
    default:
      return `${type} ${modifier}`.trim() || "Continue";
  }
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
