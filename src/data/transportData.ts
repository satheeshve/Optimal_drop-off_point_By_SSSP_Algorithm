export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'bus' | 'metro' | 'train';
  crimeRate?: 'low' | 'medium' | 'high'; // Crime rate for the area
  policePatrol?: PolicePatrolData; // Active police patrol in area
}

export interface PolicePatrolData {
  isActive: boolean;
  patrolName: string;
  officerName: string;
  contactNumber: string;
  shiftTime: string;
  vehicleNumber: string;
}

export interface Route {
  id: string;
  name: string;
  stops: Stop[];
  fare: number;
  farePolicy?: {
    category: 'regular' | 'pink';
    maleFare?: number;
    femaleFare?: number;
    defaultFare?: number;
  };
  avgTime: number; // minutes
  type: 'bus' | 'metro' | 'train';
  nextArrival?: number; // minutes until next vehicle arrives
}

export interface CommuterProfile {
  gender?: 'male' | 'female' | 'other';
}

export interface DropPoint {
  stop: Stop;
  distanceFromStart: number;
  routesToHome: RouteOption[];
  optimalRoute: RouteOption | null;
}

export interface RouteOption {
  totalTime: number; // minutes
  totalFare: number; // rupees
  transfers: number;
  segments: RouteSegment[];
  score: number; // optimization score
  crimeScore?: number; // Crime safety score (0-100, higher is safer)
  policePresence?: boolean; // Whether police patrol is active on route
  policePatrols?: PolicePatrolData[]; // List of active patrols along route
}

export interface RouteSegment {
  from: Stop;
  to: Stop;
  mode: string;
  routeName: string;
  time: number;
  fare: number;
  waitTime?: number;
}

// Chennai Transport Data - Real locations with Crime Rates and Police Patrols
export const STOPS: Record<string, Stop> = {
  planetarium: {
    id: 'planetarium',
    name: 'Birla Planetarium',
    lat: 13.0475,
    lng: 80.2379,
    type: 'bus',
    crimeRate: 'low',
    policePatrol: {
      isActive: true,
      patrolName: 'Zone-1 Tourist Area Patrol',
      officerName: 'Inspector Ramesh Kumar',
      contactNumber: '+91-9840123456',
      shiftTime: '08:00 AM - 08:00 PM',
      vehicleNumber: 'TN01-P-1234'
    }
  },
  guindy: {
    id: 'guindy',
    name: 'Guindy Metro Station',
    lat: 13.0096,
    lng: 80.2209,
    type: 'metro',
    crimeRate: 'low',
    policePatrol: {
      isActive: true,
      patrolName: 'Zone-2 Metro Security',
      officerName: 'Sub-Inspector Priya Menon',
      contactNumber: '+91-9840234567',
      shiftTime: '06:00 AM - 10:00 PM',
      vehicleNumber: 'TN01-P-2345'
    }
  },
  cmbt: {
    id: 'cmbt',
    name: 'Koyambedu CMBT',
    lat: 13.0703,
    lng: 80.2034,
    type: 'bus',
    crimeRate: 'medium',
    policePatrol: {
      isActive: true,
      patrolName: 'Zone-3 CMBT Security',
      officerName: 'Inspector Suresh Babu',
      contactNumber: '+91-9840345678',
      shiftTime: '24/7 Coverage',
      vehicleNumber: 'TN01-P-3456'
    }
  },
  redhills: {
    id: 'redhills',
    name: 'Red Hills',
    lat: 13.1479,
    lng: 80.1849,
    type: 'bus',
    crimeRate: 'medium',
    policePatrol: {
      isActive: true,
      patrolName: 'Zone-4 North Chennai Patrol',
      officerName: 'Head Constable Venkat',
      contactNumber: '+91-9840456789',
      shiftTime: '06:00 PM - 06:00 AM',
      vehicleNumber: 'TN01-P-4567'
    }
  },
  rmkcet: {
    id: 'rmkcet',
    name: 'R.M.K College of Engineering and Technology',
    lat: 13.3295,
    lng: 80.141,
    type: 'bus',
    crimeRate: 'low',
    policePatrol: {
      isActive: true,
      patrolName: 'Zone-5 Puduvoyal Educational Corridor Patrol',
      officerName: 'Inspector Lakshmi Devi',
      contactNumber: '+91-9840567890',
      shiftTime: '07:00 AM - 09:00 PM',
      vehicleNumber: 'TN01-P-5678'
    }
  },
  central: {
    id: 'central',
    name: 'Chennai Central',
    lat: 13.0827,
    lng: 80.2707,
    type: 'metro',
    crimeRate: 'medium',
    policePatrol: {
      isActive: true,
      patrolName: 'Zone-6 Railway Protection Force',
      officerName: 'Inspector Arun Prakash',
      contactNumber: '+91-9840678901',
      shiftTime: '24/7 Coverage',
      vehicleNumber: 'TN01-P-6789'
    }
  },
  avadi: {
    id: 'avadi',
    name: 'Avadi',
    lat: 13.1147,
    lng: 79.9864,
    type: 'bus',
    crimeRate: 'low',
    policePatrol: {
      isActive: true,
      patrolName: 'Zone-7 Avadi Town Patrol',
      officerName: 'Sub-Inspector Murugan',
      contactNumber: '+91-9840789012',
      shiftTime: '05:00 PM - 11:00 PM',
      vehicleNumber: 'TN01-P-7890'
    }
  }
};

// R.M.K CET shuttle route: Planetarium → Guindy → CMBT → Red Hills → R.M.K CET
export const COLLEGE_BUS_ROUTE: Route = {
  id: 'college_bus',
  name: 'R.M.K CET Shuttle',
  type: 'bus',
  fare: 0,
  avgTime: 120,
  stops: [
    STOPS.planetarium,
    STOPS.guindy,
    STOPS.cmbt,
    STOPS.redhills,
    STOPS.rmkcet
  ]
};

// Available public transport routes - ENHANCED VERSION
export const TRANSPORT_ROUTES: Route[] = [
  // Metro Routes
  {
    id: 'metro_blue',
    name: 'Metro Blue Line',
    type: 'metro',
    fare: 40,
    avgTime: 30,
    stops: [STOPS.guindy, STOPS.central],
    nextArrival: 8, // Next metro in 8 minutes
  },
  
  // Direct Bus Routes
  {
    id: 'bus_77_deluxe',
    name: 'Bus 77 Deluxe (CMBT-Avadi Direct)',
    type: 'bus',
    fare: 35,
    farePolicy: {
      category: 'regular',
      defaultFare: 35,
    },
    avgTime: 45,
    stops: [STOPS.cmbt, STOPS.avadi],
    nextArrival: 15, // Bus arrives in 15 minutes
  },
  {
    id: 'bus_77_pink',
    name: 'Bus 77 Pink (CMBT-Avadi Direct)',
    type: 'bus',
    fare: 20,
    farePolicy: {
      category: 'pink',
      maleFare: 20,
      femaleFare: 0,
      defaultFare: 20,
    },
    avgTime: 47,
    stops: [STOPS.cmbt, STOPS.avadi],
    nextArrival: 19,
  },
  {
    id: 'bus_central_avadi',
    name: 'Bus 47B (Central-Avadi)',
    type: 'bus',
    fare: 30,
    avgTime: 60,
    stops: [STOPS.central, STOPS.avadi],
    nextArrival: 22, // Bus arrives in 22 minutes
  },
  {
    id: 'bus_redhills_avadi',
    name: 'Bus 52 (Red Hills-Avadi)',
    type: 'bus',
    fare: 20,
    avgTime: 35,
    stops: [STOPS.redhills, STOPS.avadi],
    nextArrival: 10, // Bus arrives in 10 minutes
  },
  {
    id: 'bus_planetarium_avadi',
    name: 'Bus 23C (Planetarium-Avadi)',
    type: 'bus',
    fare: 35,
    avgTime: 75,
    stops: [STOPS.planetarium, STOPS.avadi],
    nextArrival: 18, // Bus arrives in 18 minutes
  },
  
  // Connecting Routes (for better graph connectivity)
  {
    id: 'bus_guindy_cmbt',
    name: 'Bus 18 (Guindy-CMBT)',
    type: 'bus',
    fare: 20,
    avgTime: 25,
    stops: [STOPS.guindy, STOPS.cmbt],
    nextArrival: 12, // Bus arrives in 12 minutes
  },
  {
    id: 'bus_guindy_central',
    name: 'Bus 5 (Guindy-Central)',
    type: 'bus',
    fare: 25,
    avgTime: 35,
    stops: [STOPS.guindy, STOPS.central],
    nextArrival: 7, // Bus arrives in 7 minutes
  },
  {
    id: 'bus_cmbt_redhills',
    name: 'Bus 60 (CMBT-Red Hills)',
    type: 'bus',
    fare: 20,
    avgTime: 40,
    stops: [STOPS.cmbt, STOPS.redhills],
    nextArrival: 14, // Bus arrives in 14 minutes
  },
  {
    id: 'bus_central_cmbt',
    name: 'Bus 27 (Central-CMBT)',
    type: 'bus',
    fare: 20,
    avgTime: 30,
    stops: [STOPS.central, STOPS.cmbt],
    nextArrival: 9, // Bus arrives in 9 minutes
  },
  
  // R.M.K CET to Avadi routes
  {
    id: 'bus_rmkcet_avadi',
    name: 'Bus 12 (R.M.K CET-Avadi)',
    type: 'bus',
    fare: 30,
    avgTime: 90,
    stops: [STOPS.rmkcet, STOPS.avadi],
    nextArrival: 20, // Bus arrives in 20 minutes
  },
  
  // Planetarium connecting routes
  {
    id: 'bus_planetarium_guindy',
    name: 'Bus 21M (Planetarium-Guindy)',
    type: 'bus',
    fare: 15,
    avgTime: 20,
    stops: [STOPS.planetarium, STOPS.guindy],
    nextArrival: 6, // Bus arrives in 6 minutes
  },
  {
    id: 'bus_planetarium_central',
    name: 'Bus 9 (Planetarium-Central)',
    type: 'bus',
    fare: 25,
    avgTime: 40,
    stops: [STOPS.planetarium, STOPS.central],
    nextArrival: 11, // Bus arrives in 11 minutes
  }
];

// Weights for multi-criteria optimization
export const WEIGHTS = {
  time: 0.5,    // 50% weight to time
  fare: 0.3,    // 30% weight to fare
  transfers: 0.2 // 20% weight to transfers
};

export const HOME = STOPS.avadi;

// Helper function to calculate crime safety score for a route
export function calculateCrimeScore(stops: Stop[]): number {
  const crimeRatings = { low: 100, medium: 60, high: 20 };
  let totalScore = 0;
  let count = 0;

  stops.forEach(stop => {
    if (stop.crimeRate) {
      totalScore += crimeRatings[stop.crimeRate];
      count++;
    }
  });

  return count > 0 ? Math.round(totalScore / count) : 75; // Default to 75 if no data
}

// Helper function to get all police patrols along a route
export function getPolicePatrolsOnRoute(stops: Stop[]): PolicePatrolData[] {
  const patrols: PolicePatrolData[] = [];
  
  stops.forEach(stop => {
    if (stop.policePatrol && stop.policePatrol.isActive) {
      patrols.push(stop.policePatrol);
    }
  });

  return patrols;
}

// Helper function to get crime rate label
export function getCrimeRateLabel(score: number): string {
  if (score >= 80) return 'Very Safe';
  if (score >= 60) return 'Safe';
  if (score >= 40) return 'Moderate Risk';
  return 'High Risk';
}

// Helper function to get crime rate color
export function getCrimeRateColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

// Compute fare based on service type and commuter profile.
export function getEffectiveFare(route: Route, profile: CommuterProfile = { gender: 'male' }): number {
  const policy = route.farePolicy;
  if (!policy) return route.fare;

  if (policy.category === 'pink') {
    if (profile.gender === 'female') return policy.femaleFare ?? 0;
    if (profile.gender === 'male') return policy.maleFare ?? policy.defaultFare ?? route.fare;
    return policy.defaultFare ?? route.fare;
  }

  return policy.defaultFare ?? route.fare;
}
