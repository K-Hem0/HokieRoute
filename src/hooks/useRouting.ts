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

type RoutingProfile = "foot" | "bike" | "car";

/**
 * Hook for calculating routes using OSRM (Open Source Routing Machine)
 * Free, no API key required
 */
export const useRouting = () => {
  const [route, setRoute] = useState<CalculatedRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = useCallback(
    async (
      origin: [number, number], // [lng, lat]
      destination: [number, number], // [lng, lat]
      profile: RoutingProfile = "foot"
    ) => {
      setLoading(true);
      setError(null);

      try {
        // OSRM uses different profile names
        const osrmProfile = profile === "bike" ? "bike" : profile === "car" ? "car" : "foot";
        
        // OSRM Demo server (for development) - in production, use your own server
        const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson&steps=true`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
          throw new Error("No route found");
        }

        const osrmRoute = data.routes[0];
        const coordinates: [number, number][] = osrmRoute.geometry.coordinates;

        // Extract steps with instructions
        const steps: RouteStep[] = osrmRoute.legs[0].steps.map((step: any) => ({
          instruction: step.maneuver.instruction || formatManeuver(step.maneuver),
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
        setError(err.message || "Failed to calculate route");
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
};

// Helper to format maneuver into readable instruction
function formatManeuver(maneuver: any): string {
  const type = maneuver.type;
  const modifier = maneuver.modifier;

  switch (type) {
    case "depart":
      return "Start your journey";
    case "arrive":
      return "You have arrived";
    case "turn":
      return `Turn ${modifier || ""}`.trim();
    case "continue":
      return "Continue straight";
    case "merge":
      return `Merge ${modifier || ""}`.trim();
    case "fork":
      return `Take the ${modifier || ""} fork`.trim();
    case "roundabout":
      return "Enter the roundabout";
    case "exit roundabout":
      return "Exit the roundabout";
    default:
      return `${type} ${modifier || ""}`.trim();
  }
}

// Utility to format distance
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// Utility to format duration
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
