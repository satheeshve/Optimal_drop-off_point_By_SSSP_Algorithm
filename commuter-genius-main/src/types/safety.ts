// User Profile and Emergency Contact Types

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relation: 'parent' | 'guardian' | 'friend' | 'police' | 'family' | 'spouse' | 'sibling';
  priority: 1 | 2 | 3; // 1 = highest priority
  notifyViaSMS: boolean;
  notifyViaEmail: boolean;
  notifyViaWhatsApp: boolean;
}

export interface MedicalInfo {
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  allergies?: string[];
  medications?: string[];
  emergencyMedicalContact?: string;
  medicalConditions?: string[];
}

export interface SafeZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // in meters
  alertOnExit: boolean;
  alertOnEntry: boolean;
}

export interface RegularRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  time: string;
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
}

export interface SafetySettings {
  autoShareLocation: boolean;
  silentAlarmEnabled: boolean;
  panicModeEnabled: boolean;
  shakeToSOSEnabled: boolean;
  volumeButtonSOSEnabled: boolean;
  trustedContacts: string[]; // Contact IDs
  safeZones: SafeZone[];
  autoRecordAudio: boolean;
  nightModeWarnings: boolean; // Extra alerts when traveling at night
}

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  email?: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profileType: 'adult' | 'women' | 'child' | 'senior';
  photo?: string;
  
  // Emergency Information
  emergencyContacts: EmergencyContact[];
  medicalInfo: MedicalInfo;
  
  // Travel Preferences
  regularRoutes: RegularRoute[];
  homeLocation?: { lat: number; lng: number; address: string };
  workLocation?: { lat: number; lng: number; address: string };
  
  // Safety Settings
  safetySettings: SafetySettings;
  
  // Account Info
  createdAt: Date;
  lastLogin: Date;
  isVerified: boolean;
  accountStatus: 'active' | 'inactive' | 'suspended';
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
    address?: string;
    accuracy?: number;
  };
  alertType: 'sos' | 'panic' | 'deviation' | 'safe_zone_breach' | 'manual';
  message: string;
  audioRecording?: string; // URL or Blob reference
  videoRecording?: string;
  status: 'sent' | 'acknowledged' | 'responded' | 'resolved' | 'false_alarm';
  sentTo: string[]; // Contact IDs
  responses: Array<{
    contactId: string;
    timestamp: Date;
    action: 'acknowledged' | 'calling' | 'on_way' | 'contacted_police';
  }>;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
}

export interface JourneyTracking {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  status: 'ongoing' | 'completed' | 'aborted' | 'emergency';
  route: {
    from: { lat: number; lng: number; address: string };
    to: { lat: number; lng: number; address: string };
    expectedDuration: number; // minutes
    actualDuration?: number;
  };
  currentLocation?: { lat: number; lng: number; timestamp: Date };
  deviations: Array<{
    timestamp: Date;
    location: { lat: number; lng: number };
    distanceFromRoute: number; // meters
  }>;
  sharedWith: string[]; // Contact IDs
  sharingExpiry?: Date;
  emergencyAlerts: string[]; // Alert IDs if any triggered during journey
}

export interface OTPSession {
  sessionId: string;
  phone: string;
  otp: string;
  generatedAt: Date;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

// Emergency Service Locations
export interface EmergencyService {
  id: string;
  type: 'police' | 'hospital' | 'fire_station' | 'women_helpline';
  name: string;
  location: { lat: number; lng: number };
  address: string;
  phone: string;
  available24x7: boolean;
  rating?: number;
  distance?: number; // km from user (calculated)
}

// Safety Rating for Routes/Areas
export interface SafetyRating {
  areaId: string;
  areaName: string;
  location: { lat: number; lng: number };
  overallRating: number; // 1-5
  timeBasedRatings: {
    morning: number; // 6am-12pm
    afternoon: number; // 12pm-6pm
    evening: number; // 6pm-10pm
    night: number; // 10pm-6am
  };
  totalReports: number;
  recentIncidents: Array<{
    type: string;
    date: Date;
    description: string;
  }>;
  lastUpdated: Date;
}

// Export utility types
export type ProfileType = UserProfile['profileType'];
export type AlertType = EmergencyAlert['alertType'];
export type AlertStatus = EmergencyAlert['status'];
export type JourneyStatus = JourneyTracking['status'];
