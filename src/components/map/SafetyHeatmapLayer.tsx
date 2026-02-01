import { useEffect, useRef, useState, useCallback } from "react";
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

// Calculate radius based on zoom level - smaller radius when zoomed out
const getRadiusForZoom = (zoom: number): number => {
  // At zoom 17+: full radius (35px)
  // At zoom 14: medium radius (20px)
  // At zoom 12 or less: minimal radius (10px)
  if (zoom >= 17) return 35;
  if (zoom >= 16) return 28;
  if (zoom >= 15) return 22;
  if (zoom >= 14) return 16;
  if (zoom >= 13) return 12;
  return 8;
};

// Calculate blur based on zoom level
const getBlurForZoom = (zoom: number): number => {
  if (zoom >= 17) return 25;
  if (zoom >= 16) return 20;
  if (zoom >= 15) return 16;
  if (zoom >= 14) return 12;
  return 8;
};

// Calculate opacity based on zoom - fade out when zoomed out
const getOpacityForZoom = (zoom: number): number => {
  if (zoom >= 15) return 0.3;
  if (zoom >= 14) return 0.25;
  if (zoom >= 13) return 0.2;
  return 0.15;
};

export function SafetyHeatmapLayer({ points, visible, isDark = true }: SafetyHeatmapLayerProps) {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());

  // Update zoom state on map zoom
  const handleZoom = useCallback(() => {
    setCurrentZoom(map.getZoom());
  }, [map]);

  useEffect(() => {
    map.on("zoomend", handleZoom);
    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map, handleZoom]);

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

    // Custom gradient: violet-based (safe violet -> warm violet -> magenta for danger)
    const gradient = isDark
      ? {
          0.0: "rgba(139, 92, 246, 0)",       // transparent violet
          0.2: "rgba(139, 92, 246, 0.4)",     // violet (primary)
          0.4: "rgba(167, 139, 250, 0.5)",    // light violet
          0.6: "rgba(192, 132, 252, 0.6)",    // purple
          0.8: "rgba(217, 70, 239, 0.75)",    // magenta
          1.0: "rgba(236, 72, 153, 0.9)",     // pink/danger
        }
      : {
          0.0: "rgba(139, 92, 246, 0)",
          0.2: "rgba(139, 92, 246, 0.35)",
          0.4: "rgba(167, 139, 250, 0.45)",
          0.6: "rgba(192, 132, 252, 0.55)",
          0.8: "rgba(217, 70, 239, 0.7)",
          1.0: "rgba(236, 72, 153, 0.85)",
        };

    // Create heat layer with zoom-responsive sizing
    const heatLayer = L.heatLayer(heatData, {
      radius: getRadiusForZoom(currentZoom),
      blur: getBlurForZoom(currentZoom),
      maxZoom: 17,
      max: 1.0,
      minOpacity: getOpacityForZoom(currentZoom),
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
  }, [map, points, visible, isDark, currentZoom]);

  return null;
}
