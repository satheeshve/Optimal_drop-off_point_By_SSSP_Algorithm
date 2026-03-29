"""
Admin Router
Implements administrative moderation and verification as per paper Section IV
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from database import get_db, HazardReport, User, AuditLog, ReportStatus
from config import settings

router = APIRouter()

# Pydantic models
class VerificationAction(BaseModel):
    admin_id: int
    report_id: int
    action: str  # "verify", "reject", "escalate"
    notes: Optional[str] = None

class PriorityReportResponse(BaseModel):
    id: int
    user_id: int
    latitude: float
    longitude: float
    category: str
    severity: str
    title: str
    description: str
    status: str
    created_at: datetime
    priority_score: float
    upvotes: int
    downvotes: int

# Helper functions
def calculate_priority_score(report: HazardReport, user_credibility: float) -> float:
    """
    Calculate priority score for admin queue
    Formula: priority = 0.5×severity + 0.3×urgency + 0.2×credibility
    As per paper Section III.E
    """
    # Severity component
    severity_scores = {
        'low': 0.25,
        'medium': 0.5,
        'high': 0.75,
        'critical': 1.0
    }
    severity_component = severity_scores.get(report.severity.value, 0.5)
    
    # Urgency component (based on age and votes)
    age_hours = (datetime.utcnow() - report.created_at).total_seconds() / 3600
    urgency_component = min(1.0, age_hours / 24)  # 0 to 1 over 24 hours
    
    # Add community urgency signal
    net_votes = report.upvotes - report.downvotes
    vote_urgency = min(0.3, net_votes * 0.05)  # Up to 0.3 from votes
    urgency_component = min(1.0, urgency_component + vote_urgency)
    
    # Credibility component
    credibility_component = user_credibility
    
    # Weighted sum
    priority = (
        0.5 * severity_component +
        0.3 * urgency_component +
        0.2 * credibility_component
    )
    
    return round(priority, 3)

def update_user_credibility(db: Session, user_id: int, action: str):
    """
    Update user credibility based on verification result
    As per paper Section IV - credibility tracking
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        return
    
    if action == "verify":
        user.reports_verified += 1
        user.credibility_score = min(1.0, user.credibility_score + settings.CREDIBILITY_INCREASE_VERIFIED)
    elif action == "reject":
        user.reports_rejected += 1
        user.credibility_score = max(0.0, user.credibility_score - settings.CREDIBILITY_DECREASE_REJECTED)
        
        # Check for penalties
        if user.reports_rejected == 1:
            # First offense: warning (handled in UI)
            pass
        elif user.reports_rejected == 2:
            # Second offense: already reduced credibility above
            pass
        elif user.reports_rejected >= 3:
            # Third offense: temporary suspension
            user.is_active = False
    
    db.commit()

# Endpoints
@router.get("/hazards/pending", response_model=List[PriorityReportResponse])
def get_pending_hazards(
    admin_id: int,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get pending hazard reports ordered by priority
    Implements priority queue for admin moderation
    """
    # Verify admin
    admin = db.query(User).filter(User.id == admin_id).first()
    if not admin or not admin.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Get pending reports
    reports = db.query(HazardReport).filter(
        HazardReport.status == ReportStatus.PENDING
    ).limit(limit).all()
    
    # Calculate priority scores and prepare response
    result = []
    for report in reports:
        # Get user credibility
        user = db.query(User).filter(User.id == report.user_id).first()
        user_credibility = user.credibility_score if user else 0.5
        
        priority = calculate_priority_score(report, user_credibility)
        
        result.append(PriorityReportResponse(
            id=report.id,
            user_id=report.user_id,
            latitude=report.latitude,
            longitude=report.longitude,
            category=report.category.value,
            severity=report.severity.value,
            title=report.title,
            description=report.description,
            status=report.status.value,
            created_at=report.created_at,
            priority_score=priority,
            upvotes=report.upvotes,
            downvotes=report.downvotes
        ))
    
    # Sort by priority (highest first)
    result.sort(key=lambda x: x.priority_score, reverse=True)
    
    return result

@router.post("/hazards/verify")
def verify_hazard_report(action: VerificationAction, db: Session = Depends(get_db)):
    """
    Verify, reject, or escalate a hazard report
    Implements admin moderation workflow from paper Section IV
    """
    # Verify admin
    admin = db.query(User).filter(User.id == action.admin_id).first()
    if not admin or not admin.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Get report
    report = db.query(HazardReport).filter(HazardReport.id == action.report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Perform action
    if action.action == "verify":
        report.status = ReportStatus.VERIFIED
        report.verified_by = action.admin_id
        report.verified_at = datetime.utcnow()
        update_user_credibility(db, report.user_id, "verify")
        result_message = "Report verified successfully"
        
    elif action.action == "reject":
        report.status = ReportStatus.REJECTED
        report.verified_by = action.admin_id
        report.verified_at = datetime.utcnow()
        update_user_credibility(db, report.user_id, "reject")
        result_message = "Report rejected"
        
    elif action.action == "escalate":
        # Keep pending but flag for escalation
        report.admin_notes = f"ESCALATED: {action.notes or 'Forwarded to authorities'}"
        result_message = "Report escalated to authorities"
        
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action"
        )
    
    # Add admin notes
    if action.notes:
        report.admin_notes = action.notes
    
    # Create audit log
    audit = AuditLog(
        admin_id=action.admin_id,
        action=action.action,
        target_type="hazard_report",
        target_id=action.report_id,
        details=action.notes
    )
    
    db.add(audit)
    db.commit()
    
    return {
        "report_id": action.report_id,
        "action": action.action,
        "status": report.status.value,
        "message": result_message
    }

@router.get("/stats/moderation")
def get_moderation_stats(admin_id: int, db: Session = Depends(get_db)):
    """Get admin moderation statistics"""
    # Verify admin
    admin = db.query(User).filter(User.id == admin_id).first()
    if not admin or not admin.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    total_reports = db.query(HazardReport).count()
    pending = db.query(HazardReport).filter(HazardReport.status == ReportStatus.PENDING).count()
    verified = db.query(HazardReport).filter(HazardReport.status == ReportStatus.VERIFIED).count()
    rejected = db.query(HazardReport).filter(HazardReport.status == ReportStatus.REJECTED).count()
    
    # Calculate average moderation time for completed reports
    completed = db.query(HazardReport).filter(
        HazardReport.verified_at.isnot(None)
    ).all()
    
    if completed:
        avg_time_seconds = sum(
            (r.verified_at - r.created_at).total_seconds() for r in completed
        ) / len(completed)
        avg_time_minutes = avg_time_seconds / 60
    else:
        avg_time_minutes = 0
    
    verification_rate = (verified / total_reports * 100) if total_reports > 0 else 0
    
    return {
        "total_reports": total_reports,
        "pending": pending,
        "verified": verified,
        "rejected": rejected,
        "verification_rate": round(verification_rate, 1),
        "average_moderation_time_minutes": round(avg_time_minutes, 1)
    }

@router.get("/audit-log")
def get_audit_log(
    admin_id: int,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get audit log of admin actions"""
    # Verify admin
    admin = db.query(User).filter(User.id == admin_id).first()
    if not admin or not admin.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    logs = db.query(AuditLog).order_by(
        AuditLog.timestamp.desc()
    ).limit(limit).all()
    
    return [{
        "id": log.id,
        "admin_id": log.admin_id,
        "action": log.action,
        "target_type": log.target_type,
        "target_id": log.target_id,
        "details": log.details,
        "timestamp": log.timestamp
    } for log in logs]
