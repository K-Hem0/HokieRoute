/// <reference types="@types/google.maps" />
import { useRef, useEffect, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { Route } from "@/lib/mock-data";

// Blacksburg, VA center
const BLACKSBURG_CENTER = { lat: 37.2296, lng: -80.4139 };

// Dark mode map style
const darkStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1d1d1d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1d1d1d" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e0e" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1e3a1e" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
];

interface GoogleMapViewProps {
  selectedRoute?: Route | null;
  onMapClick?: () => void;
  userLocation?: [number, number] | null;
  isNavigating?: boolean;
  isDark?: boolean;
  destinationMarker?: { lat: number; lng: number } | null;
}

let optionsSet = false;

const GoogleMapView = ({
  selectedRoute,
  onMapClick,
  userLocation,
  isNavigating = false,
  isDark = true,
  destinationMarker,
}: GoogleMapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const destMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const routePolyline = useRef<google.maps.Polyline | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const initMap = async () => {
      try {
        // Set options only once
        if (!optionsSet) {
          setOptions({
            key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
            v: "weekly",
          });
          optionsSet = true;
        }

        // Import required libraries
        const [mapsLib, markerLib] = await Promise.all([
          importLibrary("maps"),
          importLibrary("marker"),
        ]);

        const center = userLocation
          ? { lat: userLocation[1], lng: userLocation[0] }
          : BLACKSBURG_CENTER;

        mapRef.current = new mapsLib.Map(mapContainer.current!, {
          center,
          zoom: 15,
          mapId: "safe-walk-map",
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
          },
          styles: isDark ? darkStyle : [],
        });

        mapRef.current.addListener("click", () => {
          onMapClick?.();
        });

        setMapLoaded(true);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initMap();

    return () => {
      userMarkerRef.current = null;
      destMarkerRef.current = null;
      routePolyline.current?.setMap(null);
      mapRef.current = null;
    };
  }, []);

  // Update map style when theme changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    mapRef.current.setOptions({
      styles: isDark ? darkStyle : [],
    });
  }, [isDark, mapLoaded]);

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    if (userLocation) {
      const position = { lat: userLocation[1], lng: userLocation[0] };

      if (userMarkerRef.current) {
        userMarkerRef.current.position = position;
      } else {
        // Create pulsing user marker
        const markerElement = document.createElement("div");
        markerElement.innerHTML = `
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

        userMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position,
          content: markerElement,
        });
      }

      // Center on user if no route selected
      if (!selectedRoute && !destinationMarker) {
        mapRef.current.panTo(position);
      }
    }
  }, [userLocation, mapLoaded, selectedRoute, destinationMarker]);

  // Update destination marker
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    if (destinationMarker) {
      const position = destinationMarker;

      if (destMarkerRef.current) {
        destMarkerRef.current.position = position;
      } else {
        const markerElement = document.createElement("div");
        markerElement.innerHTML = `
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

        destMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position,
          content: markerElement,
        });
      }

      mapRef.current.panTo(position);
      mapRef.current.setZoom(16);
    } else {
      if (destMarkerRef.current) {
        destMarkerRef.current.map = null;
        destMarkerRef.current = null;
      }
    }
  }, [destinationMarker, mapLoaded]);

  // Handle route display
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Remove existing route
    if (routePolyline.current) {
      routePolyline.current.setMap(null);
      routePolyline.current = null;
    }

    if (!selectedRoute) return;

    // Draw route polyline
    const path = selectedRoute.coordinates.map((coord) => ({
      lat: coord[1],
      lng: coord[0],
    }));

    routePolyline.current = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#8B5CF6",
      strokeOpacity: isNavigating ? 1 : 0.8,
      strokeWeight: isNavigating ? 6 : 4,
      map: mapRef.current,
    });

    // Fit map to route bounds
    const bounds = new google.maps.LatLngBounds();
    path.forEach((point) => bounds.extend(point));

    const padding = isNavigating
      ? { top: 150, bottom: 100, left: 50, right: 50 }
      : { top: 100, bottom: 300, left: 50, right: 50 };

    mapRef.current.fitBounds(bounds, padding);
  }, [selectedRoute, mapLoaded, isNavigating]);

  // Update route style when navigation state changes
  useEffect(() => {
    if (!routePolyline.current) return;

    routePolyline.current.setOptions({
      strokeWeight: isNavigating ? 6 : 4,
      strokeOpacity: isNavigating ? 1 : 0.8,
    });
  }, [isNavigating]);

  return (
    <div
      ref={mapContainer}
      className="absolute inset-0 transition-opacity duration-300"
    />
  );
};

export { GoogleMapView };
