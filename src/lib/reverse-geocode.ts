/**
 * Reverse geocoding utility for Blacksburg/VT area.
 * Uses OSRM nearest endpoint for street-level accuracy, with Nominatim fallback.
 *
 * COORDINATE CONVENTION:
 * - This module expects (lat, lng) for geographic coordinates.
 * - OSRM API uses {lng},{lat} in URL path.
 * - Nominatim API uses lat/lon parameters explicitly.
 * - Leaflet uses [lat, lng].
 * - Our app stores [lng, lat] internally (GeoJSON convention).
 */

// OSRM foot-profile server (same as routing)
const OSRM_NEAREST_URL = "https://routing.openstreetmap.de/routed-foot/nearest/v1/foot";

// Blacksburg/VT bounding box for geocoding bias
const BLACKSBURG_BOUNDS = {
  south: 37.18,
  north: 37.28,
  west: -80.50,
  east: -80.35,
};

// Build viewbox param: "west,south,east,north"
const VIEWBOX = `${BLACKSBURG_BOUNDS.west},${BLACKSBURG_BOUNDS.south},${BLACKSBURG_BOUNDS.east},${BLACKSBURG_BOUNDS.north}`;

export interface ReverseGeocodeResult {
  /** Formatted display label */
  label: string;
  /** Street name from OSRM if available */
  streetName?: string;
  /** Distance to nearest road in meters */
  distanceToRoad?: number;
  /** Raw data from API */
  raw?: Record<string, unknown>;
}

/**
 * Get nearest street/road using OSRM nearest endpoint.
 * Returns the street name and snapped location.
 */
async function getOsrmNearest(lat: number, lng: number): Promise<{
  streetName: string | null;
  distance: number;
  location: [number, number]; // [lng, lat]
} | null> {
  try {
    // OSRM uses {lng},{lat} format in URL
    const url = `${OSRM_NEAREST_URL}/${lng},${lat}?number=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.warn("[OSRM nearest] Request failed:", response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.code !== "Ok" || !data.waypoints?.length) {
      return null;
    }

    const waypoint = data.waypoints[0];
    return {
      streetName: waypoint.name || null,
      distance: waypoint.distance || 0,
      location: waypoint.location as [number, number],
    };
  } catch (error) {
    console.error("[OSRM nearest] Error:", error);
    return null;
  }
}

/**
 * Get additional context from Nominatim (POI names, house numbers).
 */
async function getNominatimContext(lat: number, lng: number): Promise<{
  poiName?: string;
  houseNumber?: string;
  road?: string;
  city?: string;
  raw?: Record<string, unknown>;
} | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lon", lng.toString());
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("namedetails", "1");
    url.searchParams.set("zoom", "18");
    url.searchParams.set("viewbox", VIEWBOX);
    url.searchParams.set("bounded", "0");

    const response = await fetch(url.toString(), {
      headers: { "Accept-Language": "en" },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.error) return null;

    const addr = data.address || {};
    
    const poiName =
      (typeof data.name === "string" && data.name.trim()) ||
      (data.namedetails?.name?.trim()) ||
      (addr.building?.trim()) ||
      (addr.amenity?.trim()) ||
      (addr.tourism?.trim()) ||
      undefined;

    return {
      poiName,
      houseNumber: addr.house_number,
      road: addr.road,
      city: addr.city || addr.town || addr.village,
      raw: data,
    };
  } catch (error) {
    console.error("[Nominatim] Error:", error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to a human-readable address.
 * Uses OSRM nearest for accurate street-level data, with Nominatim for context.
 *
 * @param lat Latitude (e.g., 37.2296)
 * @param lng Longitude (e.g., -80.4139)
 * @returns Formatted address string
 *
 * Label priority:
 * 1. "{house_number} {street}, Blacksburg, VA" if house_number exists
 * 2. POI name (building/amenity/name) if available
 * 3. "Near {street}, Blacksburg, VA" from OSRM
 * 4. "{road}, {city}" from Nominatim fallback
 * 5. "Location unavailable" if nothing found
 */
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  // Run both requests in parallel for speed
  const [osrmResult, nominatimResult] = await Promise.all([
    getOsrmNearest(lat, lng),
    getNominatimContext(lat, lng),
  ]);

  const streetName = osrmResult?.streetName;
  const distanceToRoad = osrmResult?.distance;

  // Priority 1: house_number + street from Nominatim
  if (nominatimResult?.houseNumber && (streetName || nominatimResult?.road)) {
    const road = streetName || nominatimResult.road;
    const label = `${nominatimResult.houseNumber} ${road}, Blacksburg, VA`;
    return { label, streetName: road, distanceToRoad, raw: nominatimResult.raw };
  }

  // Priority 2: POI name (building/amenity) from Nominatim
  if (nominatimResult?.poiName) {
    return {
      label: nominatimResult.poiName,
      streetName,
      distanceToRoad,
      raw: nominatimResult.raw,
    };
  }

  // Priority 3: OSRM street name (most accurate for navigation)
  if (streetName && streetName.trim()) {
    const label = `Near ${streetName}, Blacksburg, VA`;
    return { label, streetName, distanceToRoad };
  }

  // Priority 4: Nominatim road + city fallback
  if (nominatimResult?.road) {
    const city = nominatimResult.city || "Blacksburg";
    const label = `${nominatimResult.road}, ${city}`;
    return { label, streetName: nominatimResult.road, raw: nominatimResult.raw };
  }

  // No valid address found
  return { label: "Location unavailable" };
}

/**
 * Convenience wrapper that accepts [lng, lat] array (GeoJSON/app convention)
 * and returns just the label string.
 */
export async function reverseGeocodeFromLngLat(lngLat: [number, number]): Promise<string> {
  const [lng, lat] = lngLat;
  const result = await reverseGeocode(lat, lng);
  return result.label;
}
