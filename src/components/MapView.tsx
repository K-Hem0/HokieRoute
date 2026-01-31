import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Route } from "@/lib/mock-data";

// Public Mapbox token - this is a publishable key
const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtYmhxcW44cjA0cGYyanNkYjQ3cTNrcWMifQ.to60WE2Ma41bIrlxUJcIQQ";

interface MapViewProps {
  selectedRoute?: Route | null;
  onMapClick?: () => void;
  userLocation?: [number, number];
}

const MapView = ({ selectedRoute, onMapClick, userLocation }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const routeLayerId = useRef<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: userLocation || [-0.1278, 51.5074],
      zoom: 13,
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

    const sourceId = `route-${selectedRoute.id}`;
    routeLayerId.current = sourceId;

    // Add route source and layer
    map.current.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: selectedRoute.coordinates,
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
        "line-color": "#8B5CF6",
        "line-width": 4,
        "line-opacity": 0.8,
      },
    });

    // Fit map to route bounds
    const bounds = selectedRoute.coordinates.reduce(
      (bounds, coord) => bounds.extend(coord as [number, number]),
      new mapboxgl.LngLatBounds(
        selectedRoute.coordinates[0] as [number, number],
        selectedRoute.coordinates[0] as [number, number]
      )
    );

    map.current.fitBounds(bounds, {
      padding: { top: 100, bottom: 300, left: 50, right: 50 },
      duration: 500,
    });
  }, [selectedRoute, mapLoaded]);

  return (
    <div ref={mapContainer} className="absolute inset-0" />
  );
};

export { MapView };
