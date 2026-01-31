import { supabase } from "@/integrations/supabase/client";
import { SafetyLevel } from "./mock-data";

interface LocationSafetyScore {
  location: string;
  safety_score: number;
  total_risk: number;
}

// Keywords to extract from location strings for matching
const LOCATION_KEYWORDS = [
  "drillfield", "burruss", "torgersen", "newman", "library", "squires",
  "lane stadium", "cassell", "war memorial", "pritchard", "slusher",
  "ambler", "johnston", "vawter", "payne", "harper", "hahn", "mcbryde",
  "hancock", "downtown", "main street", "college avenue", "huckleberry",
  "duck pond", "washington", "draper", "turner", "stanger", "prices fork",
  "west campus", "east campus", "duckpond", "derring", "randolph"
];

/**
 * Convert numeric safety score (0-100) to SafetyLevel category
 * Higher score = safer location
 */
export function numericToSafetyLevel(score: number): SafetyLevel {
  if (score >= 80) return "safe";
  if (score >= 50) return "moderate";
  return "caution";
}

/**
 * Generate safety insight based on score and risk data
 */
export function generateSafetyInsight(
  avgScore: number,
  maxRisk: number,
  matchedLocations: number
): string {
  const level = numericToSafetyLevel(avgScore);
  
  if (matchedLocations === 0) {
    return "Limited safety data available for this route. Exercise normal caution.";
  }
  
  if (level === "safe") {
    if (maxRisk < 1) {
      return "Very low incident rate along this route. Well-documented safe area with consistent foot traffic.";
    }
    return "Low incident rate with good visibility and regular patrols. Well-lit paths with emergency resources nearby.";
  }
  
  if (level === "moderate") {
    return "Some incidents reported in this area. Stay aware of surroundings, especially during evening hours. Consider traveling with others.";
  }
  
  return "Higher incident rate in this area. Recommend using alternative routes when possible, especially after dark. Travel with others if available.";
}

/**
 * Fetch all location safety scores from the database
 */
export async function fetchLocationSafetyScores(): Promise<LocationSafetyScore[]> {
  const { data, error } = await supabase
    .from("location_safety_scores")
    .select("location, safety_score, total_risk");
  
  if (error) {
    console.warn("Failed to fetch safety scores:", error.message);
    return [];
  }
  
  return data || [];
}

/**
 * Extract searchable keywords from a location string
 */
function extractKeywords(location: string): string[] {
  const lower = location.toLowerCase();
  return LOCATION_KEYWORDS.filter(keyword => lower.includes(keyword));
}

/**
 * Match location safety scores to a route based on location name matching
 */
export function matchLocationScores(
  routeName: string,
  routeDescription: string,
  startLocation: string,
  endLocation: string,
  allScores: LocationSafetyScore[]
): LocationSafetyScore[] {
  // Combine all route text for matching
  const routeText = `${routeName} ${routeDescription} ${startLocation} ${endLocation}`.toLowerCase();
  const routeKeywords = extractKeywords(routeText);
  
  // Find matching safety scores
  const matches: LocationSafetyScore[] = [];
  
  for (const score of allScores) {
    const locationLower = score.location.toLowerCase();
    
    // Check if any route keyword appears in this location
    const hasKeywordMatch = routeKeywords.some(keyword => 
      locationLower.includes(keyword)
    );
    
    // Also check reverse - location keywords in route
    const locationKeywords = extractKeywords(score.location);
    const hasReverseMatch = locationKeywords.some(keyword =>
      routeText.includes(keyword)
    );
    
    if (hasKeywordMatch || hasReverseMatch) {
      matches.push(score);
    }
  }
  
  return matches;
}

/**
 * Calculate safety for a point-to-point route based on start/end locations
 */
export function calculatePointToPointSafety(
  startName: string,
  endName: string,
  allScores: LocationSafetyScore[]
): {
  safetyLevel: SafetyLevel;
  numericScore: number;
  insight: string;
  matchedCount: number;
} {
  return calculateRouteSafety(
    `${startName} to ${endName}`,
    `Walking route from ${startName} to ${endName}`,
    startName,
    endName,
    allScores
  );
}

/**
 * Calculate aggregate safety score for a route based on matched locations
 */
export function calculateRouteSafety(
  routeName: string,
  routeDescription: string,
  startLocation: string,
  endLocation: string,
  allScores: LocationSafetyScore[]
): {
  safetyLevel: SafetyLevel;
  numericScore: number;
  insight: string;
  matchedCount: number;
} {
  const matches = matchLocationScores(
    routeName,
    routeDescription,
    startLocation,
    endLocation,
    allScores
  );
  
  if (matches.length === 0) {
    return {
      safetyLevel: "moderate",
      numericScore: 75,
      insight: "Limited safety data available for this route. Exercise normal caution.",
      matchedCount: 0,
    };
  }
  
  // Calculate weighted average - weight by inverse of risk (safer areas matter more)
  const totalWeight = matches.reduce((sum, m) => sum + (1 / (m.total_risk + 0.1)), 0);
  const weightedScore = matches.reduce(
    (sum, m) => sum + (m.safety_score * (1 / (m.total_risk + 0.1))),
    0
  ) / totalWeight;
  
  const maxRisk = Math.max(...matches.map(m => m.total_risk));
  
  return {
    safetyLevel: numericToSafetyLevel(weightedScore),
    numericScore: Math.round(weightedScore),
    insight: generateSafetyInsight(weightedScore, maxRisk, matches.length),
    matchedCount: matches.length,
  };
}
