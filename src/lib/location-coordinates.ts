/**
 * Mapping of location names/keywords to coordinates for heatmap display
 * Coordinates are [lat, lng] for Leaflet compatibility
 */

export interface LocationCoordinate {
  name: string;
  keywords: string[];
  coordinates: [number, number]; // [lat, lng]
}

// Comprehensive mapping of VT campus and Blacksburg locations
export const LOCATION_COORDINATES: LocationCoordinate[] = [
  // Academic Buildings
  { name: "Torgersen Hall", keywords: ["torgersen", "torg"], coordinates: [37.2295, -80.4195] },
  { name: "Newman Library", keywords: ["newman library", "library", "560 drillfield"], coordinates: [37.2280, -80.4140] },
  { name: "McBryde Hall", keywords: ["mcbryde", "math"], coordinates: [37.2295, -80.4248] },
  { name: "Burruss Hall", keywords: ["burruss", "admin", "800 drillfield"], coordinates: [37.2290, -80.4175] },
  { name: "Hancock Hall", keywords: ["hancock"], coordinates: [37.2302, -80.4243] },
  { name: "Hahn Hall North", keywords: ["hahn hall north", "900 west campus"], coordinates: [37.2284, -80.4261] },
  { name: "Hahn Hall South", keywords: ["hahn hall south", "hahn south", "800 west campus"], coordinates: [37.2279, -80.4257] },
  { name: "Goodwin Hall", keywords: ["goodwin", "635 prices fork"], coordinates: [37.2310, -80.4260] },
  { name: "Derring Hall", keywords: ["derring"], coordinates: [37.2285, -80.4230] },
  { name: "Randolph Hall", keywords: ["randolph"], coordinates: [37.2290, -80.4220] },
  { name: "Holden Hall", keywords: ["holden"], coordinates: [37.2288, -80.4215] },
  { name: "Norris Hall", keywords: ["norris"], coordinates: [37.2292, -80.4240] },
  { name: "Patton Hall", keywords: ["patton"], coordinates: [37.2296, -80.4250] },
  { name: "Whittemore Hall", keywords: ["whittemore"], coordinates: [37.2300, -80.4248] },
  { name: "Durham Hall", keywords: ["durham"], coordinates: [37.2305, -80.4230] },
  { name: "Eggleston Hall", keywords: ["eggleston", "440 drillfield"], coordinates: [37.2282, -80.4185] },
  
  // Student Centers & Dining
  { name: "Squires Student Center", keywords: ["squires", "student center", "290 college"], coordinates: [37.2280, -80.4130] },
  { name: "Owens Dining Hall", keywords: ["owens", "dining"], coordinates: [37.2270, -80.4165] },
  { name: "Dietrick Hall", keywords: ["dietrick", "d2", "deet", "285 ag quad"], coordinates: [37.2245, -80.4210] },
  { name: "Graduate Life Center", keywords: ["graduate life center", "glc", "155 otey"], coordinates: [37.2275, -80.4155] },
  
  // Sports Venues
  { name: "Lane Stadium", keywords: ["lane stadium", "stadium", "beamer", "185 beamer"], coordinates: [37.2200, -80.4180] },
  { name: "Cassell Coliseum", keywords: ["cassell", "coliseum", "basketball"], coordinates: [37.2220, -80.4185] },
  { name: "War Memorial Hall", keywords: ["war memorial", "gym", "370 alumni"], coordinates: [37.2285, -80.4155] },
  
  // Residence Halls
  { name: "Pritchard Hall", keywords: ["pritchard", "pritch", "630 washington"], coordinates: [37.2260, -80.4195] },
  { name: "Slusher Hall", keywords: ["slusher", "slush", "201 ag quad"], coordinates: [37.2240, -80.4225] },
  { name: "Ambler Johnston Hall", keywords: ["ambler johnston", "aj", "ambler", "700 washington", "720 washington"], coordinates: [37.2235, -80.4175] },
  { name: "Vawter Hall", keywords: ["vawter", "180 kent"], coordinates: [37.2265, -80.4160] },
  { name: "Payne Hall", keywords: ["payne", "600 washington"], coordinates: [37.2248, -80.4218] },
  { name: "Harper Hall", keywords: ["harper", "240 west campus"], coordinates: [37.2226, -80.4232] },
  { name: "Hoge Hall", keywords: ["hoge", "570 washington"], coordinates: [37.2252, -80.4188] },
  { name: "Miles Hall", keywords: ["miles", "410 washington"], coordinates: [37.2255, -80.4180] },
  { name: "Pearson Hall", keywords: ["pearson", "310 alumni"], coordinates: [37.2280, -80.4160] },
  { name: "Whitehurst Hall", keywords: ["whitehurst", "240 kent"], coordinates: [37.2268, -80.4165] },
  { name: "Newman Hall", keywords: ["newman hall", "200 kent"], coordinates: [37.2270, -80.4168] },
  { name: "Cochrane Hall", keywords: ["cochrane", "770 washington"], coordinates: [37.2242, -80.4172] },
  { name: "New Hall West", keywords: ["new hall west", "190 west campus"], coordinates: [37.2230, -80.4215] },
  
  // Landmarks & Areas
  { name: "Drillfield", keywords: ["drillfield", "drill"], coordinates: [37.2290, -80.4150] },
  { name: "Duck Pond", keywords: ["duck pond", "pond"], coordinates: [37.2230, -80.4280] },
  { name: "Huckleberry Trail", keywords: ["huckleberry", "trail"], coordinates: [37.2320, -80.4250] },
  
  // Downtown & Off-Campus
  { name: "Downtown Blacksburg", keywords: ["downtown", "main street", "south main", "1311 south main"], coordinates: [37.2295, -80.4095] },
  { name: "Draper Road", keywords: ["draper", "204 draper"], coordinates: [37.2300, -80.4100] },
  
  // Other Campus Buildings
  { name: "Public Safety Building", keywords: ["public safety", "330 sterrett"], coordinates: [37.2235, -80.4165] },
  { name: "Creativity and Innovation District", keywords: ["creativity", "innovation district", "185 kent"], coordinates: [37.2272, -80.4162] },
  { name: "Special Purpose Housing", keywords: ["special purpose", "2875 oak lane", "oak lane"], coordinates: [37.2180, -80.4050] },
];

/**
 * Match a location string to coordinates using keyword matching
 */
export function matchLocationToCoordinates(
  locationString: string
): [number, number] | null {
  const lower = locationString.toLowerCase();
  
  for (const loc of LOCATION_COORDINATES) {
    // Check each keyword
    for (const keyword of loc.keywords) {
      if (lower.includes(keyword)) {
        return loc.coordinates;
      }
    }
    // Also check the name
    if (lower.includes(loc.name.toLowerCase())) {
      return loc.coordinates;
    }
  }
  
  return null;
}

/**
 * Extract coordinates with safety scores for heatmap data
 */
export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number; // 0-1 scale, higher = more dangerous
  location: string;
  safetyScore: number;
  totalRisk: number;
}

export function convertSafetyDataToHeatmapPoints(
  safetyData: Array<{ location: string; safety_score: number; total_risk: number }>
): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];
  
  for (const data of safetyData) {
    const coords = matchLocationToCoordinates(data.location);
    if (coords) {
      // Convert risk to intensity (higher risk = higher intensity)
      // Normalize: max risk in data is ~52, so divide by 60 for 0-1 scale
      const intensity = Math.min(data.total_risk / 50, 1);
      
      points.push({
        lat: coords[0],
        lng: coords[1],
        intensity,
        location: data.location,
        safetyScore: data.safety_score,
        totalRisk: data.total_risk,
      });
    }
  }
  
  return points;
}
