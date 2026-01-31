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
}

export const mockRoutes: Route[] = [
  {
    id: '1',
    name: 'Riverside Trail Loop',
    description: 'A scenic path along the river with beautiful views and well-maintained walkways.',
    distance_km: 4.2,
    duration_walk_min: 52,
    duration_cycle_min: 14,
    safety_score: 'safe',
    safety_insight: 'Well-lit path with regular patrol presence. High foot traffic throughout the day.',
    coordinates: [
      [-0.1278, 51.5074],
      [-0.1295, 51.5090],
      [-0.1320, 51.5085],
      [-0.1340, 51.5095],
      [-0.1325, 51.5110],
      [-0.1295, 51.5105],
      [-0.1278, 51.5074],
    ],
    start_point: [-0.1278, 51.5074],
    end_point: [-0.1278, 51.5074],
    badges: [
      { id: 'b1', label: 'Well-lit', icon: 'Lightbulb', type: 'feature' },
      { id: 'b2', label: 'Community verified', icon: 'CheckCircle', type: 'verified' },
      { id: 'b3', label: 'Near help', icon: 'Phone', type: 'safety' },
    ],
  },
  {
    id: '2',
    name: 'Central Park Path',
    description: 'A peaceful route through the heart of the city park.',
    distance_km: 2.8,
    duration_walk_min: 35,
    duration_cycle_min: 10,
    safety_score: 'safe',
    safety_insight: 'Excellent visibility, security cameras throughout. Popular with families.',
    coordinates: [
      [-0.1350, 51.5080],
      [-0.1370, 51.5095],
      [-0.1400, 51.5100],
      [-0.1420, 51.5090],
      [-0.1400, 51.5075],
      [-0.1370, 51.5070],
      [-0.1350, 51.5080],
    ],
    start_point: [-0.1350, 51.5080],
    end_point: [-0.1350, 51.5080],
    badges: [
      { id: 'b4', label: 'Fewer crossings', icon: 'ArrowRight', type: 'feature' },
      { id: 'b5', label: 'Community verified', icon: 'CheckCircle', type: 'verified' },
    ],
  },
  {
    id: '3',
    name: 'Historic Quarter Walk',
    description: 'Explore the charming historic district with its cobblestone streets.',
    distance_km: 3.5,
    duration_walk_min: 45,
    duration_cycle_min: 12,
    safety_score: 'moderate',
    safety_insight: 'Well-maintained until 9pm. Limited lighting in some sections after dark.',
    coordinates: [
      [-0.1220, 51.5050],
      [-0.1200, 51.5065],
      [-0.1180, 51.5080],
      [-0.1200, 51.5095],
      [-0.1230, 51.5090],
      [-0.1250, 51.5070],
      [-0.1220, 51.5050],
    ],
    start_point: [-0.1220, 51.5050],
    end_point: [-0.1220, 51.5050],
    badges: [
      { id: 'b6', label: 'Scenic route', icon: 'Camera', type: 'feature' },
      { id: 'b7', label: 'Near help', icon: 'Phone', type: 'safety' },
    ],
  },
  {
    id: '4',
    name: 'Docklands Route',
    description: 'Industrial heritage meets modern architecture along the old docks.',
    distance_km: 5.8,
    duration_walk_min: 72,
    duration_cycle_min: 20,
    safety_score: 'moderate',
    safety_insight: 'Busy during business hours. Consider alternative routes after 7pm on weekends.',
    coordinates: [
      [-0.0200, 51.5050],
      [-0.0180, 51.5070],
      [-0.0150, 51.5085],
      [-0.0120, 51.5080],
      [-0.0100, 51.5060],
      [-0.0130, 51.5045],
      [-0.0200, 51.5050],
    ],
    start_point: [-0.0200, 51.5050],
    end_point: [-0.0200, 51.5050],
    badges: [
      { id: 'b8', label: 'Well-lit', icon: 'Lightbulb', type: 'feature' },
      { id: 'b9', label: 'Fewer crossings', icon: 'ArrowRight', type: 'feature' },
    ],
  },
  {
    id: '5',
    name: 'Industrial Canal Path',
    description: 'An adventurous route along the old industrial canal.',
    distance_km: 6.2,
    duration_walk_min: 78,
    duration_cycle_min: 22,
    safety_score: 'caution',
    safety_insight: 'Isolated sections with limited visibility. Best traveled in groups during daylight.',
    coordinates: [
      [-0.0800, 51.5150],
      [-0.0780, 51.5170],
      [-0.0750, 51.5190],
      [-0.0720, 51.5180],
      [-0.0700, 51.5160],
      [-0.0750, 51.5140],
      [-0.0800, 51.5150],
    ],
    start_point: [-0.0800, 51.5150],
    end_point: [-0.0800, 51.5150],
    badges: [
      { id: 'b10', label: 'Scenic route', icon: 'Camera', type: 'feature' },
    ],
  },
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
