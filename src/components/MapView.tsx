import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Route } from "@/lib/mock-data";

// Blacksburg, VA center
const BLACKSBURG_CENTER: [number, number] = [37.2296, -80.4139]; // [lat, lng] for Leaflet

interface MapViewProps {
  selectedRoute?: Route | null;
  onMapClick?: () => void;
  userLocation?: [number, number] | null; // [lng, lat] from geolocation
  isNavigating?: boolean;
  isDark?: boolean;
  destinationMarker?: [number, number] | null; // [lng, lat]
  calculatedRoute?: [number, number][] | null; // [lng, lat] pairs from OSRM
}

// Custom user location icon
const createUserIcon = () => {
  return L.divIcon({
    className: "user-location-marker",
    html: `
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
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Custom destination icon
const createDestinationIcon = () => {
  return L.divIcon({
    className: "destination-marker",
    html: `
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
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Component to handle map view updates
const MapController = ({
  center,
  selectedRoute,
  destinationMarker,
  isNavigating,
  calculatedRoute,
}: {
  center: [number, number];
  selectedRoute?: Route | null;
  destinationMarker?: [number, number] | null;
  isNavigating?: boolean;
  calculatedRoute?: [number, number][] | null;
}) => {
  const map = useMap();
  const lastCenter = useRef<[number, number] | null>(null);

  useEffect(() => {
    // Priority 1: Fit to calculated route
    if (calculatedRoute && calculatedRoute.length > 0) {
      const latLngs = calculatedRoute.map(([lng, lat]) => [lat, lng] as [number, number]);
      const bounds = L.latLngBounds(latLngs);
      const padding: [number, number] = isNavigating ? [150, 50] : [100, 50];
      map.fitBounds(bounds, { padding });
      return;
    }

    // Priority 2: Fit to selected preset route
    if (selectedRoute && selectedRoute.coordinates.length > 0) {
      const latLngs = selectedRoute.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
      const bounds = L.latLngBounds(latLngs);
      const padding: [number, number] = isNavigating ? [150, 50] : [100, 50];
      map.fitBounds(bounds, { padding });
      return;
    }

    // Priority 3: Fly to destination marker
    if (destinationMarker) {
      const [lng, lat] = destinationMarker;
      map.flyTo([lat, lng], 16, { duration: 1 });
      return;
    }

    // Priority 4: Center on user location (only if changed significantly)
    const [lat, lng] = center;
    if (
      !lastCenter.current ||
      Math.abs(lastCenter.current[0] - lat) > 0.001 ||
      Math.abs(lastCenter.current[1] - lng) > 0.001
    ) {
      map.flyTo(center, 15, { duration: 1 });
      lastCenter.current = center;
    }
  }, [map, center, selectedRoute, destinationMarker, isNavigating, calculatedRoute]);

  return null;
};

const MapView = ({
  selectedRoute,
  onMapClick,
  userLocation,
  isNavigating = false,
  isDark = true,
  destinationMarker,
  calculatedRoute,
}: MapViewProps) => {
  const [mapReady, setMapReady] = useState(false);

  // Convert [lng, lat] to [lat, lng] for Leaflet
  const userLatLng: [number, number] | null = userLocation
    ? [userLocation[1], userLocation[0]]
    : null;

  const destLatLng: [number, number] | null = destinationMarker
    ? [destinationMarker[1], destinationMarker[0]]
    : null;

  // Convert route coordinates from [lng, lat] to [lat, lng]
  const routeLatLngs: [number, number][] = selectedRoute
    ? selectedRoute.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])
    : [];

  // Convert calculated route from [lng, lat] to [lat, lng]
  const calculatedLatLngs: [number, number][] = calculatedRoute
    ? calculatedRoute.map(([lng, lat]) => [lat, lng] as [number, number])
    : [];

  // Tile layer URLs
  const lightTiles = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  const darkTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const mapCenter: [number, number] = userLatLng || BLACKSBURG_CENTER;

  return (
    <div className="absolute inset-0">
      <MapContainer
        center={mapCenter}
        zoom={15}
        zoomControl={false}
        className="h-full w-full"
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          key={isDark ? "dark" : "light"}
          attribution={attribution}
          url={isDark ? darkTiles : lightTiles}
        />

        <ZoomControl position="bottomright" />

        <MapController
          center={mapCenter}
          selectedRoute={selectedRoute}
          destinationMarker={destinationMarker}
          isNavigating={isNavigating}
          calculatedRoute={calculatedRoute}
        />

        {/* User location marker */}
        {userLatLng && <Marker position={userLatLng} icon={createUserIcon()} />}

        {/* Destination marker */}
        {destLatLng && <Marker position={destLatLng} icon={createDestinationIcon()} />}

        {/* Preset route polyline */}
        {routeLatLngs.length > 0 && !calculatedRoute && (
          <Polyline
            positions={routeLatLngs}
            pathOptions={{
              color: "#8B5CF6",
              weight: isNavigating ? 6 : 4,
              opacity: isNavigating ? 1 : 0.8,
            }}
          />
        )}

        {/* Calculated route polyline */}
        {calculatedLatLngs.length > 0 && (
          <Polyline
            positions={calculatedLatLngs}
            pathOptions={{
              color: "#8B5CF6",
              weight: isNavigating ? 6 : 4,
              opacity: 1,
            }}
          />
        )}
      </MapContainer>

      {/* Click overlay to detect map taps */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 400 }}
        onClick={onMapClick}
      />
    </div>
  );
};

export { MapView };
