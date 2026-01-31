import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Route } from "@/lib/mock-data";

// Use environment variable for Mapbox token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

// Blacksburg, VA center
const BLACKSBURG_CENTER: [number, number] = [-80.4139, 37.2296];

interface MapViewProps {
  selectedRoute?: Route | null;
  onMapClick?: () => void;
  userLocation?: [number, number] | null;
  isNavigating?: boolean;
  isDark?: boolean;
  destinationMarker?: [number, number] | null;
}

const MapView = ({ 
  selectedRoute, 
  onMapClick, 
  userLocation, 
  isNavigating = false,
  isDark = true,
  destinationMarker,
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const destMarker = useRef<mapboxgl.Marker | null>(null);
  const routeLayerId = useRef<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const center = userLocation || BLACKSBURG_CENTER;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
      center: center,
      zoom: 15,
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
      userMarker.current?.remove();
      destMarker.current?.remove();
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

  // Update user location marker
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (userLocation) {
      if (userMarker.current) {
        userMarker.current.setLngLat(userLocation);
      } else {
        // Create user location marker with pulsing effect
        const el = document.createElement("div");
        el.className = "user-location-marker";
        el.innerHTML = `
          <div style="
            width: 20px;
            height: 20px;
            background: hsl(262, 83%, 58%);
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
            animation: pulse 2s infinite;
          "></div>
          <style>
            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
              70% { box-shadow: 0 0 0 15px rgba(139, 92, 246, 0); }
              100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
            }
          </style>
        `;
        
        userMarker.current = new mapboxgl.Marker({ element: el })
          .setLngLat(userLocation)
          .addTo(map.current);
      }

      // Center on user if no route selected
      if (!selectedRoute) {
        map.current.flyTo({
          center: userLocation,
          zoom: 15,
          duration: 1000,
        });
      }
    }
  }, [userLocation, mapLoaded, selectedRoute]);

  // Update destination marker
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (destinationMarker) {
      if (destMarker.current) {
        destMarker.current.setLngLat(destinationMarker);
      } else {
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="
            width: 32px;
            height: 32px;
            background: hsl(262, 83%, 58%);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <div style="
              width: 12px;
              height: 12px;
              background: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `;
        
        destMarker.current = new mapboxgl.Marker({ element: el, offset: [0, -16] })
          .setLngLat(destinationMarker)
          .addTo(map.current);
      }

      // Fly to destination
      map.current.flyTo({
        center: destinationMarker,
        zoom: 16,
        duration: 1000,
      });
    } else {
      destMarker.current?.remove();
      destMarker.current = null;
    }
  }, [destinationMarker, mapLoaded]);

  const addRouteToMap = (route: Route) => {
    if (!map.current) return;

    const sourceId = `route-${route.id}`;
    routeLayerId.current = sourceId;

    // Check if source already exists
    if (map.current.getSource(sourceId)) {
      if (map.current.getLayer(sourceId)) {
        map.current.removeLayer(sourceId);
      }
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
        "line-color": "#8B5CF6",
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
      className="absolute inset-0 transition-opacity duration-300" 
    />
  );
};

export { MapView };
