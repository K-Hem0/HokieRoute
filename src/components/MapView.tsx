import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Route } from "@/lib/mock-data";
import { SafetyHeatmapLayer } from "./map/SafetyHeatmapLayer";
import { HeatmapToggle } from "./map/HeatmapToggle";
import { useHeatmapData } from "@/hooks/useHeatmapData";

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

// Custom user location icon with premium styling
const createUserIcon = () => {
  return L.divIcon({
    className: "user-location-marker",
    html: `
      <div class="user-marker-container">
        <div class="user-marker-pulse"></div>
        <div class="user-marker-dot"></div>
      </div>
      <style>
        .user-marker-container {
          position: relative;
          width: 24px;
          height: 24px;
        }
        .user-marker-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 16px;
          height: 16px;
          background: hsl(262, 83%, 58%);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
        }
        .user-marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 24px;
          height: 24px;
          background: rgba(139, 92, 246, 0.3);
          border-radius: 50%;
          animation: userPulse 2s ease-out infinite;
        }
        @keyframes userPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Custom destination icon - VT Turkey Foot in orange/maroon
const createDestinationIcon = () => {
  return L.divIcon({
    className: "destination-marker",
    html: `
      <div class="hokie-foot-container">
        <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Shadow -->
          <ellipse cx="18" cy="42" rx="8" ry="2" fill="rgba(0,0,0,0.2)"/>
          <!-- Turkey foot SVG - maroon outline with orange fill -->
          <g transform="translate(4, 2) scale(0.7)">
            <!-- Center toe -->
            <path d="M20 2C20 2 18 8 18 12C18 16 20 22 20 22C20 22 22 16 22 12C22 8 20 2 20 2Z" 
                  fill="#E87722" stroke="#660000" stroke-width="2.5" stroke-linejoin="round"/>
            <!-- Left toe -->
            <path d="M8 18C8 18 10 14 14 14C18 14 18 18 18 22C18 22 14 20 12 22C10 24 8 18 8 18Z" 
                  fill="#E87722" stroke="#660000" stroke-width="2.5" stroke-linejoin="round"/>
            <!-- Right toe -->
            <path d="M32 18C32 18 30 14 26 14C22 14 22 18 22 22C22 22 26 20 28 22C30 24 32 18 32 18Z" 
                  fill="#E87722" stroke="#660000" stroke-width="2.5" stroke-linejoin="round"/>
            <!-- Heel/palm -->
            <ellipse cx="20" cy="26" rx="6" ry="4" fill="#E87722" stroke="#660000" stroke-width="2.5"/>
          </g>
        </svg>
      </div>
      <style>
        .hokie-foot-container {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
      </style>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 42],
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
      map.fitBounds(bounds, { padding, maxZoom: 17 });
      return;
    }

    // Priority 2: Fit to selected preset route
    if (selectedRoute && selectedRoute.coordinates.length > 0) {
      const latLngs = selectedRoute.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
      const bounds = L.latLngBounds(latLngs);
      const padding: [number, number] = isNavigating ? [150, 50] : [100, 50];
      map.fitBounds(bounds, { padding, maxZoom: 17 });
      return;
    }

    // Priority 3: Fly to destination marker
    if (destinationMarker) {
      const [lng, lat] = destinationMarker;
      map.flyTo([lat, lng], 17, { duration: 0.8 });
      return;
    }

    // Priority 4: Center on user location (only if changed significantly)
    const [lat, lng] = center;
    if (
      !lastCenter.current ||
      Math.abs(lastCenter.current[0] - lat) > 0.001 ||
      Math.abs(lastCenter.current[1] - lng) > 0.001
    ) {
      map.flyTo(center, 16, { duration: 0.8 });
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
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const { heatmapPoints, loading: heatmapLoading } = useHeatmapData();

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

  // OpenStreetMap-based tile layers optimized for pedestrian navigation
  // CARTO Voyager: Clean, readable style with subtle labels
  // CARTO Dark Matter Lite: Slightly brighter dark mode for better visibility
  const lightTiles = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  const darkTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

  // Apply brightness boost to dark mode tiles via CSS
  const darkTileStyle = isDark ? { filter: "brightness(1.3) contrast(1.1)" } : {};

  const mapCenter: [number, number] = userLatLng || BLACKSBURG_CENTER;

  // Route styling with navigation mode enhancement - brighter for dark mode
  const routeStyle = {
    color: isDark ? "#A78BFA" : "#8B5CF6", // Lighter violet in dark mode
    weight: isNavigating ? 8 : 6,
    opacity: 1,
    lineCap: "round" as const,
    lineJoin: "round" as const,
  };

  // Route outline for better visibility - glow effect in dark mode
  const routeOutlineStyle = {
    color: isDark ? "#7C3AED" : "#ffffff",
    weight: isNavigating ? 14 : 12,
    opacity: isDark ? 0.6 : 0.8,
    lineCap: "round" as const,
    lineJoin: "round" as const,
  };

  return (
    <div 
      className={`absolute inset-0 ${isNavigating ? "navigation-mode" : ""}`} 
      style={{ zIndex: 0, isolation: 'isolate', ...darkTileStyle }}
    >
      <MapContainer
        center={mapCenter}
        zoom={16}
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

        {/* Safety heatmap layer */}
        <SafetyHeatmapLayer
          points={heatmapPoints}
          visible={heatmapEnabled}
          isDark={isDark}
        />

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

        {/* Preset route polyline (outline + main) */}
        {routeLatLngs.length > 0 && !calculatedRoute && (
          <>
            <Polyline positions={routeLatLngs} pathOptions={routeOutlineStyle} />
            <Polyline positions={routeLatLngs} pathOptions={routeStyle} />
          </>
        )}

        {/* Calculated route polyline (outline + main) */}
        {calculatedLatLngs.length > 0 && (
          <>
            <Polyline positions={calculatedLatLngs} pathOptions={routeOutlineStyle} />
            <Polyline positions={calculatedLatLngs} pathOptions={routeStyle} />
          </>
        )}
      </MapContainer>

      {/* Click overlay to detect map taps */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 400 }}
        onClick={onMapClick}
      />

      {/* Navigation mode overlay - dims non-route areas */}
      {isNavigating && (
        <div 
          className="absolute inset-0 pointer-events-none bg-background/20"
          style={{ zIndex: 1 }}
        />
      )}

      {/* Heatmap toggle button - positioned bottom-left above zoom controls */}
      <div className="absolute bottom-28 left-4" style={{ zIndex: 1000 }}>
        <HeatmapToggle
          enabled={heatmapEnabled}
          onToggle={() => setHeatmapEnabled(!heatmapEnabled)}
          loading={heatmapLoading}
        />
      </div>
    </div>
  );
};

export { MapView };
