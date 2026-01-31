import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { convertSafetyDataToHeatmapPoints, HeatmapPoint } from "@/lib/location-coordinates";

interface SafetyScore {
  location: string;
  safety_score: number;
  total_risk: number;
}

export function useHeatmapData() {
  const [rawData, setRawData] = useState<SafetyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("location_safety_scores")
          .select("location, safety_score, total_risk");

        if (error) throw error;

        setRawData(data || []);
      } catch (err: any) {
        console.warn("Failed to fetch heatmap data:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Convert to heatmap points (memoized)
  const heatmapPoints: HeatmapPoint[] = useMemo(() => {
    return convertSafetyDataToHeatmapPoints(rawData);
  }, [rawData]);

  return {
    heatmapPoints,
    loading,
    error,
    rawDataCount: rawData.length,
    mappedCount: heatmapPoints.length,
  };
}
