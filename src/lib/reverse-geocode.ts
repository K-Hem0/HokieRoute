/**
 * Reverse geocoding utility for Blacksburg/VT area.
 * Uses Nominatim (OpenStreetMap) with bounding box bias.
 *
 * COORDINATE CONVENTION:
 * - This module expects (lat, lng) for geographic coordinates.
 * - Nominatim API uses lat/lon parameters explicitly.
 * - Leaflet uses [lat, lng].
 * - Our app stores [lng, lat] internally (GeoJSON convention).
 */

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
  /** Raw address components from Nominatim */
  raw?: Record<string, unknown>;
}

/**
 * Reverse geocode coordinates to a human-readable address.
 *
 * @param lat Latitude (e.g., 37.2296)
 * @param lng Longitude (e.g., -80.4139)
 * @returns Formatted address string
 *
 * Label priority:
 * 1. "{house_number} {road}, Blacksburg, VA" if house_number + road exist
 * 2. POI name (building/amenity/name) if available (preferred on campus)
 * 3. "{road}, {city}" fallback
 * 4. "Location unavailable" if nothing found
 */
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lon", lng.toString());
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("namedetails", "1");
    url.searchParams.set("zoom", "18");
    url.searchParams.set("viewbox", VIEWBOX);
    url.searchParams.set("bounded", "0"); // Bias, not strict

    const response = await fetch(url.toString(), {
      headers: {
        "Accept-Language": "en",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    // Handle "no results" case
    if (data.error) {
      return { label: "Location unavailable", raw: data };
    }

    const addr = data.address || {};

    // Priority 1: house_number + road → "{house_number} {road}, Blacksburg, VA"
    if (addr.house_number && addr.road) {
      const label = `${addr.house_number} ${addr.road}, Blacksburg, VA`;
      return { label, raw: data };
    }

    // Priority 2: POI name (building/amenity/name)
    const poiName =
      (typeof data.name === "string" && data.name.trim()) ||
      (data.namedetails?.name?.trim()) ||
      (addr.building?.trim()) ||
      (addr.amenity?.trim()) ||
      (addr.tourism?.trim());

    if (poiName) {
      return { label: poiName, raw: data };
    }

    // Priority 3: road + city fallback
    const city = addr.city || addr.town || addr.village || "Blacksburg";
    if (addr.road) {
      const label = `${addr.road}, ${city}`;
      return { label, raw: data };
    }

    // No valid address found
    return { label: "Location unavailable", raw: data };
  } catch (error) {
    console.error("[reverseGeocode] Error:", error);
    return { label: "Location unavailable" };
  }
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
