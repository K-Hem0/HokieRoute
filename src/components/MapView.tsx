import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Route } from "@/lib/mock-data";
import { SafetyHeatmapLayer } from "./map/SafetyHeatmapLayer";
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
  heatmapEnabled?: boolean;
  onHeatmapToggle?: (enabled: boolean) => void;
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
        <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Shadow -->
          <ellipse cx="20" cy="46" rx="10" ry="2" fill="rgba(0,0,0,0.25)"/>
          <!-- Turkey foot - three distinct toes with bumpy texture -->
          <g transform="translate(2, 0)">
            <!-- Center toe (longest) -->
            <path d="M18 4 Q16 6 16 10 Q17 12 16 14 Q15 16 16 18 Q17 20 16 22 Q15 24 17 26 L18 28 L19 26 Q21 24 20 22 Q19 20 20 18 Q21 16 20 14 Q19 12 20 10 Q20 6 18 4 Z" 
                  fill="#E87722" stroke="#861F41" stroke-width="2" stroke-linejoin="round"/>
            <!-- Left toe -->
            <path d="M8 16 Q6 17 5 20 Q5 22 6 24 Q7 25 6 27 Q6 29 8 31 L10 32 Q12 30 12 28 Q11 26 12 25 Q13 24 12 22 Q11 20 12 19 Q13 18 12 17 Q10 15 8 16 Z" 
                  fill="#E87722" stroke="#861F41" stroke-width="2" stroke-linejoin="round"/>
            <!-- Right toe -->
            <path d="M28 16 Q30 17 31 20 Q31 22 30 24 Q29 25 30 27 Q30 29 28 31 L26 32 Q24 30 24 28 Q25 26 24 25 Q23 24 24 22 Q25 20 24 19 Q23 18 24 17 Q26 15 28 16 Z" 
                  fill="#E87722" stroke="#861F41" stroke-width="2" stroke-linejoin="round"/>
            <!-- Heel/palm connection -->
            <ellipse cx="18" cy="34" rx="8" ry="5" fill="#E87722" stroke="#861F41" stroke-width="2"/>
            <!-- Heel bulb -->
            <ellipse cx="18" cy="38" rx="5" ry="4" fill="#E87722" stroke="#861F41" stroke-width="2"/>
          </g>
        </svg>
      </div>
      <style>
        .hokie-foot-container {
          filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
        }
      </style>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 46],
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
  heatmapEnabled: controlledHeatmapEnabled,
  onHeatmapToggle,
}: MapViewProps) => {
  const [mapReady, setMapReady] = useState(false);
  const [internalHeatmapEnabled, setInternalHeatmapEnabled] = useState(false);
  const { heatmapPoints, loading: heatmapLoading } = useHeatmapData();
  
  // Use controlled or internal state
  const heatmapEnabled = controlledHeatmapEnabled ?? internalHeatmapEnabled;

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

  // Day mode: softer, lighter feel for exploration
  // Night mode: enhanced visibility with brighter tiles while maintaining dark aesthetic
  const darkTileStyle = isDark 
    ? { filter: "brightness(1.4) contrast(1.2) saturate(1.1)" } 
    : { filter: "brightness(1.02) contrast(0.98) saturate(1.05)" };

  const mapCenter: [number, number] = userLatLng || BLACKSBURG_CENTER;

  // Route styling - Night mode gets enhanced glow and higher contrast
  const routeStyle = {
    color: isDark ? "#C4B5FD" : "#8B5CF6", // Brighter violet in night mode
    weight: isNavigating ? (isDark ? 10 : 8) : (isDark ? 8 : 6),
    opacity: 1,
    lineCap: "round" as const,
    lineJoin: "round" as const,
  };

  // Route outline - stronger glow effect in night mode
  const routeOutlineStyle = {
    color: isDark ? "#8B5CF6" : "#ffffff",
    weight: isNavigating ? (isDark ? 18 : 14) : (isDark ? 16 : 12),
    opacity: isDark ? 0.7 : 0.8,
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

    </div>
  );
};

export { MapView };
