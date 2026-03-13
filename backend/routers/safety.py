"""
Safety Scoring Router
Implements multi-dimensional safety scoring as per paper Section III.D
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import Point
import math

from database import get_db, HazardReport, SafetyScore, ReportStatus
from config import settings

router = APIRouter()

# Pydantic models
class SafetyScoreRequest(BaseModel):
    latitude: float
    longitude: float
    time: Optional[str] = None  # ISO format or None for current time

class SafetyScoreResponse(BaseModel):
    latitude: float
    longitude: float
    incident_score: float
    feedback_score: float
    crowd_score: float
    lighting_score: float
    police_score: float
    total_score: float
    risk_level: str
    calculated_at: datetime

# Helper functions
def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in meters between two points"""
    R = 6371000  # Earth radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def calculate_incident_score(db: Session, latitude: float, longitude: float) -> float:
    """
    Calculate incident-based safety score
    Formula: S_incident(p) = 10(1 - Σ w(i)e^(-d/1000)e^(-t/90) / N_th)
    As per paper Section III.D.1
    """
    point = from_shape(Point(longitude, latitude), srid=4326)
    
    # Get verified incidents within 2km in last 180 days
    time_threshold = datetime.utcnow() - timedelta(days=180)
    
    incidents = db.query(HazardReport).filter(
        func.ST_DWithin(HazardReport.location, point, 2000, True),
        HazardReport.created_at >= time_threshold,
        HazardReport.status == ReportStatus.VERIFIED,
        HazardReport.category.in_(['safety_concern', 'crime', 'accident'])
    ).all()
    
    if not incidents:
        return 10.0
    
    weighted_sum = 0.0
    for incident in incidents:
        # Get distance
        inc_shape = to_shape(incident.location)
        distance = haversine_distance(latitude, longitude, inc_shape.y, inc_shape.x)
        
        # Get time in days
        days_ago = (datetime.utcnow() - incident.created_at).days
        
        # Weight by severity
        severity_weights = {'low': 0.5, 'medium': 1.0, 'high': 1.5, 'critical': 2.0}
        w = severity_weights.get(incident.severity.value, 1.0)
        
        # Calculate contribution
        weighted_sum += w * math.exp(-distance / 1000) * math.exp(-days_ago / 90)
    
    N_th = 10  # Threshold for normalization
    score = 10 * (1 - weighted_sum / N_th)
    
    return max(0.0, min(10.0, score))

def calculate_feedback_score(db: Session, latitude: float, longitude: float) -> float:
    """
    Calculate user feedback score
    Formula: S_feedback(p) = Σ rating(r)e^(-age(r)/30)cred(r) / Σ e^(-age(r)/30)
    As per paper Section III.D.2
    """
    point = from_shape(Point(longitude, latitude), srid=4326)
    
    # Get positive feedback reports within 1km in last 90 days
    time_threshold = datetime.utcnow() - timedelta(days=90)
    
    feedback = db.query(HazardReport).filter(
        func.ST_DWithin(HazardReport.location, point, 1000, True),
        HazardReport.created_at >= time_threshold,
        HazardReport.status == ReportStatus.VERIFIED,
        HazardReport.category == 'positive'
    ).all()
    
    if not feedback:
        return 5.0  # Neutral score
    
    numerator = 0.0
    denominator = 0.0
    
    for report in feedback:
        # Age in days
        age = (datetime.utcnow() - report.created_at).days
        
        # User credibility (default 0.7)
        credibility = 0.7
        
        # Rating from upvotes/downvotes (normalize to 0-10)
        net_votes = report.upvotes - report.downvotes
        rating = 5.0 + min(5.0, max(-5.0, net_votes * 0.5))
        
        weight = math.exp(-age / 30)
        numerator += rating * weight * credibility
        denominator += weight
    
    score = numerator / denominator if denominator > 0 else 5.0
    
    return max(0.0, min(10.0, score))

def calculate_crowd_score(crowd_density: int) -> float:
    """
    Calculate crowd density score
    Piecewise function as per paper Section III.D.3
    """
    if crowd_density < 5:
        return 3.0
    elif 5 <= crowd_density <= 50:
        return 8.5
    elif 50 < crowd_density <= 100:
        return 7.0
    else:
        return 5.5

def calculate_lighting_score(hour: int) -> float:
    """
    Calculate lighting score based on time
    As per paper Section III.D.4
    """
    base_score = 7.0  # Assume moderate infrastructure
    
    # Time multiplier
    if 6 <= hour < 18:  # Daytime
        multiplier = 1.2
    elif 18 <= hour < 22:  # Evening
        multiplier = 1.0
    else:  # Night (22-6)
        multiplier = 0.6
    
    score = base_score * multiplier
    return max(0.0, min(10.0, score))

def calculate_police_score(latitude: float, longitude: float) -> float:
    """
    Calculate police presence score
    Formula: S_police(p) = 10 × max e^(-d/2000)
    As per paper Section III.D.5
    """
    # Sample police station locations in Chennai
    police_stations = [
        (13.0827, 80.2707),  # Chennai Central
        (13.0569, 80.2425),  # CMBT area
        (13.1475, 80.2838),  # Avadi
    ]
    
    max_score = 0.0
    for ps_lat, ps_lon in police_stations:
        distance = haversine_distance(latitude, longitude, ps_lat, ps_lon)
        score = 10 * math.exp(-distance / 2000)
        max_score = max(max_score, score)
    
    return max_score

def get_risk_level(total_score: float) -> str:
    """Get risk level from total score"""
    if total_score >= 8.0:
        return "very_safe"
    elif total_score >= 6.0:
        return "safe"
    elif total_score >= 4.0:
        return "moderate"
    elif total_score >= 2.0:
        return "unsafe"
    else:
        return "very_unsafe"

# Endpoints
@router.post("/score", response_model=SafetyScoreResponse)
def calculate_safety_score(request: SafetyScoreRequest, db: Session = Depends(get_db)):
    """
    Calculate multi-dimensional safety score
    Implements complete safety scoring model from paper Section III.D
    """
    # Parse time
    if request.time:
        calc_time = datetime.fromisoformat(request.time)
    else:
        calc_time = datetime.utcnow()
    
    hour = calc_time.hour
    
    # Calculate all components
    incident_score = calculate_incident_score(db, request.latitude, request.longitude)
    feedback_score = calculate_feedback_score(db, request.latitude, request.longitude)
    crowd_score = calculate_crowd_score(25)  # Default moderate crowd
    lighting_score = calculate_lighting_score(hour)
    police_score = calculate_police_score(request.latitude, request.longitude)
    
    # Composite score with weights from paper
    total_score = (
        settings.SAFETY_WEIGHT_INCIDENT * incident_score +
        settings.SAFETY_WEIGHT_FEEDBACK * feedback_score +
        settings.SAFETY_WEIGHT_CROWD * crowd_score +
        settings.SAFETY_WEIGHT_LIGHTING * lighting_score +
        settings.SAFETY_WEIGHT_POLICE * police_score
    )
    
    # Store in database
    point = from_shape(Point(request.longitude, request.latitude), srid=4326)
    db_score = SafetyScore(
        location=point,
        incident_score=round(incident_score, 2),
        feedback_score=round(feedback_score, 2),
        crowd_score=round(crowd_score, 2),
        lighting_score=round(lighting_score, 2),
        police_score=round(police_score, 2),
        total_score=round(total_score, 2),
        calculated_at=calc_time,
        valid_until=calc_time + timedelta(hours=1)
    )
    
    db.add(db_score)
    db.commit()
    
    return SafetyScoreResponse(
        latitude=request.latitude,
        longitude=request.longitude,
        incident_score=round(incident_score, 2),
        feedback_score=round(feedback_score, 2),
        crowd_score=round(crowd_score, 2),
        lighting_score=round(lighting_score, 2),
        police_score=round(police_score, 2),
        total_score=round(total_score, 2),
        risk_level=get_risk_level(total_score),
        calculated_at=calc_time
    )

@router.get("/heatmap")
def get_safety_heatmap(
    min_lat: float,
    max_lat: float,
    min_lon: float,
    max_lon: float,
    db: Session = Depends(get_db)
):
    """
    Generate safety heatmap for a bounding box
    Returns grid of safety scores
    """
    grid_size = 10  # 10x10 grid
    lat_step = (max_lat - min_lat) / grid_size
    lon_step = (max_lon - min_lon) / grid_size
    
    heatmap = []
    
    for i in range(grid_size):
        for j in range(grid_size):
            lat = min_lat + (i + 0.5) * lat_step
            lon = min_lon + (j + 0.5) * lon_step
            
            # Calculate safety score for this point
            incident_score = calculate_incident_score(db, lat, lon)
            feedback_score = calculate_feedback_score(db, lat, lon)
            crowd_score = calculate_crowd_score(25)
            lighting_score = calculate_lighting_score(datetime.utcnow().hour)
            police_score = calculate_police_score(lat, lon)
            
            total_score = (
                settings.SAFETY_WEIGHT_INCIDENT * incident_score +
                settings.SAFETY_WEIGHT_FEEDBACK * feedback_score +
                settings.SAFETY_WEIGHT_CROWD * crowd_score +
                settings.SAFETY_WEIGHT_LIGHTING * lighting_score +
                settings.SAFETY_WEIGHT_POLICE * police_score
            )
            
            heatmap.append({
                "lat": round(lat, 6),
                "lon": round(lon, 6),
                "score": round(total_score, 2),
                "risk_level": get_risk_level(total_score)
            })
    
    return {"grid_size": grid_size, "points": heatmap}

from typing import Optional
