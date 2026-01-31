/**
 * VT Campus Pedestrian Path Network
 * 
 * This defines the walkable path network on Virginia Tech's campus.
 * Nodes represent intersections, building entrances, and landmarks.
 * Edges represent walkways connecting nodes with distances in meters.
 */

export interface PathNode {
  id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  type: 'building' | 'intersection' | 'landmark' | 'entrance';
}

export interface PathEdge {
  from: string; // node id
  to: string; // node id
  distance: number; // meters
  type: 'sidewalk' | 'path' | 'crosswalk' | 'stairs' | 'bridge';
  accessible?: boolean; // wheelchair accessible
}

// Campus path nodes - buildings, intersections, and landmarks
export const CAMPUS_NODES: PathNode[] = [
  // === Main Drillfield Area ===
  { id: 'torgersen', name: 'Torgersen Hall', coordinates: [-80.4192, 37.2296], type: 'building' },
  { id: 'torgersen-bridge', name: 'Torgersen Bridge', coordinates: [-80.4188, 37.2293], type: 'landmark' },
  { id: 'newman', name: 'Newman Library', coordinates: [-80.4188, 37.2285], type: 'building' },
  { id: 'squires', name: 'Squires Student Center', coordinates: [-80.4179, 37.2292], type: 'building' },
  { id: 'burruss', name: 'Burruss Hall', coordinates: [-80.4228, 37.2292], type: 'building' },
  { id: 'drillfield-center', name: 'Drillfield Center', coordinates: [-80.4205, 37.2281], type: 'intersection' },
  { id: 'drillfield-west', name: 'Drillfield West', coordinates: [-80.4230, 37.2275], type: 'intersection' },
  { id: 'drillfield-east', name: 'Drillfield East', coordinates: [-80.4175, 37.2280], type: 'intersection' },
  { id: 'war-memorial', name: 'War Memorial Chapel', coordinates: [-80.4236, 37.2277], type: 'landmark' },
  
  // === Engineering Area ===
  { id: 'goodwin', name: 'Goodwin Hall', coordinates: [-80.4197, 37.2305], type: 'building' },
  { id: 'whittemore', name: 'Whittemore Hall', coordinates: [-80.4187, 37.2311], type: 'building' },
  { id: 'durham', name: 'Durham Hall', coordinates: [-80.4175, 37.2313], type: 'building' },
  { id: 'norris', name: 'Norris Hall', coordinates: [-80.4203, 37.2291], type: 'building' },
  { id: 'randolph', name: 'Randolph Hall', coordinates: [-80.4210, 37.2296], type: 'building' },
  { id: 'hancock', name: 'Hancock Hall', coordinates: [-80.4198, 37.2282], type: 'building' },
  { id: 'holden', name: 'Holden Hall', coordinates: [-80.4211, 37.2275], type: 'building' },
  { id: 'patton', name: 'Patton Hall', coordinates: [-80.4226, 37.2298], type: 'building' },
  
  // === Perry Street Corridor ===
  { id: 'perry-whittemore', name: 'Perry St @ Whittemore', coordinates: [-80.4182, 37.2315], type: 'intersection' },
  { id: 'perry-goodwin', name: 'Perry St @ Goodwin', coordinates: [-80.4190, 37.2308], type: 'intersection' },
  { id: 'perry-torg', name: 'Perry St @ Torgersen', coordinates: [-80.4195, 37.2300], type: 'intersection' },
  
  // === Academic Buildings ===
  { id: 'mcbryde', name: 'McBryde Hall', coordinates: [-80.4238, 37.2285], type: 'building' },
  { id: 'davidson', name: 'Davidson Hall', coordinates: [-80.4245, 37.2290], type: 'building' },
  { id: 'pamplin', name: 'Pamplin Hall', coordinates: [-80.4254, 37.2295], type: 'building' },
  
  // === Arts & Student Life ===
  { id: 'moss-arts', name: 'Moss Arts Center', coordinates: [-80.4149, 37.2308], type: 'building' },
  { id: 'glc', name: 'Graduate Life Center', coordinates: [-80.4172, 37.2271], type: 'building' },
  { id: 'alumni-mall', name: 'Alumni Mall', coordinates: [-80.4160, 37.2295], type: 'intersection' },
  
  // === Dining ===
  { id: 'owens', name: 'Owens Dining Hall', coordinates: [-80.4161, 37.2252], type: 'building' },
  { id: 'd2', name: 'Dietrick Hall (D2)', coordinates: [-80.4237, 37.2248], type: 'building' },
  { id: 'west-end', name: 'West End Market', coordinates: [-80.4257, 37.2269], type: 'building' },
  
  // === Athletics Area ===
  { id: 'lane-stadium', name: 'Lane Stadium', coordinates: [-80.4182, 37.2199], type: 'building' },
  { id: 'cassell', name: 'Cassell Coliseum', coordinates: [-80.4172, 37.2208], type: 'building' },
  { id: 'mccomas', name: 'McComas Hall', coordinates: [-80.4136, 37.2227], type: 'building' },
  { id: 'war-memorial-gym', name: 'War Memorial Gym', coordinates: [-80.4222, 37.2268], type: 'building' },
  
  // === Residential ===
  { id: 'ambler-johnston', name: 'Ambler Johnston Hall', coordinates: [-80.4217, 37.2254], type: 'building' },
  { id: 'pritchard', name: 'Pritchard Hall', coordinates: [-80.4253, 37.2260], type: 'building' },
  { id: 'slusher', name: 'Slusher Hall', coordinates: [-80.4207, 37.2260], type: 'building' },
  
  // === Key Intersections ===
  { id: 'alumni-mall-south', name: 'Alumni Mall South', coordinates: [-80.4158, 37.2275], type: 'intersection' },
  { id: 'washington-kent', name: 'Washington St @ Kent St', coordinates: [-80.4185, 37.2245], type: 'intersection' },
  { id: 'drillfield-path-n', name: 'Drillfield Path North', coordinates: [-80.4205, 37.2295], type: 'intersection' },
  { id: 'drillfield-path-s', name: 'Drillfield Path South', coordinates: [-80.4205, 37.2268], type: 'intersection' },
  { id: 'stanger-old-turner', name: 'Stanger @ Old Turner', coordinates: [-80.4220, 37.2285], type: 'intersection' },
  { id: 'old-turner-north', name: 'Old Turner St North', coordinates: [-80.4215, 37.2300], type: 'intersection' },
  { id: 'west-campus-int', name: 'West Campus Dr Int', coordinates: [-80.4248, 37.2280], type: 'intersection' },
  
  // === Surge / Research Area ===
  { id: 'surge', name: 'Surge Building', coordinates: [-80.4259, 37.2318], type: 'building' },
  
  // === Downtown Connection Points ===
  { id: 'college-main', name: 'College Ave @ Main St', coordinates: [-80.4135, 37.2295], type: 'intersection' },
  { id: 'draper-main', name: 'Draper Rd @ Main St', coordinates: [-80.4110, 37.2305], type: 'intersection' },
];

// Campus path edges - walkways connecting nodes
export const CAMPUS_EDGES: PathEdge[] = [
  // === Torgersen Bridge Corridor ===
  { from: 'torgersen', to: 'torgersen-bridge', distance: 40, type: 'bridge', accessible: true },
  { from: 'torgersen-bridge', to: 'squires', distance: 100, type: 'sidewalk', accessible: true },
  { from: 'torgersen-bridge', to: 'newman', distance: 90, type: 'sidewalk', accessible: true },
  { from: 'torgersen-bridge', to: 'norris', distance: 50, type: 'sidewalk', accessible: true },
  
  // === Perry Street Corridor ===
  { from: 'torgersen', to: 'perry-torg', distance: 50, type: 'sidewalk', accessible: true },
  { from: 'perry-torg', to: 'perry-goodwin', distance: 80, type: 'sidewalk', accessible: true },
  { from: 'perry-goodwin', to: 'goodwin', distance: 30, type: 'sidewalk', accessible: true },
  { from: 'perry-goodwin', to: 'perry-whittemore', distance: 75, type: 'sidewalk', accessible: true },
  { from: 'perry-whittemore', to: 'whittemore', distance: 40, type: 'sidewalk', accessible: true },
  { from: 'perry-whittemore', to: 'durham', distance: 60, type: 'sidewalk', accessible: true },
  
  // === Drillfield Paths ===
  { from: 'newman', to: 'drillfield-east', distance: 60, type: 'path', accessible: true },
  { from: 'drillfield-east', to: 'drillfield-center', distance: 150, type: 'path', accessible: true },
  { from: 'drillfield-center', to: 'drillfield-west', distance: 150, type: 'path', accessible: true },
  { from: 'drillfield-west', to: 'war-memorial', distance: 50, type: 'path', accessible: true },
  { from: 'drillfield-west', to: 'burruss', distance: 80, type: 'path', accessible: true },
  { from: 'drillfield-center', to: 'drillfield-path-n', distance: 80, type: 'path', accessible: true },
  { from: 'drillfield-center', to: 'drillfield-path-s', distance: 75, type: 'path', accessible: true },
  
  // === Academic Core ===
  { from: 'norris', to: 'randolph', distance: 50, type: 'sidewalk', accessible: true },
  { from: 'randolph', to: 'drillfield-path-n', distance: 40, type: 'sidewalk', accessible: true },
  { from: 'drillfield-path-n', to: 'patton', distance: 60, type: 'sidewalk', accessible: true },
  { from: 'drillfield-path-n', to: 'old-turner-north', distance: 50, type: 'sidewalk', accessible: true },
  { from: 'old-turner-north', to: 'patton', distance: 40, type: 'sidewalk', accessible: true },
  { from: 'old-turner-north', to: 'burruss', distance: 70, type: 'sidewalk', accessible: true },
  { from: 'hancock', to: 'drillfield-center', distance: 60, type: 'path', accessible: true },
  { from: 'hancock', to: 'newman', distance: 50, type: 'sidewalk', accessible: true },
  { from: 'holden', to: 'drillfield-path-s', distance: 50, type: 'sidewalk', accessible: true },
  { from: 'holden', to: 'stanger-old-turner', distance: 60, type: 'sidewalk', accessible: true },
  { from: 'stanger-old-turner', to: 'mcbryde', distance: 80, type: 'sidewalk', accessible: true },
  { from: 'stanger-old-turner', to: 'drillfield-west', distance: 70, type: 'sidewalk', accessible: true },
  
  // === West Campus ===
  { from: 'burruss', to: 'davidson', distance: 100, type: 'sidewalk', accessible: true },
  { from: 'davidson', to: 'pamplin', distance: 80, type: 'sidewalk', accessible: true },
  { from: 'mcbryde', to: 'west-campus-int', distance: 80, type: 'sidewalk', accessible: true },
  { from: 'west-campus-int', to: 'war-memorial', distance: 60, type: 'sidewalk', accessible: true },
  { from: 'west-campus-int', to: 'west-end', distance: 100, type: 'sidewalk', accessible: true },
  { from: 'west-campus-int', to: 'd2', distance: 120, type: 'sidewalk', accessible: true },
  { from: 'west-campus-int', to: 'pritchard', distance: 90, type: 'sidewalk', accessible: true },
  
  // === Student Life Area ===
  { from: 'squires', to: 'alumni-mall', distance: 100, type: 'sidewalk', accessible: true },
  { from: 'alumni-mall', to: 'moss-arts', distance: 120, type: 'sidewalk', accessible: true },
  { from: 'alumni-mall', to: 'alumni-mall-south', distance: 100, type: 'sidewalk', accessible: true },
  { from: 'alumni-mall-south', to: 'glc', distance: 50, type: 'sidewalk', accessible: true },
  { from: 'alumni-mall-south', to: 'drillfield-east', distance: 60, type: 'sidewalk', accessible: true },
  { from: 'alumni-mall', to: 'college-main', distance: 150, type: 'sidewalk', accessible: true },
  { from: 'college-main', to: 'draper-main', distance: 200, type: 'sidewalk', accessible: true },
  
  // === Residential & Dining Connections ===
  { from: 'drillfield-path-s', to: 'slusher', distance: 80, type: 'sidewalk', accessible: true },
  { from: 'drillfield-path-s', to: 'ambler-johnston', distance: 100, type: 'sidewalk', accessible: true },
  { from: 'slusher', to: 'ambler-johnston', distance: 60, type: 'sidewalk', accessible: true },
  { from: 'ambler-johnston', to: 'washington-kent', distance: 80, type: 'sidewalk', accessible: true },
  { from: 'd2', to: 'ambler-johnston', distance: 100, type: 'sidewalk', accessible: true },
  
  // === Athletics Area ===
  { from: 'washington-kent', to: 'owens', distance: 70, type: 'sidewalk', accessible: true },
  { from: 'washington-kent', to: 'mccomas', distance: 150, type: 'sidewalk', accessible: true },
  { from: 'owens', to: 'lane-stadium', distance: 200, type: 'sidewalk', accessible: true },
  { from: 'mccomas', to: 'cassell', distance: 80, type: 'sidewalk', accessible: true },
  { from: 'cassell', to: 'lane-stadium', distance: 100, type: 'sidewalk', accessible: true },
  { from: 'glc', to: 'washington-kent', distance: 120, type: 'sidewalk', accessible: true },
  { from: 'drillfield-path-s', to: 'war-memorial-gym', distance: 100, type: 'sidewalk', accessible: true },
  { from: 'war-memorial-gym', to: 'stanger-old-turner', distance: 80, type: 'sidewalk', accessible: true },
  
  // === Surge / Research Connection ===
  { from: 'pamplin', to: 'surge', distance: 200, type: 'sidewalk', accessible: true },
];

// Build adjacency list for efficient graph traversal
export interface AdjacencyList {
  [nodeId: string]: { to: string; distance: number; edge: PathEdge }[];
}

export function buildAdjacencyList(): AdjacencyList {
  const adjacency: AdjacencyList = {};
  
  // Initialize all nodes
  for (const node of CAMPUS_NODES) {
    adjacency[node.id] = [];
  }
  
  // Add edges (bidirectional)
  for (const edge of CAMPUS_EDGES) {
    adjacency[edge.from]?.push({ to: edge.to, distance: edge.distance, edge });
    adjacency[edge.to]?.push({ to: edge.from, distance: edge.distance, edge });
  }
  
  return adjacency;
}

// Get node by ID
export function getNodeById(id: string): PathNode | undefined {
  return CAMPUS_NODES.find(n => n.id === id);
}

// Get nodes by coordinates (find closest)
export function getNodeByCoordinates(coordinates: [number, number]): PathNode | null {
  let closest: PathNode | null = null;
  let minDistance = Infinity;
  
  for (const node of CAMPUS_NODES) {
    const dist = haversineDistance(coordinates, node.coordinates);
    if (dist < minDistance) {
      minDistance = dist;
      closest = node;
    }
  }
  
  // Only return if within 200 meters
  return minDistance < 200 ? closest : null;
}

// Haversine distance in meters
export function haversineDistance(
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number]
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Check if a point is within campus bounds (expanded for better coverage)
export function isOnCampus(coordinates: [number, number]): boolean {
  const [lng, lat] = coordinates;
  // Approximate VT campus bounding box (expanded to include surrounding areas)
  return lng >= -80.44 && lng <= -80.40 && lat >= 37.21 && lat <= 37.24;
}

// Check if a point is in the core campus area
export function isInCoreCampus(coordinates: [number, number]): boolean {
  const [lng, lat] = coordinates;
  // Core campus around Drillfield
  return lng >= -80.428 && lng <= -80.412 && lat >= 37.222 && lat <= 37.235;
}
