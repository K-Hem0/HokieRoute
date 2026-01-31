import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Route, SafetyLevel, RouteBadge, mockRoutes } from "@/lib/mock-data";
import {
  calculateRouteSafety,
  fetchLocationSafetyScores,
} from "@/lib/safety-calculator";

// Default badges based on safety score for routes without explicit badges
const getDefaultBadges = (safetyScore: SafetyLevel): RouteBadge[] => {
  const baseBadges: RouteBadge[] = [];

  if (safetyScore === "safe") {
    baseBadges.push(
      { id: "default-1", label: "Well-lit", icon: "Lightbulb", type: "feature" },
      {
        id: "default-2",
        label: "Community verified",
        icon: "CheckCircle",
        type: "verified",
      }
    );
  } else if (safetyScore === "moderate") {
    baseBadges.push({
      id: "default-3",
      label: "Near help",
      icon: "Phone",
      type: "safety",
    });
  } else if (safetyScore === "caution") {
    baseBadges.push({
      id: "default-4",
      label: "Stay alert",
      icon: "AlertTriangle",
      type: "safety",
    });
  }

  return baseBadges;
};

export const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        // Fetch both routes and safety scores in parallel
        const [routesResult, safetyScores] = await Promise.all([
          supabase
            .from("routes")
            .select("*")
            .order("created_at", { ascending: false }),
          fetchLocationSafetyScores(),
        ]);

        if (routesResult.error) throw routesResult.error;

        // If database has routes, use them with calculated safety
        if (routesResult.data && routesResult.data.length > 0) {
          const transformedRoutes: Route[] = routesResult.data.map((route) => {
            // Calculate safety from location data if available
            const calculatedSafety = calculateRouteSafety(
              route.name,
              route.description || "",
              "", // Start location name - could be enhanced later
              "", // End location name - could be enhanced later
              safetyScores
            );

            // Use calculated safety if we have matching data, otherwise use stored value
            const safetyScore =
              calculatedSafety.matchedCount > 0
                ? calculatedSafety.safetyLevel
                : (route.safety_score as SafetyLevel);

            const safetyInsight =
              calculatedSafety.matchedCount > 0
                ? calculatedSafety.insight
                : route.safety_insight || "";

            return {
              id: route.id,
              name: route.name,
              description: route.description || "",
              distance_km: Number(route.distance_km),
              duration_walk_min: route.duration_walk_min,
              duration_cycle_min: route.duration_cycle_min,
              safety_score: safetyScore,
              safety_insight: safetyInsight,
              coordinates: route.coordinates as [number, number][],
              start_point: route.start_point as [number, number],
              end_point: route.end_point as [number, number],
              thumbnail_url: route.thumbnail_url || undefined,
              badges: getDefaultBadges(safetyScore),
            };
          });
          setRoutes(transformedRoutes);
        } else {
          // Use mock data with calculated safety
          const enhancedMockRoutes = mockRoutes.map((route) => {
            const calculatedSafety = calculateRouteSafety(
              route.name,
              route.description,
              "",
              "",
              safetyScores
            );

            if (calculatedSafety.matchedCount > 0) {
              return {
                ...route,
                safety_score: calculatedSafety.safetyLevel,
                safety_insight: calculatedSafety.insight,
                badges: getDefaultBadges(calculatedSafety.safetyLevel),
              };
            }
            return route;
          });
          setRoutes(enhancedMockRoutes);
        }
      } catch (err: any) {
        // Fallback to mock data on error
        console.warn("Using mock data:", err.message);
        setRoutes(mockRoutes);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return { routes, loading, error };
};
