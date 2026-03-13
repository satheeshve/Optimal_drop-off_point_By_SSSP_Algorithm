/**
 * Multi-Dimensional Safety Scoring Framework
 * As described in IEEE Paper Section III.D
 * 
 * Computes comprehensive safety scores based on:
 * - Incident reports
 * - User feedback
 * - Crowd density
 * - Infrastructure & lighting
 * - Police presence
 */

export interface SafetyIncident {
  id: string;
  location: { lat: number; lng: number };
  type: 'theft' | 'harassment' | 'assault' | 'accident' | 'other';
  severity: number; // 1-10
  timestamp: Date;
  verified: boolean;
}

export interface UserFeedback {
  rating: number; // 0-10
  timestamp: Date;
  credibility: number; // 0-1
}

export interface SafetyScore {
  total: number; // 0-10
  incident: number;
  feedback: number;
  crowd: number;
  lighting: number;
  police: number;
  factors: string[];
}

// Weights for composite scoring (as per paper)
const SAFETY_WEIGHTS = {
  incident: 0.35,    // Historical incidents
  feedback: 0.25,    // User ratings
  crowd: 0.15,       // Crowd density
  lighting: 0.15,    // Infrastructure
  police: 0.10       // Police proximity
};

/**
 * Calculate incident-based safety score
 * Formula: S_incident(p) = 10(1 - Σ w(i)e^(-d_i/1000)e^(-t_i/90) / N_th)
 */
export function calculateIncidentScore(
  location: { lat: number; lng: number },
  incidents: SafetyIncident[]
): number {
  const N_th = 100; // Normalization threshold
  let weightedSum = 0;

  incidents.forEach(incident => {
    const distance = haversineDistance(location, incident.location);
    const ageInDays = (Date.now() - incident.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    
    // Weight by severity
    const w = incident.severity / 10;
    
    // Exponential decay with distance (1 km)
    const distanceFactor = Math.exp(-distance / 1000);
    
    // Exponential decay with time (90 days)
    const timeFactor = Math.exp(-ageInDays / 90);
    
    // Only count verified incidents at full weight
    const verificationFactor = incident.verified ? 1.0 : 0.3;
    
    weightedSum += w * distanceFactor * timeFactor * verificationFactor;
  });

  return Math.max(0, 10 * (1 - weightedSum / N_th));
}

/**
 * Calculate user feedback score
 * Formula: S_feedback(p) = Σ rating(r)e^(-age(r)/30)cred(r) / Σ e^(-age(r)/30)
 */
export function calculateFeedbackScore(
  location: { lat: number; lng: number },
  feedbacks: UserFeedback[]
): number {
  if (feedbacks.length === 0) return 5.0; // Neutral default
  
  let weightedSum = 0;
  let weightTotal = 0;

  feedbacks.forEach(feedback => {
    const ageInDays = (Date.now() - feedback.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    
    // Exponential decay with time (30 days for feedback)
    const timeWeight = Math.exp(-ageInDays / 30);
    
    // Weight by user credibility
    const weight = timeWeight * feedback.credibility;
    
    weightedSum += feedback.rating * weight;
    weightTotal += weight;
  });

  return weightTotal > 0 ? weightedSum / weightTotal : 5.0;
}

/**
 * Calculate crowd density score
 * Formula: Piecewise function based on density
 */
export function calculateCrowdScore(density: number): number {
  if (density < 5) return 3.0;         // Too empty, unsafe
  if (density <= 50) return 8.5;       // Optimal
  if (density <= 100) return 7.0;      // Crowded but safe
  return 5.5;                          // Too crowded, risky
}

/**
 * Calculate lighting score
 * Formula: S_light(p,t) = L_base(p) × T_mult(t)
 */
export function calculateLightingScore(
  baseInfrastructure: number, // 0-10
  hour: number // 0-23
): number {
  let timeMultiplier = 1.0;
  
  if (hour >= 6 && hour < 18) {
    timeMultiplier = 1.2; // Daytime bonus
  } else if (hour >= 18 && hour < 22) {
    timeMultiplier = 0.9; // Evening
  } else {
    timeMultiplier = 0.6; // Night penalty
  }
  
  return Math.min(10, baseInfrastructure * timeMultiplier);
}

/**
 * Calculate police presence score
 * Formula: S_police(p) = 10 × max_{ps ∈ PS} e^(-d(p,ps)/2000)
 */
export function calculatePoliceScore(
  location: { lat: number; lng: number },
  policeStations: Array<{ lat: number; lng: number }>
): number {
  if (policeStations.length === 0) return 3.0;
  
  let maxScore = 0;
  
  policeStations.forEach(station => {
    const distance = haversineDistance(location, station);
    // Exponential decay with 2 km range
    const score = 10 * Math.exp(-distance / 2000);
    maxScore = Math.max(maxScore, score);
  });
  
  return maxScore;
}

/**
 * Calculate composite safety score
 * Formula: S_total(p,t) = Σ w_i × S_i(p,t)
 */
export function calculateSafetyScore(params: {
  location: { lat: number; lng: number };
  incidents: SafetyIncident[];
  feedbacks: UserFeedback[];
  crowdDensity: number;
  infrastructureRating: number;
  policeStations: Array<{ lat: number; lng: number }>;
  hour?: number;
}): SafetyScore {
  const hour = params.hour ?? new Date().getHours();
  
  const incidentScore = calculateIncidentScore(params.location, params.incidents);
  const feedbackScore = calculateFeedbackScore(params.location, params.feedbacks);
  const crowdScore = calculateCrowdScore(params.crowdDensity);
  const lightingScore = calculateLightingScore(params.infrastructureRating, hour);
  const policeScore = calculatePoliceScore(params.location, params.policeStations);
  
  const total = 
    SAFETY_WEIGHTS.incident * incidentScore +
    SAFETY_WEIGHTS.feedback * feedbackScore +
    SAFETY_WEIGHTS.crowd * crowdScore +
    SAFETY_WEIGHTS.lighting * lightingScore +
    SAFETY_WEIGHTS.police * policeScore;
  
  // Identify safety factors
  const factors: string[] = [];
  if (incidentScore < 5) factors.push('High incident rate');
  if (crowdScore < 6) factors.push('Crowd density concern');
  if (lightingScore < 5) factors.push('Poor lighting');
  if (policeScore < 4) factors.push('Limited police presence');
  if (feedbackScore < 5) factors.push('Negative user feedback');
  
  return {
    total: Math.max(0, Math.min(10, total)),
    incident: incidentScore,
    feedback: feedbackScore,
    crowd: crowdScore,
    lighting: lightingScore,
    police: policeScore,
    factors
  };
}

/**
 * Apply safety factor to route cost
 * Formula from Algorithm 2: c' = c × (1 + (10-S[v])/20)
 */
export function applySafetyFactor(baseCost: number, safetyScore: number): number {
  const penalty = (10 - safetyScore) / 20;
  return baseCost * (1 + penalty);
}

/**
 * Haversine distance between two GPS coordinates (in meters)
 */
function haversineDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = point1.lat * Math.PI / 180;
  const φ2 = point2.lat * Math.PI / 180;
  const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
  const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Sample data for demonstration
export const SAMPLE_POLICE_STATIONS = [
  { lat: 13.0827, lng: 80.2707, name: 'Central Station Police' },
  { lat: 13.0703, lng: 80.2034, name: 'Koyambedu Police Station' },
  { lat: 13.1147, lng: 79.9864, name: 'Avadi Police Station' },
];

export const SAMPLE_INCIDENTS: SafetyIncident[] = [
  {
    id: 'inc1',
    location: { lat: 13.0827, lng: 80.2707 },
    type: 'theft',
    severity: 6,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    verified: true
  },
  {
    id: 'inc2',
    location: { lat: 13.0703, lng: 80.2034 },
    type: 'harassment',
    severity: 7,
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    verified: true
  }
];
