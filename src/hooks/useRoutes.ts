import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Route, SafetyLevel, RouteBadge, mockRoutes } from "@/lib/mock-data";

// Default badges based on safety score for routes without explicit badges
const getDefaultBadges = (safetyScore: SafetyLevel): RouteBadge[] => {
  const baseBadges: RouteBadge[] = [];
  
  if (safetyScore === 'safe') {
    baseBadges.push(
      { id: 'default-1', label: 'Well-lit', icon: 'Lightbulb', type: 'feature' },
      { id: 'default-2', label: 'Community verified', icon: 'CheckCircle', type: 'verified' }
    );
  } else if (safetyScore === 'moderate') {
    baseBadges.push(
      { id: 'default-3', label: 'Near help', icon: 'Phone', type: 'safety' }
    );
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
        const { data, error } = await supabase
          .from("routes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // If database has routes, use them; otherwise use mock data
        if (data && data.length > 0) {
          const transformedRoutes: Route[] = data.map((route) => {
            const safetyScore = route.safety_score as SafetyLevel;
            return {
              id: route.id,
              name: route.name,
              description: route.description || "",
              distance_km: Number(route.distance_km),
              duration_walk_min: route.duration_walk_min,
              duration_cycle_min: route.duration_cycle_min,
              safety_score: safetyScore,
              safety_insight: route.safety_insight || "",
              coordinates: route.coordinates as [number, number][],
              start_point: route.start_point as [number, number],
              end_point: route.end_point as [number, number],
              thumbnail_url: route.thumbnail_url || undefined,
              badges: getDefaultBadges(safetyScore),
            };
          });
          setRoutes(transformedRoutes);
        } else {
          // Use Blacksburg-specific mock data
          setRoutes(mockRoutes);
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
