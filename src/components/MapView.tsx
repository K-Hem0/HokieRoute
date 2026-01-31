import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Route } from "@/lib/mock-data";

// Public Mapbox token - this is a publishable key
const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtYmhxcW44cjA0cGYyanNkYjQ3cTNrcWMifQ.to60WE2Ma41bIrlxUJcIQQ";

// Blacksburg, VA center
const BLACKSBURG_CENTER: [number, number] = [-80.4139, 37.2296];

interface MapViewProps {
  selectedRoute?: Route | null;
  onMapClick?: () => void;
  userLocation?: [number, number];
  isNavigating?: boolean;
  isDark?: boolean;
}

const MapView = ({ 
  selectedRoute, 
  onMapClick, 
  userLocation, 
  isNavigating = false,
  isDark = true 
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const routeLayerId = useRef<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
      center: userLocation || BLACKSBURG_CENTER,
      zoom: 14,
      attributionControl: false,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    map.current.on("click", () => {
      onMapClick?.();
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map style when theme changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    const newStyle = isDark 
      ? "mapbox://styles/mapbox/dark-v11" 
      : "mapbox://styles/mapbox/light-v11";
    
    map.current.setStyle(newStyle);
    
    // Re-add route after style change
    map.current.once("style.load", () => {
      if (selectedRoute && routeLayerId.current) {
        addRouteToMap(selectedRoute);
      }
    });
  }, [isDark, mapLoaded]);

  const addRouteToMap = (route: Route) => {
    if (!map.current) return;

    const sourceId = `route-${route.id}`;
    routeLayerId.current = sourceId;

    // Check if source already exists
    if (map.current.getSource(sourceId)) {
      map.current.removeLayer(sourceId);
      map.current.removeSource(sourceId);
    }

    // Add route source and layer
    map.current.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: route.coordinates,
        },
      },
    });

    map.current.addLayer({
      id: sourceId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": isNavigating ? "#8B5CF6" : "#8B5CF6",
        "line-width": isNavigating ? 6 : 4,
        "line-opacity": isNavigating ? 1 : 0.8,
      },
    });
  };

  // Handle route display
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing route layer
    if (routeLayerId.current) {
      if (map.current.getLayer(routeLayerId.current)) {
        map.current.removeLayer(routeLayerId.current);
      }
      if (map.current.getSource(routeLayerId.current)) {
        map.current.removeSource(routeLayerId.current);
      }
    }

    if (!selectedRoute) return;

    addRouteToMap(selectedRoute);

    // Fit map to route bounds
    const bounds = selectedRoute.coordinates.reduce(
      (bounds, coord) => bounds.extend(coord as [number, number]),
      new mapboxgl.LngLatBounds(
        selectedRoute.coordinates[0] as [number, number],
        selectedRoute.coordinates[0] as [number, number]
      )
    );

    const padding = isNavigating 
      ? { top: 150, bottom: 100, left: 50, right: 50 }
      : { top: 100, bottom: 300, left: 50, right: 50 };

    map.current.fitBounds(bounds, {
      padding,
      duration: 500,
    });
  }, [selectedRoute, mapLoaded, isNavigating]);

  // Update route style when navigation state changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !routeLayerId.current) return;
    
    if (map.current.getLayer(routeLayerId.current)) {
      map.current.setPaintProperty(routeLayerId.current, "line-width", isNavigating ? 6 : 4);
      map.current.setPaintProperty(routeLayerId.current, "line-opacity", isNavigating ? 1 : 0.8);
    }
  }, [isNavigating, mapLoaded]);

  return (
    <div 
      ref={mapContainer} 
      className={`absolute inset-0 transition-opacity duration-300 ${
        isNavigating ? "" : ""
      }`} 
    />
  );
};

export { MapView };
