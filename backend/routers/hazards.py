"""
Hazard Reporting Router
Implements crowdsourced hazard reporting as per paper Section III.E
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from geopy.distance import geodesic

from database import get_db, HazardReport, User, HazardCategory, HazardSeverity, ReportStatus
from config import settings

router = APIRouter()

# Pydantic models
class HazardReportCreate(BaseModel):
    user_id: int
    latitude: float
    longitude: float
    category: HazardCategory
    severity: HazardSeverity
    title: str
    description: str
    is_anonymous: bool = False

class HazardReportResponse(BaseModel):
    id: int
    user_id: int
    latitude: float
    longitude: float
    category: str
    severity: str
    title: str
    description: str
    status: str
    upvotes: int
    downvotes: int
    created_at: datetime
    current_impact_score: float
    
    class Config:
        from_attributes = True

class HazardVote(BaseModel):
    user_id: int
    vote: str  # "up" or "down"

# Helper functions
def calculate_hazard_impact(report: HazardReport) -> float:
    """
    Calculate hazard impact using exponential decay
    Formula: impact(r,t) = base(r) × e^(-t/τ)
    As per paper Section III.E
    """
    # Base impact by severity
    base_impacts = {
        HazardSeverity.CRITICAL: 10.0,
        HazardSeverity.HIGH: 7.5,
        HazardSeverity.MEDIUM: 5.0,
        HazardSeverity.LOW: 2.5
    }
    
    # Decay time constants (hours)
    decay_times = {
        HazardCategory.OBSTACLE: settings.DECAY_TIME_OBSTACLE,
        HazardCategory.SAFETY_CONCERN: settings.DECAY_TIME_SAFETY_CONCERN,
        HazardCategory.CROWD_UPDATE: settings.DECAY_TIME_CROWD_UPDATE,
        HazardCategory.FACILITY_ISSUE: settings.DECAY_TIME_FACILITY_ISSUE,
        HazardCategory.ACCIDENT: settings.DECAY_TIME_ACCIDENT,
        HazardCategory.CRIME: settings.DECAY_TIME_CRIME,
        HazardCategory.POSITIVE: 24
    }
    
    base_impact = base_impacts.get(report.severity, 5.0)
    tau = decay_times.get(report.category, 24)
    
    # Time elapsed in hours
    time_elapsed = (datetime.utcnow() - report.created_at).total_seconds() / 3600
    
    # Exponential decay
    import math
    impact = base_impact * math.exp(-time_elapsed / tau)
    
    # Community feedback adjustment
    net_votes = report.upvotes - report.downvotes
    vote_multiplier = 1.0 + (net_votes * 0.1)  # Each net upvote adds 10%
    vote_multiplier = max(0.5, min(vote_multiplier, 2.0))  # Clamp between 0.5x and 2x
    
    return round(impact * vote_multiplier, 2)

def check_duplicate_report(db: Session, latitude: float, longitude: float, category: HazardCategory, user_id: int) -> bool:
    """
    Check for duplicate reports within 50m radius in 30 minutes
    As per paper Section IV - duplicate detection
    """
    time_threshold = datetime.utcnow() - timedelta(minutes=settings.DUPLICATE_DETECTION_TIME_MIN)

    recent_reports = db.query(HazardReport).filter(
        and_(
            HazardReport.category == category,
            HazardReport.created_at >= time_threshold
        )
    ).all()

    for existing in recent_reports:
        distance_m = geodesic((latitude, longitude), (existing.latitude, existing.longitude)).meters
        if distance_m <= settings.DUPLICATE_DETECTION_RADIUS_M:
            return True

    return False

def check_rate_limit(db: Session, user_id: int) -> bool:
    """
    Check if user has exceeded rate limit
    Maximum 5 reports per hour as per paper Section IV
    """
    time_threshold = datetime.utcnow() - timedelta(hours=1)
    
    report_count = db.query(HazardReport).filter(
        and_(
            HazardReport.user_id == user_id,
            HazardReport.created_at >= time_threshold
        )
    ).count()
    
    return report_count >= settings.MAX_REPORTS_PER_HOUR

def check_credibility_threshold(db: Session, user_id: int) -> bool:
    """
    Check if user meets minimum credibility threshold
    Minimum 0.4 credibility required as per paper Section IV
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        return False
    
    return user.credibility_score >= settings.MIN_CREDIBILITY_THRESHOLD

# Endpoints
@router.post("/report", response_model=HazardReportResponse, status_code=status.HTTP_201_CREATED)
def create_hazard_report(report: HazardReportCreate, db: Session = Depends(get_db)):
    """
    Create a new hazard report
    Implements crowdsourced hazard reporting with quality controls
    """
    # Check credibility threshold
    if not check_credibility_threshold(db, report.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User credibility below minimum threshold (0.4)"
        )
    
    # Check rate limiting
    if check_rate_limit(db, report.user_id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Maximum {settings.MAX_REPORTS_PER_HOUR} reports per hour exceeded"
        )
    
    # Check for duplicates
    if check_duplicate_report(db, report.latitude, report.longitude, report.category, report.user_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Similar report already exists within 50m in last 30 minutes"
        )
    
    # Create hazard report
    db_report = HazardReport(
        user_id=report.user_id,
        latitude=report.latitude,
        longitude=report.longitude,
        category=report.category,
        severity=report.severity,
        title=report.title,
        description=report.description,
        is_anonymous=report.is_anonymous,
        status=ReportStatus.PENDING
    )
    
    db.add(db_report)
    
    # Update user statistics
    user = db.query(User).filter(User.id == report.user_id).first()
    if user:
        user.reports_submitted += 1
        user.last_report_time = datetime.utcnow()
    
    db.commit()
    db.refresh(db_report)
    
    # Calculate initial impact
    db_report.current_impact_score = calculate_hazard_impact(db_report)
    db.commit()
    
    response = HazardReportResponse(
        id=db_report.id,
        user_id=db_report.user_id,
        latitude=db_report.latitude,
        longitude=db_report.longitude,
        category=db_report.category.value,
        severity=db_report.severity.value,
        title=db_report.title,
        description=db_report.description,
        status=db_report.status.value,
        upvotes=db_report.upvotes,
        downvotes=db_report.downvotes,
        created_at=db_report.created_at,
        current_impact_score=db_report.current_impact_score
    )
    
    return response

@router.get("/nearby", response_model=List[HazardReportResponse])
def get_nearby_hazards(
    latitude: float,
    longitude: float,
    radius_km: float = 2.0,
    status_filter: Optional[str] = "verified",
    db: Session = Depends(get_db)
):
    """
    Get hazards within radius (default 2km as per paper)
    Only returns verified hazards unless specified
    """
    query = db.query(HazardReport)
    
    if status_filter:
        query = query.filter(HazardReport.status == status_filter)
    
    candidate_reports = query.order_by(HazardReport.created_at.desc()).all()
    
    # Update impact scores
    result = []
    for report in candidate_reports:
        distance_km = geodesic((latitude, longitude), (report.latitude, report.longitude)).km
        if distance_km > radius_km:
            continue

        report.current_impact_score = calculate_hazard_impact(report)
        result.append(HazardReportResponse(
            id=report.id,
            user_id=report.user_id,
            latitude=report.latitude,
            longitude=report.longitude,
            category=report.category.value,
            severity=report.severity.value,
            title=report.title,
            description=report.description,
            status=report.status.value,
            upvotes=report.upvotes,
            downvotes=report.downvotes,
            created_at=report.created_at,
            current_impact_score=report.current_impact_score
        ))
    
    db.commit()
    return result

@router.post("/{report_id}/vote")
def vote_on_hazard(report_id: int, vote_data: HazardVote, db: Session = Depends(get_db)):
    """Community voting on hazard reports"""
    report = db.query(HazardReport).filter(HazardReport.id == report_id).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    if vote_data.vote == "up":
        report.upvotes += 1
    elif vote_data.vote == "down":
        report.downvotes += 1
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid vote type"
        )
    
    # Recalculate impact
    report.current_impact_score = calculate_hazard_impact(report)
    
    db.commit()
    
    return {
        "report_id": report_id,
        "upvotes": report.upvotes,
        "downvotes": report.downvotes,
        "new_impact_score": report.current_impact_score
    }

@router.get("/stats")
def get_hazard_stats(db: Session = Depends(get_db)):
    """Get overall hazard reporting statistics"""
    total_reports = db.query(HazardReport).count()
    pending = db.query(HazardReport).filter(HazardReport.status == ReportStatus.PENDING).count()
    verified = db.query(HazardReport).filter(HazardReport.status == ReportStatus.VERIFIED).count()
    rejected = db.query(HazardReport).filter(HazardReport.status == ReportStatus.REJECTED).count()
    
    verification_rate = (verified / total_reports * 100) if total_reports > 0 else 0
    
    return {
        "total_reports": total_reports,
        "pending": pending,
        "verified": verified,
        "rejected": rejected,
        "verification_rate": round(verification_rate, 1)
    }
