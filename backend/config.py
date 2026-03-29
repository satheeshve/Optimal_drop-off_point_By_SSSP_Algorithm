"""
Configuration Settings
Implements paper specifications for safety thresholds and system parameters
"""

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./commuter_genius.db"
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:8080,http://localhost:8081,http://localhost:3000"

    # External Maps Integrations
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    GOOGLE_DIRECTIONS_URL: str = "https://maps.googleapis.com/maps/api/directions/json"
    GOOGLE_MAPS_TIMEOUT_SECONDS: int = 10
    OSRM_ROUTE_URL: str = "https://router.project-osrm.org/route/v1/driving"
    NOMINATIM_SEARCH_URL: str = "https://nominatim.openstreetmap.org/search"
    PHOTON_SEARCH_URL: str = "https://photon.komoot.io/api"
    OPENMAP_TIMEOUT_SECONDS: int = 10
    OPENMAP_USER_AGENT: str = "RouteIQ/1.0 (contact:admin@example.com)"

    # GTFS / GTFS-RT Integration
    GTFS_STATIC_URL: Optional[str] = None
    GTFS_STATIC_PATH: Optional[str] = None
    GTFS_RT_VEHICLE_POSITIONS_URL: Optional[str] = None
    GTFS_RT_API_KEY: Optional[str] = None
    GTFS_RT_API_KEY_HEADER: str = "x-api-key"
    GTFS_TIMEOUT_SECONDS: int = 12
    GTFS_STATIC_CACHE_TTL_SECONDS: int = 1800
    
    # Safety Scoring Weights (as per paper Section III.D)
    SAFETY_WEIGHT_INCIDENT: float = 0.35
    SAFETY_WEIGHT_FEEDBACK: float = 0.25
    SAFETY_WEIGHT_CROWD: float = 0.15
    SAFETY_WEIGHT_LIGHTING: float = 0.15
    SAFETY_WEIGHT_POLICE: float = 0.10
    
    # Hazard Impact Configuration
    HAZARD_IMPACT_RADIUS_KM: float = 2.0  # 2km radius for alerts
    DUPLICATE_DETECTION_RADIUS_M: float = 50  # 50 meters
    DUPLICATE_DETECTION_TIME_MIN: int = 30  # 30 minutes
    
    # Anti-spam Measures (as per paper Section IV)
    MAX_REPORTS_PER_HOUR: int = 5
    MIN_CREDIBILITY_THRESHOLD: float = 0.4
    
    # Exponential Decay Parameters
    INCIDENT_DECAY_DAYS: int = 90
    FEEDBACK_DECAY_DAYS: int = 30
    
    # Emergency Configuration
    SOS_ACTIVATION_DELAY_SECONDS: int = 5
    LOCATION_UPDATE_INTERVAL_SECONDS: int = 10
    
    # Credibility System
    CREDIBILITY_INCREASE_VERIFIED: float = 0.1
    CREDIBILITY_DECREASE_REJECTED: float = 0.3
    NEW_USER_DEFAULT_CREDIBILITY: float = 0.7
    
    # Hazard Decay Time Constants (hours)
    DECAY_TIME_OBSTACLE: int = 6
    DECAY_TIME_SAFETY_CONCERN: int = 24
    DECAY_TIME_CROWD_UPDATE: int = 2
    DECAY_TIME_FACILITY_ISSUE: int = 48
    DECAY_TIME_ACCIDENT: int = 12
    DECAY_TIME_CRIME: int = 72
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
