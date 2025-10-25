export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'bus' | 'metro' | 'train';
}

export interface Route {
  id: string;
  name: string;
  stops: Stop[];
  fare: number;
  avgTime: number; // minutes
  type: 'bus' | 'metro' | 'train';
  nextArrival?: number; // minutes until next vehicle arrives
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

// Chennai Transport Data - Real locations
export const STOPS: Record<string, Stop> = {
  planetarium: {
    id: 'planetarium',
    name: 'Birla Planetarium',
    lat: 13.0475,
    lng: 80.2379,
    type: 'bus'
  },
  guindy: {
    id: 'guindy',
    name: 'Guindy Metro Station',
    lat: 13.0096,
    lng: 80.2209,
    type: 'metro'
  },
  cmbt: {
    id: 'cmbt',
    name: 'Koyambedu CMBT',
    lat: 13.0703,
    lng: 80.2034,
    type: 'bus'
  },
  redhills: {
    id: 'redhills',
    name: 'Red Hills',
    lat: 13.1479,
    lng: 80.1849,
    type: 'bus'
  },
  college: {
    id: 'college',
    name: 'College',
    lat: 13.1854,
    lng: 80.2547,
    type: 'bus'
  },
  central: {
    id: 'central',
    name: 'Chennai Central',
    lat: 13.0827,
    lng: 80.2707,
    type: 'metro'
  },
  avadi: {
    id: 'avadi',
    name: 'Avadi',
    lat: 13.1147,
    lng: 79.9864,
    type: 'bus'
  }
};

// College bus route: Planetarium → Guindy → CMBT → Red Hills → College
export const COLLEGE_BUS_ROUTE: Route = {
  id: 'college_bus',
  name: 'College Bus',
  type: 'bus',
  fare: 0,
  avgTime: 120,
  stops: [
    STOPS.planetarium,
    STOPS.guindy,
    STOPS.cmbt,
    STOPS.redhills,
    STOPS.college
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
    id: 'bus_77',
    name: 'Bus 77 (CMBT-Avadi Direct)',
    type: 'bus',
    fare: 17, // ₹17 fare - Koyambedu to Avadi direct route
    avgTime: 45,
    stops: [STOPS.cmbt, STOPS.avadi],
    nextArrival: 15, // Bus arrives in 15 minutes
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
  
  // College to Avadi routes
  {
    id: 'bus_college_avadi',
    name: 'Bus 12 (College-Avadi)',
    type: 'bus',
    fare: 30,
    avgTime: 90,
    stops: [STOPS.college, STOPS.avadi],
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
