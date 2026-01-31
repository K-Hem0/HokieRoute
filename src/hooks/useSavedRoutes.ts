import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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

  return {
    savedRouteIds,
    loading,
    saveRoute,
    unsaveRoute,
    toggleSaveRoute,
    isRouteSaved,
  };
};
