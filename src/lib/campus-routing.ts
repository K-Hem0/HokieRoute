/**
 * A* Pathfinding Algorithm for VT Campus
 * 
 * Finds the optimal walking path through the campus pedestrian network.
 */

import {
  CAMPUS_NODES,
  buildAdjacencyList,
  getNodeById,
  getNodeByCoordinates,
  haversineDistance,
  isOnCampus,
  PathNode,
  AdjacencyList,
} from './campus-paths';

export interface CampusRouteResult {
  path: PathNode[];
  coordinates: [number, number][]; // [lng, lat] pairs for map display
  distance: number; // total meters
  duration: number; // seconds (estimated at 5 km/h walking, 15 km/h cycling)
  steps: CampusRouteStep[];
}

export interface CampusRouteStep {
  instruction: string;
  distance: number;
  duration: number;
  from: string;
  to: string;
}

// Priority queue implementation for A*
class PriorityQueue<T> {
  private items: { element: T; priority: number }[] = [];

  enqueue(element: T, priority: number): void {
    const item = { element, priority };
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (item.priority < this.items[i].priority) {
        this.items.splice(i, 0, item);
        added = true;
        break;
      }
    }
    if (!added) {
      this.items.push(item);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// Heuristic: straight-line distance to goal
function heuristic(nodeId: string, goalId: string): number {
  const node = getNodeById(nodeId);
  const goal = getNodeById(goalId);
  if (!node || !goal) return Infinity;
  return haversineDistance(node.coordinates, goal.coordinates);
}

/**
 * Find path between two nodes using A* algorithm
 */
export function findCampusPath(
  startId: string,
  endId: string,
  mode: 'walk' | 'bike' = 'walk'
): CampusRouteResult | null {
  const adjacency = buildAdjacencyList();
  
  const startNode = getNodeById(startId);
  const endNode = getNodeById(endId);
  
  if (!startNode || !endNode) {
    return null;
  }
  
  // A* algorithm
  const openSet = new PriorityQueue<string>();
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  
  // Initialize all nodes with infinity
  for (const node of CAMPUS_NODES) {
    gScore.set(node.id, Infinity);
    fScore.set(node.id, Infinity);
  }
  
  gScore.set(startId, 0);
  fScore.set(startId, heuristic(startId, endId));
  openSet.enqueue(startId, fScore.get(startId)!);
  
  const visited = new Set<string>();
  
  while (!openSet.isEmpty()) {
    const current = openSet.dequeue()!;
    
    if (current === endId) {
      // Reconstruct path
      return reconstructPath(cameFrom, current, startNode, endNode, mode);
    }
    
    if (visited.has(current)) continue;
    visited.add(current);
    
    const neighbors = adjacency[current] || [];
    for (const { to, distance } of neighbors) {
      const tentativeGScore = gScore.get(current)! + distance;
      
      if (tentativeGScore < gScore.get(to)!) {
        cameFrom.set(to, current);
        gScore.set(to, tentativeGScore);
        fScore.set(to, tentativeGScore + heuristic(to, endId));
        
        if (!visited.has(to)) {
          openSet.enqueue(to, fScore.get(to)!);
        }
      }
    }
  }
  
  // No path found
  return null;
}

function reconstructPath(
  cameFrom: Map<string, string>,
  current: string,
  startNode: PathNode,
  endNode: PathNode,
  mode: 'walk' | 'bike'
): CampusRouteResult {
  const pathIds: string[] = [current];
  
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    pathIds.unshift(current);
  }
  
  const path: PathNode[] = pathIds.map(id => getNodeById(id)!).filter(Boolean);
  const coordinates: [number, number][] = path.map(n => n.coordinates);
  
  // Calculate total distance and generate steps
  let totalDistance = 0;
  const steps: CampusRouteStep[] = [];
  
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const distance = haversineDistance(from.coordinates, to.coordinates);
    totalDistance += distance;
    
    // Generate instruction
    const instruction = generateInstruction(from, to, i === 0, i === path.length - 2);
    
    // Walking speed ~5 km/h = 1.4 m/s, Biking ~15 km/h = 4.2 m/s
    const speed = mode === 'walk' ? 1.4 : 4.2;
    const duration = distance / speed;
    
    steps.push({
      instruction,
      distance: Math.round(distance),
      duration: Math.round(duration),
      from: from.id,
      to: to.id,
    });
  }
  
  // Walking speed ~5 km/h = 1.4 m/s, Biking ~15 km/h = 4.2 m/s
  const speed = mode === 'walk' ? 1.4 : 4.2;
  const totalDuration = totalDistance / speed;
  
  return {
    path,
    coordinates,
    distance: Math.round(totalDistance),
    duration: Math.round(totalDuration),
    steps,
  };
}

function generateInstruction(from: PathNode, to: PathNode, isFirst: boolean, isLast: boolean): string {
  if (isFirst) {
    return `Start at ${from.name} and head toward ${to.name}`;
  }
  if (isLast) {
    return `Arrive at ${to.name}`;
  }
  
  // Calculate direction
  const direction = getDirection(from.coordinates, to.coordinates);
  
  if (to.type === 'building') {
    return `Continue ${direction} toward ${to.name}`;
  } else if (to.type === 'intersection') {
    return `Continue ${direction} at ${to.name}`;
  } else {
    return `Head ${direction} past ${to.name}`;
  }
}

function getDirection(from: [number, number], to: [number, number]): string {
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  
  const dLng = lng2 - lng1;
  const dLat = lat2 - lat1;
  
  // Calculate angle in degrees
  const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
  
  // Convert to compass direction
  if (angle >= -22.5 && angle < 22.5) return 'north';
  if (angle >= 22.5 && angle < 67.5) return 'northeast';
  if (angle >= 67.5 && angle < 112.5) return 'east';
  if (angle >= 112.5 && angle < 157.5) return 'southeast';
  if (angle >= 157.5 || angle < -157.5) return 'south';
  if (angle >= -157.5 && angle < -112.5) return 'southwest';
  if (angle >= -112.5 && angle < -67.5) return 'west';
  return 'northwest';
}

/**
 * Find campus route from coordinates
 * Falls back to null if not on campus
 */
export function findCampusRouteFromCoordinates(
  origin: [number, number],
  destination: [number, number],
  mode: 'walk' | 'bike' = 'walk'
): CampusRouteResult | null {
  // Check if both points are on campus
  if (!isOnCampus(origin) || !isOnCampus(destination)) {
    return null;
  }
  
  // Find closest nodes
  const startNode = getNodeByCoordinates(origin);
  const endNode = getNodeByCoordinates(destination);
  
  if (!startNode || !endNode) {
    return null;
  }
  
  // Find path
  const result = findCampusPath(startNode.id, endNode.id, mode);
  
  if (result) {
    // Add origin and destination to coordinates if they're not the exact node positions
    const originDist = haversineDistance(origin, result.coordinates[0]);
    const destDist = haversineDistance(destination, result.coordinates[result.coordinates.length - 1]);
    
    // If origin is more than 10m from first node, add it
    if (originDist > 10) {
      result.coordinates.unshift(origin);
      result.distance += Math.round(originDist);
      result.steps.unshift({
        instruction: `Head to ${startNode.name}`,
        distance: Math.round(originDist),
        duration: Math.round(originDist / (mode === 'walk' ? 1.4 : 4.2)),
        from: 'origin',
        to: startNode.id,
      });
    }
    
    // If destination is more than 10m from last node, add it
    if (destDist > 10) {
      result.coordinates.push(destination);
      result.distance += Math.round(destDist);
      const lastStep = result.steps[result.steps.length - 1];
      if (lastStep) {
        lastStep.instruction = `Continue to your destination`;
      }
    }
  }
  
  return result;
}
