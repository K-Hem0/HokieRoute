import { useState, useCallback } from "react";
import { findCampusRouteFromCoordinates, CampusRouteResult } from "@/lib/campus-routing";
import { isOnCampus, getNodeByCoordinates, haversineDistance } from "@/lib/campus-paths";

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
  source: 'campus' | 'osrm'; // Which routing engine was used
}

type RoutingProfile = "foot" | "bike" | "car";

/**
 * Hook for calculating routes
 * Uses campus pedestrian paths for on-campus routes, falls back to OSRM for off-campus
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
    ): Promise<CalculatedRoute | null> => {
      setLoading(true);
      setError(null);

      try {
        const destOnCampus = isOnCampus(destination);
        const originOnCampus = isOnCampus(origin);
        
        // Try campus routing if destination is on campus
        if (destOnCampus) {
          const campusMode = profile === "bike" ? "bike" : "walk";
          
          // If origin is also on campus, use full campus routing
          if (originOnCampus) {
            const campusRoute = findCampusRouteFromCoordinates(origin, destination, campusMode);
            
            if (campusRoute) {
              const calculatedRoute: CalculatedRoute = {
                coordinates: campusRoute.coordinates,
                distance: campusRoute.distance,
                duration: campusRoute.duration,
                steps: campusRoute.steps.map(step => ({
                  instruction: step.instruction,
                  distance: step.distance,
                  duration: step.duration,
                  maneuver: 'walk',
                })),
                source: 'campus',
              };
              
              setRoute(calculatedRoute);
              return calculatedRoute;
            }
          }
          
          // Origin is off campus but destination is on campus
          // Use OSRM to get to nearest campus node, then campus routing within
          const nearestCampusNode = getNodeByCoordinates(origin);
          if (nearestCampusNode) {
            // Just use campus routing from the nearest node
            const campusRoute = findCampusRouteFromCoordinates(
              nearestCampusNode.coordinates, 
              destination, 
              campusMode
            );
            
            if (campusRoute) {
              // Add initial segment from origin to campus entry
              const entryDistance = haversineDistance(origin, nearestCampusNode.coordinates);
              const entryDuration = entryDistance / (campusMode === 'walk' ? 1.4 : 4.2);
              
              const calculatedRoute: CalculatedRoute = {
                coordinates: [origin, ...campusRoute.coordinates],
                distance: campusRoute.distance + Math.round(entryDistance),
                duration: campusRoute.duration + Math.round(entryDuration),
                steps: [
                  {
                    instruction: `Head to ${nearestCampusNode.name} to enter campus`,
                    distance: Math.round(entryDistance),
                    duration: Math.round(entryDuration),
                    maneuver: 'walk',
                  },
                  ...campusRoute.steps.map(step => ({
                    instruction: step.instruction,
                    distance: step.distance,
                    duration: step.duration,
                    maneuver: 'walk',
                  })),
                ],
                source: 'campus',
              };
              
              setRoute(calculatedRoute);
              return calculatedRoute;
            }
          }
        }
        
        // Fall back to OSRM for off-campus or when campus routing fails
        return await calculateOSRMRoute(origin, destination, profile);
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

  const calculateOSRMRoute = async (
    origin: [number, number],
    destination: [number, number],
    profile: RoutingProfile
  ): Promise<CalculatedRoute | null> => {
    try {
      const osrmProfile = profile === "bike" ? "bike" : profile === "car" ? "car" : "foot";
      
      const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson&steps=true`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw new Error("No route found");
      }

      const osrmRoute = data.routes[0];
      const coordinates: [number, number][] = osrmRoute.geometry.coordinates;

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
        source: 'osrm',
      };

      setRoute(calculatedRoute);
      return calculatedRoute;
    } catch (err: any) {
      setError(err.message || "Failed to calculate route");
      setRoute(null);
      return null;
    }
  };

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
