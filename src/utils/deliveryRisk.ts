/**
 * Delivery Risk Assessment Module
 * As per IEEE Paper Section VI: Delivery Platform Integration
 */

export interface DeliveryOrder {
  orderId: string;
  pickupLocation: { lat: number; lng: number; address: string };
  dropLocation: { lat: number; lng: number; address: string };
  orderValue: number; // in rupees
  customerRating: number; // 0-5
  timeOfDay: number; // 0-23
  estimatedTime: number; // in minutes
}

export interface RiskAssessment {
  totalRisk: number; // 0-10
  areaRisk: number;
  timeRisk: number;
  valueRisk: number;
  customerRisk: number;
  recommendation: 'safe' | 'caution' | 'high-risk' | 'decline';
  factors: string[];
  mitigations: string[];
}

// Weights as per paper equation
const RISK_WEIGHTS = {
  area: 0.40,      // w1 - Area safety risk
  time: 0.30,      // w2 - Time-based risk
  value: 0.20,     // w3 - Order value risk
  customer: 0.10   // w4 - Customer history risk
};

/**
 * Calculate area risk based on location safety score
 * Formula: R_area = (10 - S_area) / 10
 */
function calculateAreaRisk(location: { lat: number; lng: number }, safetyScore: number): number {
  return (10 - safetyScore) / 10;
}

/**
 * Calculate time-based risk
 * Formula: R_time based on time of day
 */
function calculateTimeRisk(hour: number): number {
  // High risk hours: 10 PM - 5 AM
  if (hour >= 22 || hour < 5) return 0.9;
  // Medium risk: 6 PM - 10 PM
  if (hour >= 18 && hour < 22) return 0.5;
  // Early morning: 5 AM - 7 AM
  if (hour >= 5 && hour < 7) return 0.4;
  // Low risk: Day time
  return 0.2;
}

/**
 * Calculate value-based risk
 * Formula: R_value based on order value
 */
function calculateValueRisk(orderValue: number): number {
  // High value orders have higher theft risk
  if (orderValue > 2000) return 0.8;
  if (orderValue > 1000) return 0.6;
  if (orderValue > 500) return 0.4;
  return 0.2;
}

/**
 * Calculate customer history risk
 * Formula: R_customer = (5 - customer_rating) / 5
 */
function calculateCustomerRisk(customerRating: number): number {
  if (customerRating < 0 || customerRating > 5) return 0.8; // No rating - higher risk
  return (5 - customerRating) / 5;
}

/**
 * Calculate comprehensive delivery risk score
 * Formula: R_delivery = w1·R_area + w2·R_time + w3·R_value + w4·R_customer
 */
export function calculateDeliveryRisk(
  order: DeliveryOrder,
  pickupSafetyScore: number = 7.0,
  dropSafetyScore: number = 7.0
): RiskAssessment {
  // Calculate individual risk components
  const pickupAreaRisk = calculateAreaRisk(order.pickupLocation, pickupSafetyScore);
  const dropAreaRisk = calculateAreaRisk(order.dropLocation, dropSafetyScore);
  const areaRisk = Math.max(pickupAreaRisk, dropAreaRisk); // Take worst case
  
  const timeRisk = calculateTimeRisk(order.timeOfDay);
  const valueRisk = calculateValueRisk(order.orderValue);
  const customerRisk = calculateCustomerRisk(order.customerRating);
  
  // Calculate weighted total risk
  const totalRisk = 
    RISK_WEIGHTS.area * areaRisk +
    RISK_WEIGHTS.time * timeRisk +
    RISK_WEIGHTS.value * valueRisk +
    RISK_WEIGHTS.customer * customerRisk;

  // Scale to 0-10
  const scaledRisk = totalRisk * 10;

  // Determine recommendation
  let recommendation: 'safe' | 'caution' | 'high-risk' | 'decline';
  if (scaledRisk < 3) recommendation = 'safe';
  else if (scaledRisk < 6) recommendation = 'caution';
  else if (scaledRisk < 8) recommendation = 'high-risk';
  else recommendation = 'decline';

  // Identify risk factors
  const factors: string[] = [];
  if (areaRisk > 0.6) factors.push('High-risk delivery area');
  if (timeRisk > 0.7) factors.push('Late night delivery (10 PM - 5 AM)');
  if (valueRisk > 0.6) factors.push(`High order value (₹${order.orderValue})`);
  if (customerRisk > 0.5) factors.push('Low customer rating');
  if (order.estimatedTime > 30) factors.push('Long delivery time');

  // Suggest mitigations
  const mitigations: string[] = [];
  if (timeRisk > 0.7) mitigations.push('Enable live location sharing');
  if (areaRisk > 0.6) mitigations.push('Request escort or travel in group');
  if (valueRisk > 0.7) mitigations.push('Verify payment before delivery');
  if (scaledRisk > 6) mitigations.push('Keep emergency contacts alerted');
  if (scaledRisk > 7) mitigations.push('Consider declining this order');

  return {
    totalRisk: Math.round(scaledRisk * 10) / 10,
    areaRisk: Math.round(areaRisk * 10 * 10) / 10,
    timeRisk: Math.round(timeRisk * 10 * 10) / 10,
    valueRisk: Math.round(valueRisk * 10 * 10) / 10,
    customerRisk: Math.round(customerRisk * 10 * 10) / 10,
    recommendation,
    factors,
    mitigations
  };
}

/**
 * Get recommended actions for delivery personnel
 */
export function getDeliveryRecommendations(assessment: RiskAssessment): {
  actions: string[];
  color: string;
  icon: string;
} {
  switch (assessment.recommendation) {
    case 'safe':
      return {
        actions: [
          '✅ Order appears safe to accept',
          '📱 Keep phone charged and accessible',
          '👥 Share ETA with family/friends'
        ],
        color: 'green',
        icon: '✅'
      };
    
    case 'caution':
      return {
        actions: [
          '⚠️ Exercise caution during delivery',
          '📍 Enable live location tracking',
          '👥 Inform someone about your route',
          '💡 Stick to well-lit main roads'
        ],
        color: 'yellow',
        icon: '⚠️'
      };
    
    case 'high-risk':
      return {
        actions: [
          '🚨 High-risk delivery - proceed with extreme caution',
          '📱 Activate emergency SOS before departure',
          '👥 Request escort or travel with partner',
          '💰 Verify payment method beforehand',
          '🚦 Avoid shortcuts and isolated areas',
          '📞 Keep emergency numbers ready'
        ],
        color: 'orange',
        icon: '🚨'
      };
    
    case 'decline':
      return {
        actions: [
          '❌ RECOMMEND DECLINING THIS ORDER',
          '🛡️ Risk exceeds acceptable safety threshold',
          '📞 Contact platform support if needed',
          '⏰ Wait for safer delivery opportunities',
          '💪 Your safety is more important than any order'
        ],
        color: 'red',
        icon: '❌'
      };
  }
}

// Sample orders for testing
export const SAMPLE_DELIVERY_ORDERS: DeliveryOrder[] = [
  {
    orderId: 'ORD-001',
    pickupLocation: { 
      lat: 13.0827, 
      lng: 80.2707, 
      address: 'Chennai Central Metro Station' 
    },
    dropLocation: { 
      lat: 13.0475, 
      lng: 80.2379, 
      address: 'Birla Planetarium' 
    },
    orderValue: 450,
    customerRating: 4.5,
    timeOfDay: 14, // 2 PM
    estimatedTime: 20
  },
  {
    orderId: 'ORD-002',
    pickupLocation: { 
      lat: 13.0703, 
      lng: 80.2034, 
      address: 'Koyambedu CMBT' 
    },
    dropLocation: { 
      lat: 13.1147, 
      lng: 79.9864, 
      address: 'Avadi' 
    },
    orderValue: 1200,
    customerRating: 2.5,
    timeOfDay: 23, // 11 PM
    estimatedTime: 45
  }
];
