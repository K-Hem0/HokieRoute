import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { HeatmapPoint } from "@/lib/location-coordinates";
import "@/types/leaflet.heat.d.ts";

interface SafetyHeatmapLayerProps {
  points: HeatmapPoint[];
  visible: boolean;
  isDark?: boolean;
}

export function SafetyHeatmapLayer({ points, visible, isDark = true }: SafetyHeatmapLayerProps) {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    // Remove existing layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!visible || points.length === 0) return;

    // Convert points to heatmap format: [lat, lng, intensity]
    const heatData: [number, number, number][] = points.map((p) => [
      p.lat,
      p.lng,
      p.intensity,
    ]);

    // Custom gradient: green (safe) -> yellow -> red (dangerous)
    const gradient = isDark
      ? {
          0.0: "rgba(34, 197, 94, 0)",    // transparent green
          0.2: "rgba(34, 197, 94, 0.4)",   // green
          0.4: "rgba(250, 204, 21, 0.6)",  // yellow
          0.6: "rgba(249, 115, 22, 0.7)",  // orange
          0.8: "rgba(239, 68, 68, 0.85)",  // red
          1.0: "rgba(185, 28, 28, 0.95)",  // dark red
        }
      : {
          0.0: "rgba(34, 197, 94, 0)",
          0.2: "rgba(34, 197, 94, 0.5)",
          0.4: "rgba(250, 204, 21, 0.6)",
          0.6: "rgba(249, 115, 22, 0.7)",
          0.8: "rgba(239, 68, 68, 0.8)",
          1.0: "rgba(185, 28, 28, 0.9)",
        };

    // Create heat layer
    const heatLayer = L.heatLayer(heatData, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      max: 1.0,
      minOpacity: 0.3,
      gradient,
    });

    heatLayer.addTo(map);
    heatLayerRef.current = heatLayer;

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, points, visible, isDark]);

  return null;
}
