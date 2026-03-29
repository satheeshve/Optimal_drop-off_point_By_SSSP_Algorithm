/**
 * API Service for Frontend
 * Connects React frontend with FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface GoogleTransitStep {
  travel_mode: string;
  line_name?: string;
  line_short_name?: string;
  vehicle_type?: string;
  headsign?: string;
  departure_stop?: string;
  arrival_stop?: string;
  duration_text?: string;
  distance_text?: string;
  num_stops?: number;
}

export interface GoogleTransitRoute {
  provider: string;
  summary?: string;
  distance_text?: string;
  duration_text?: string;
  departure_time_text?: string;
  arrival_time_text?: string;
  fare_text?: string;
  fare_value?: number;
  fare_currency?: string;
  warnings: string[];
  steps: GoogleTransitStep[];
}

export interface OpenRoutePoint {
  lat: number;
  lon: number;
}

export interface OpenRouteResponse {
  provider: string;
  distance_km: number;
  duration_min: number;
  geometry: OpenRoutePoint[];
}

export interface GTFSLiveVehicle {
  entity_id: string;
  vehicle_id: string;
  vehicle_label: string;
  trip_id: string;
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  mode: string;
  lat: number;
  lon: number;
  bearing?: number | null;
  speed?: number | null;
  timestamp?: number | null;
  occupancy_status?: number | null;
}

export interface GTFSLiveFeedResponse {
  provider: string;
  feed_type: string;
  route_filter?: string | null;
  vehicles: GTFSLiveVehicle[];
  route_shape: OpenRoutePoint[];
  static_loaded_at?: number | null;
}

// User Management
export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

export const loginUser = async (credentials: {
  username: string;
  password: string;
}): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

// Hazard Reporting
export const submitHazardReport = async (report: {
  user_id: number;
  latitude: number;
  longitude: number;
  category: string;
  severity: string;
  title: string;
  description: string;
  is_anonymous: boolean;
}): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/hazards/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.detail || 'Failed to submit report' };
    }
    
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

export const getNearbyHazards = async (
  latitude: number,
  longitude: number,
  radius_km: number = 2.0,
  status_filter: string = 'verified'
): Promise<ApiResponse<any[]>> => {
  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      radius_km: String(radius_km),
      status_filter,
    });
    
    const response = await fetch(`${API_BASE_URL}/hazards/nearby?${params}`);
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

export const voteOnHazard = async (
  report_id: number,
  user_id: number,
  vote: 'up' | 'down'
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/hazards/${report_id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, vote }),
    });
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

// Safety Scoring
export const calculateSafetyScore = async (
  latitude: number,
  longitude: number,
  time?: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/safety/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, time }),
    });
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

export const getSafetyHeatmap = async (
  min_lat: number,
  max_lat: number,
  min_lon: number,
  max_lon: number
): Promise<ApiResponse<any>> => {
  try {
    const params = new URLSearchParams({
      min_lat: String(min_lat),
      max_lat: String(max_lat),
      min_lon: String(min_lon),
      max_lon: String(max_lon),
    });
    
    const response = await fetch(`${API_BASE_URL}/safety/heatmap?${params}`);
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

// Admin Operations
export const getPendingHazards = async (
  admin_id: number,
  limit: number = 50
): Promise<ApiResponse<any[]>> => {
  try {
    const params = new URLSearchParams({
      admin_id: String(admin_id),
      limit: String(limit),
    });
    
    const response = await fetch(`${API_BASE_URL}/admin/hazards/pending?${params}`);
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

export const verifyHazardReport = async (
  admin_id: number,
  report_id: number,
  action: 'verify' | 'reject' | 'escalate',
  notes?: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/hazards/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id, report_id, action, notes }),
    });
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

// Emergency Response
export const activateSOS = async (
  user_id: number,
  latitude: number,
  longitude: number,
  address?: string,
  notes?: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/emergency/sos/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, latitude, longitude, address, notes }),
    });
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

export const addEmergencyContact = async (contact: {
  user_id: number;
  name: string;
  phone: string;
  email?: string;
  relation: string;
  priority: number;
  notify_sms?: boolean;
  notify_whatsapp?: boolean;
  notify_email?: boolean;
}): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/emergency/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

// Route Planning
export const planRoute = async (
  start_lat: number,
  start_lon: number,
  end_lat: number,
  end_lon: number,
  time_weight: number = 0.4,
  fare_weight: number = 0.3,
  safety_weight: number = 0.3
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/routes/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_lat,
        start_lon,
        end_lat,
        end_lon,
        mode: 'public_transport',
        time_weight,
        fare_weight,
        safety_weight,
        avoid_unsafe: true,
      }),
    });
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

export const compareRoutes = async (
  start_lat: number,
  start_lon: number,
  end_lat: number,
  end_lon: number,
  time_weight: number = 0.4,
  fare_weight: number = 0.3,
  safety_weight: number = 0.3
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/routes/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_lat,
        start_lon,
        end_lat,
        end_lon,
        mode: 'public_transport',
        time_weight,
        fare_weight,
        safety_weight,
        avoid_unsafe: true,
      }),
    });
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

export const getGoogleTransitRoute = async (
  start_lat: number,
  start_lon: number,
  end_lat: number,
  end_lon: number,
  departure_time: string = 'now'
): Promise<ApiResponse<GoogleTransitRoute>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/routes/google-transit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_lat,
        start_lon,
        end_lat,
        end_lon,
        departure_time,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { error: data?.detail || 'Failed to fetch transit route from Google' };
    }

    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

export const getOpenRoute = async (
  start_lat: number,
  start_lon: number,
  end_lat: number,
  end_lon: number,
): Promise<ApiResponse<OpenRouteResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/routes/open-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_lat,
        start_lon,
        end_lat,
        end_lon,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { error: data?.detail || 'Failed to fetch open route' };
    }

    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

export const getGtfsLiveFeed = async (
  route_short_name?: string,
  limit: number = 200
): Promise<ApiResponse<GTFSLiveFeedResponse>> => {
  try {
    const params = new URLSearchParams({
      limit: String(limit),
    });

    if (route_short_name && route_short_name.trim().length > 0) {
      params.set('route_short_name', route_short_name.trim());
    }

    const response = await fetch(`${API_BASE_URL}/transit/live-feed?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data?.detail || 'Failed to fetch GTFS live feed' };
    }

    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

// Health Check
export const checkBackendHealth = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
};

export default {
  registerUser,
  loginUser,
  submitHazardReport,
  getNearbyHazards,
  voteOnHazard,
  calculateSafetyScore,
  getSafetyHeatmap,
  getPendingHazards,
  verifyHazardReport,
  activateSOS,
  addEmergencyContact,
  planRoute,
  compareRoutes,
  getGoogleTransitRoute,
  getOpenRoute,
  getGtfsLiveFeed,
  checkBackendHealth,
};
