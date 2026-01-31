import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LocationSafetyScore {
  location: string;
  safety_score: number;
  total_risk: number;
}

/**
 * Hook to fetch and cache all location safety scores
 * Used for calculating route safety based on nearby crime data
 */
export function useLocationSafetyScores() {
  const [scores, setScores] = useState<LocationSafetyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const { data, error } = await supabase
          .from("location_safety_scores")
          .select("location, safety_score, total_risk");

        if (error) throw error;

        setScores(data || []);
      } catch (err: any) {
        console.warn("Failed to fetch location safety scores:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  return { scores, loading, error };
}
