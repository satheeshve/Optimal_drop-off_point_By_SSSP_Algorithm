/**
 * Hazard Reporting Types
 * Supports crowdsourced safety intelligence as per paper Section III.E
 */

export interface HazardReport {
  id: string;
  userId: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  category: HazardCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  images?: string[];
  status: 'pending' | 'verified' | 'rejected' | 'resolved';
  isAnonymous: boolean;
  upvotes: number;
  downvotes: number;
  adminNotes?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export type HazardCategory = 
  | 'obstacle'         // Fallen tree, roadblock
  | 'safety_concern'   // Harassment, suspicious activity
  | 'crowd_update'     // Unusual crowding
  | 'facility_issue'   // Broken lights, damaged infrastructure
  | 'positive'         // Safe area, good lighting
  | 'accident'         // Traffic accident
  | 'crime'            // Criminal activity

export interface UserCredibility {
  userId: string;
  score: number; // 0-1
  reportsSubmitted: number;
  reportsVerified: number;
  reportsRejected: number;
  reportsFlagged: number;
  lastReportTime?: Date;
}

/**
 * Calculate impact of hazard report on safety score
 * Formula: impact(r,t) = base(r) × e^(-t/τ)
 */
export function calculateHazardImpact(
  report: HazardReport,
  currentTime: Date = new Date()
): number {
  const baseImpact = {
    critical: -4.0,
    high: -2.5,
    medium: -1.5,
    low: -0.8,
  }[report.severity];
  
  // Decay time constant (hours)
  const tau = {
    obstacle: 6,         // 6 hours
    safety_concern: 24,  // 24 hours
    crowd_update: 2,     // 2 hours
    facility_issue: 48,  // 48 hours
    accident: 12,        // 12 hours
    crime: 72,           // 72 hours
    positive: -1         // No decay (permanent improvement)
  }[report.category];
  
  if (tau < 0) return -baseImpact; // Positive reports improve safety
  
  const hoursElapsed = (currentTime.getTime() - report.timestamp.getTime()) / (1000 * 60 * 60);
  const decayFactor = Math.exp(-hoursElapsed / tau);
  
  return baseImpact * decayFactor;
}

/**
 * Check if reports should be merged (duplicate detection)
 * Reports within 50m radius in 30 minutes are considered duplicates
 */
export function areDuplicateReports(
  report1: HazardReport,
  report2: HazardReport
): boolean {
  const DISTANCE_THRESHOLD = 50; // meters
  const TIME_THRESHOLD = 30 * 60 * 1000; // 30 minutes in ms
  
  const distance = haversineDistance(report1.location, report2.location);
  const timeDiff = Math.abs(report1.timestamp.getTime() - report2.timestamp.getTime());
  
  return distance < DISTANCE_THRESHOLD && 
         timeDiff < TIME_THRESHOLD &&
         report1.category === report2.category;
}

/**
 * Calculate user credibility score
 */
export function calculateCredibility(user: UserCredibility): number {
  if (user.reportsSubmitted === 0) return 0.7; // Default for new users
  
  const verificationRate = user.reportsVerified / user.reportsSubmitted;
  const rejectionRate = user.reportsRejected / user.reportsSubmitted;
  const flagRate = user.reportsFlagged / user.reportsSubmitted;
  
  let score = 0.5; // Base score
  
  // Positive factors
  score += verificationRate * 0.4;
  score += Math.min(user.reportsVerified / 50, 0.2); // Experience bonus (max 0.2)
  
  // Negative factors
  score -= rejectionRate * 0.3;
  score -= flagRate * 0.5;
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Check anti-spam measures
 */
export function checkSpamLimits(user: UserCredibility): {
  allowed: boolean;
  reason?: string;
} {
  // Rate limiting: max 5 reports per hour
  if (user.lastReportTime) {
    const hoursSinceLastReport = (Date.now() - user.lastReportTime.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastReport < 0.2 && user.reportsSubmitted % 5 === 0) {
      return { allowed: false, reason: 'Rate limit exceeded. Maximum 5 reports per hour.' };
    }
  }
  
  // Credibility check
  if (user.score < 0.4) {
    return { allowed: false, reason: 'Account credibility too low. Reports require additional verification.' };
  }
  
  return { allowed: true };
}

/**
 * Calculate severity-urgency-credibility score for admin prioritization
 */
export function calculatePriorityScore(report: HazardReport, userCred: number): number {
  const severityWeight = {
    critical: 10,
    high: 7,
    medium: 4,
    low: 2
  }[report.severity];
  
  const ageInHours = (Date.now() - report.timestamp.getTime()) / (1000 * 60 * 60);
  const urgencyWeight = Math.max(0, 10 - ageInHours / 2); // Decreases over time
  
  const credibilityWeight = userCred * 5;
  
  // Weighted sum
  return 0.5 * severityWeight + 0.3 * urgencyWeight + 0.2 * credibilityWeight;
}

/**
 * Haversine distance helper
 */
function haversineDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371000;
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
