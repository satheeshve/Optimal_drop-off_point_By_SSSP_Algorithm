"""
Database Models and Connection
SQLite version for demo - simplified spatial data handling
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
# from geoalchemy2 import Geometry  # Disabled for SQLite
from datetime import datetime
import enum

from config import settings

# Database engine - conditional config for SQLite
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Enums
class HazardCategory(str, enum.Enum):
    OBSTACLE = "obstacle"
    SAFETY_CONCERN = "safety_concern"
    CROWD_UPDATE = "crowd_update"
    FACILITY_ISSUE = "facility_issue"
    ACCIDENT = "accident"
    CRIME = "crime"
    POSITIVE = "positive"

class HazardSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ReportStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    RESOLVED = "resolved"

# Database Models

class User(Base):
    """User model with credibility tracking"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)
    
    # Credibility system (as per paper)
    credibility_score = Column(Float, default=0.7)  # 0-1 scale
    reports_submitted = Column(Integer, default=0)
    reports_verified = Column(Integer, default=0)
    reports_rejected = Column(Integer, default=0)
    reports_flagged = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_report_time = Column(DateTime, nullable=True)

class HazardReport(Base):
    """
    Hazard Report Model
    Implements crowdsourced hazard reporting as per paper Section III.E
    """
    __tablename__ = "hazard_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    
    # Location (SQLite: lat/lon instead of PostGIS)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=True)
    
    # Report details
    category = Column(SQLEnum(HazardCategory), nullable=False, index=True)
    severity = Column(SQLEnum(HazardSeverity), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    
    # Status and verification
    status = Column(SQLEnum(ReportStatus), default=ReportStatus.PENDING, index=True)
    is_anonymous = Column(Boolean, default=False)
    
    # Community feedback
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)
    
    # Admin moderation
    admin_notes = Column(Text, nullable=True)
    verified_by = Column(Integer, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Impact calculation cache
    current_impact_score = Column(Float, default=0.0)

class SafetyScore(Base):
    """
    Safety Score Model
    Stores computed safety scores for locations
    """
    __tablename__ = "safety_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Multi-dimensional scores (as per paper)
    incident_score = Column(Float, default=5.0)
    feedback_score = Column(Float, default=5.0)
    crowd_score = Column(Float, default=5.0)
    lighting_score = Column(Float, default=5.0)
    police_score = Column(Float, default=5.0)
    total_score = Column(Float, default=5.0)
    
    # Metadata
    calculated_at = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime, nullable=True)

class EmergencyContact(Base):
    """Emergency Contact Model"""
    __tablename__ = "emergency_contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String, nullable=True)
    relation = Column(String(50), nullable=False)
    
    # Priority levels (P1, P2, P3)
    priority = Column(Integer, default=3, index=True)  # 1=highest, 3=lowest
    
    # Communication channels
    notify_sms = Column(Boolean, default=True)
    notify_whatsapp = Column(Boolean, default=True)
    notify_email = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

class SOSAlert(Base):
    """SOS Alert Model"""
    __tablename__ = "sos_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    
    # Location at time of alert
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=True)
    
    # Alert details
    triggered_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Response tracking
    contacts_notified = Column(Integer, default=0)
    successful_notifications = Column(Integer, default=0)
    
    notes = Column(Text, nullable=True)

class AuditLog(Base):
    """Audit Log for admin actions"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, nullable=False, index=True)
    action = Column(String(50), nullable=False)
    target_type = Column(String(50), nullable=False)
    target_id = Column(Integer, nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
