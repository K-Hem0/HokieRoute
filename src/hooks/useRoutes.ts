import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Route, SafetyLevel } from "@/lib/mock-data";

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

        // Transform database format to Route type
        const transformedRoutes: Route[] = (data || []).map((route) => ({
          id: route.id,
          name: route.name,
          description: route.description || "",
          distance_km: Number(route.distance_km),
          duration_walk_min: route.duration_walk_min,
          duration_cycle_min: route.duration_cycle_min,
          safety_score: route.safety_score as SafetyLevel,
          safety_insight: route.safety_insight || "",
          coordinates: route.coordinates as [number, number][],
          start_point: route.start_point as [number, number],
          end_point: route.end_point as [number, number],
          thumbnail_url: route.thumbnail_url || undefined,
        }));

        setRoutes(transformedRoutes);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching routes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return { routes, loading, error };
};
