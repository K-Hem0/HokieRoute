export type SafetyLevel = 'safe' | 'moderate' | 'caution';

export type BadgeType = 'feature' | 'verified' | 'safety';

export interface RouteBadge {
  id: string;
  label: string;
  icon: string;
  type: BadgeType;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  distance_km: number;
  duration_walk_min: number;
  duration_cycle_min: number;
  safety_score: SafetyLevel;
  safety_insight: string;
  coordinates: [number, number][];
  start_point: [number, number];
  end_point: [number, number];
  thumbnail_url?: string;
  badges: RouteBadge[];
  contextLabel?: string;
}

// Blacksburg, VA coordinates - centered on Virginia Tech campus
const BLACKSBURG_CENTER: [number, number] = [-80.4139, 37.2296];

export const mockRoutes: Route[] = [
  {
    id: '1',
    name: 'Drillfield Loop',
    description: 'A scenic loop around the historic Drillfield, passing by Burruss Hall and War Memorial.',
    distance_km: 1.8,
    duration_walk_min: 22,
    duration_cycle_min: 6,
    safety_score: 'safe',
    safety_insight: 'Well-lit path with emergency call boxes. High foot traffic throughout the day and evening.',
    coordinates: [
      [-80.4180, 37.2280],
      [-80.4175, 37.2300],
      [-80.4150, 37.2315],
      [-80.4120, 37.2310],
      [-80.4100, 37.2290],
      [-80.4110, 37.2270],
      [-80.4140, 37.2260],
      [-80.4170, 37.2265],
      [-80.4180, 37.2280],
    ],
    start_point: [-80.4180, 37.2280],
    end_point: [-80.4180, 37.2280],
    contextLabel: 'Around campus',
    badges: [
      { id: 'b1', label: 'Well-lit', icon: 'Lightbulb', type: 'feature' },
      { id: 'b2', label: 'Community verified', icon: 'CheckCircle', type: 'verified' },
      { id: 'b3', label: 'Emergency boxes', icon: 'Phone', type: 'safety' },
    ],
  },
  {
    id: '2',
    name: 'Downtown Main Street',
    description: 'Walk through the heart of downtown Blacksburg along Main Street to College Avenue.',
    distance_km: 1.2,
    duration_walk_min: 15,
    duration_cycle_min: 4,
    safety_score: 'safe',
    safety_insight: 'Busy commercial area with excellent visibility. Popular with students and locals.',
    coordinates: [
      [-80.4139, 37.2296],
      [-80.4120, 37.2300],
      [-80.4095, 37.2305],
      [-80.4070, 37.2310],
      [-80.4050, 37.2308],
    ],
    start_point: [-80.4139, 37.2296],
    end_point: [-80.4050, 37.2308],
    contextLabel: 'Downtown route',
    badges: [
      { id: 'b4', label: 'Busy area', icon: 'CheckCircle', type: 'verified' },
      { id: 'b5', label: 'Near shops', icon: 'ArrowRight', type: 'feature' },
    ],
  },
  {
    id: '3',
    name: 'Torgersen to Newman Library',
    description: 'Quick route from Torgersen Bridge through campus to Newman Library.',
    distance_km: 0.6,
    duration_walk_min: 8,
    duration_cycle_min: 2,
    safety_score: 'safe',
    safety_insight: 'Main campus corridor with constant foot traffic. Security cameras throughout.',
    coordinates: [
      [-80.4195, 37.2295],
      [-80.4175, 37.2290],
      [-80.4155, 37.2285],
      [-80.4140, 37.2280],
    ],
    start_point: [-80.4195, 37.2295],
    end_point: [-80.4140, 37.2280],
    contextLabel: 'Around campus',
    badges: [
      { id: 'b6', label: 'Well-lit', icon: 'Lightbulb', type: 'feature' },
      { id: 'b7', label: 'Near help', icon: 'Phone', type: 'safety' },
    ],
  },
  {
    id: '4',
    name: 'Huckleberry Trail Start',
    description: 'Begin at the Huckleberry trailhead near campus, heading toward the New River Valley.',
    distance_km: 3.2,
    duration_walk_min: 40,
    duration_cycle_min: 12,
    safety_score: 'moderate',
    safety_insight: 'Well-maintained trail with good daytime traffic. Limited lighting after dusk.',
    coordinates: [
      [-80.4250, 37.2320],
      [-80.4280, 37.2340],
      [-80.4310, 37.2365],
      [-80.4350, 37.2380],
      [-80.4390, 37.2400],
    ],
    start_point: [-80.4250, 37.2320],
    end_point: [-80.4390, 37.2400],
    contextLabel: 'Trail route',
    badges: [
      { id: 'b8', label: 'Scenic route', icon: 'Camera', type: 'feature' },
      { id: 'b9', label: 'Fewer crossings', icon: 'ArrowRight', type: 'feature' },
    ],
  },
  {
    id: '5',
    name: 'Lane Stadium to Squires',
    description: 'From Lane Stadium through the academic buildings to Squires Student Center.',
    distance_km: 0.9,
    duration_walk_min: 11,
    duration_cycle_min: 3,
    safety_score: 'safe',
    safety_insight: 'Central campus route with excellent lighting and emergency stations.',
    coordinates: [
      [-80.4180, 37.2200],
      [-80.4165, 37.2220],
      [-80.4150, 37.2240],
      [-80.4140, 37.2260],
      [-80.4130, 37.2280],
    ],
    start_point: [-80.4180, 37.2200],
    end_point: [-80.4130, 37.2280],
    contextLabel: 'Around campus',
    badges: [
      { id: 'b10', label: 'Well-lit', icon: 'Lightbulb', type: 'feature' },
      { id: 'b11', label: 'Community verified', icon: 'CheckCircle', type: 'verified' },
    ],
  },
];

// Common destinations for search suggestions
export const destinations = [
  { name: 'Drillfield', type: 'campus' },
  { name: 'Newman Library', type: 'campus' },
  { name: 'Torgersen Hall', type: 'campus' },
  { name: 'Lane Stadium', type: 'campus' },
  { name: 'Squires Student Center', type: 'campus' },
  { name: 'Downtown Main Street', type: 'downtown' },
  { name: 'College Avenue', type: 'downtown' },
  { name: 'Huckleberry Trail', type: 'trail' },
];

export const getSafetyColor = (level: SafetyLevel) => {
  switch (level) {
    case 'safe':
      return 'bg-safe text-safe-foreground';
    case 'moderate':
      return 'bg-moderate text-moderate-foreground';
    case 'caution':
      return 'bg-caution text-caution-foreground';
  }
};

export const getSafetyLabel = (level: SafetyLevel) => {
  switch (level) {
    case 'safe':
      return 'Safe';
    case 'moderate':
      return 'Moderate';
    case 'caution':
      return 'Caution';
  }
};
