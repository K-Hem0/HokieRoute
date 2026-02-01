import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CalculatedRoute } from "@/hooks/useRouting";
import { PlaceResult } from "@/hooks/usePlaceSearch";

export interface CustomRouteData {
  origin: PlaceResult;
  destination: PlaceResult;
  route: CalculatedRoute;
}

export const useSavedRoutes = () => {
  const { user } = useAuth();
  const [savedRouteIds, setSavedRouteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch saved routes when user changes
  useEffect(() => {
    if (!user) {
      setSavedRouteIds([]);
      return;
    }

    const fetchSavedRoutes = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("saved_routes")
          .select("route_id")
          .eq("user_id", user.id);

        if (error) throw error;
        setSavedRouteIds(data?.map((r) => r.route_id) || []);
      } catch (err: any) {
        console.error("Error fetching saved routes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRoutes();
  }, [user]);

  const saveRoute = useCallback(async (routeId: string) => {
    if (!user) {
      toast.error("Please sign in to save routes");
      return false;
    }

    try {
      const { error } = await supabase
        .from("saved_routes")
        .insert({ user_id: user.id, route_id: routeId });

      if (error) throw error;
      setSavedRouteIds((prev) => [...prev, routeId]);
      toast.success("Route saved!");
      return true;
    } catch (err: any) {
      console.error("Error saving route:", err);
      toast.error("Failed to save route");
      return false;
    }
  }, [user]);

  const unsaveRoute = useCallback(async (routeId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("saved_routes")
        .delete()
        .eq("user_id", user.id)
        .eq("route_id", routeId);

      if (error) throw error;
      setSavedRouteIds((prev) => prev.filter((id) => id !== routeId));
      toast.success("Route removed from saved");
      return true;
    } catch (err: any) {
      console.error("Error unsaving route:", err);
      toast.error("Failed to remove route");
      return false;
    }
  }, [user]);

  const toggleSaveRoute = useCallback(async (routeId: string) => {
    if (savedRouteIds.includes(routeId)) {
      return unsaveRoute(routeId);
    } else {
      return saveRoute(routeId);
    }
  }, [savedRouteIds, saveRoute, unsaveRoute]);

  const isRouteSaved = useCallback((routeId: string) => {
    return savedRouteIds.includes(routeId);
  }, [savedRouteIds]);

  // Save a custom point-to-point route
  const saveCustomRoute = useCallback(async (data: CustomRouteData): Promise<boolean> => {
    if (!user) {
      toast.error("Please sign in to save routes");
      return false;
    }

    try {
      // Create a name from origin and destination
      const routeName = `${data.origin.name} → ${data.destination.name}`;
      
      // Calculate walking duration in minutes
      const durationWalkMin = Math.round(data.route.duration / 60);
      // Estimate cycling as ~3x faster than walking
      const durationCycleMin = Math.round(durationWalkMin / 3);
      // Distance in km
      const distanceKm = data.route.distance / 1000;

      // Insert the route into the routes table
      const { data: insertedRoute, error: routeError } = await supabase
        .from("routes")
        .insert({
          name: routeName,
          description: `Custom route from ${data.origin.name} to ${data.destination.name}`,
          user_id: user.id,
          distance_km: distanceKm,
          duration_walk_min: durationWalkMin,
          duration_cycle_min: durationCycleMin,
          coordinates: data.route.coordinates,
          start_point: { 
            lng: data.origin.coordinates[0], 
            lat: data.origin.coordinates[1],
            name: data.origin.name 
          },
          end_point: { 
            lng: data.destination.coordinates[0], 
            lat: data.destination.coordinates[1],
            name: data.destination.name 
          },
          safety_score: "safe", // Must be one of: safe, moderate, caution
          safety_insight: "Your custom walking route",
        })
        .select("id")
        .single();

      if (routeError) throw routeError;

      // Now save it to saved_routes
      const { error: saveError } = await supabase
        .from("saved_routes")
        .insert({ user_id: user.id, route_id: insertedRoute.id });

      if (saveError) throw saveError;

      setSavedRouteIds((prev) => [...prev, insertedRoute.id]);
      toast.success("Route saved to favorites!");
      return true;
    } catch (err: any) {
      console.error("Error saving custom route:", err);
      toast.error("Failed to save route");
      return false;
    }
  }, [user]);

  return {
    savedRouteIds,
    loading,
    saveRoute,
    unsaveRoute,
    toggleSaveRoute,
    isRouteSaved,
    saveCustomRoute,
  };
};
