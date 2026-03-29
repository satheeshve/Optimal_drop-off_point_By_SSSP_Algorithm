"""
Police Patrol Route Management
Implements daily shift-based patrol route entry by police/government officials
As per paper Section III.D - Police Presence Scoring
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, time, date, timedelta

from database import get_db, Base
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Time, Date
from config import settings

router = APIRouter()

# Database Model for Police Patrols
class PolicePatrol(Base):
    """
    Police Patrol Route Model
    Stores daily patrol routes and shifts for safety scoring
    """
    __tablename__ = "police_patrols"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Station Information
    station_name = Column(String(200), nullable=False, index=True)
    station_code = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Patrol Details
    patrol_route_name = Column(String(200), nullable=False)
    patrol_area_description = Column(String(500))
    
    # Shift Information
    shift_date = Column(Date, nullable=False, index=True)
    shift_type = Column(String(20), nullable=False, index=True)  # morning, afternoon, evening, night
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    
    # Officer Details
    officer_in_charge = Column(String(200))
    officer_badge_number = Column(String(50))
    patrol_vehicle_number = Column(String(50))
    
    # Contact Information
    contact_number = Column(String(20))
    emergency_contact = Column(String(20))
    
    # Status
    is_active = Column(Boolean, default=True)
    status = Column(String(20), default="scheduled")  # scheduled, active, completed, cancelled
    
    # Coverage area (radius in km)
    coverage_radius_km = Column(Float, default=2.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(100))  # Admin/Police username
    
    # Verification
    verified_by_admin = Column(Boolean, default=False)
    admin_notes = Column(String(500))


# Pydantic Models
class PolicePatrolCreate(BaseModel):
    station_name: str
    station_code: str
    latitude: float
    longitude: float
    patrol_route_name: str
    patrol_area_description: Optional[str] = ""
    shift_date: str  # YYYY-MM-DD format
    shift_type: str  # morning, afternoon, evening, night
    start_time: str  # HH:MM format
    end_time: str  # HH:MM format
    officer_in_charge: Optional[str] = ""
    officer_badge_number: Optional[str] = ""
    patrol_vehicle_number: Optional[str] = ""
    contact_number: Optional[str] = ""
    emergency_contact: Optional[str] = "100"
    coverage_radius_km: float = 2.0
    created_by: str = "admin"


class PolicePatrolUpdate(BaseModel):
    status: Optional[str] = None
    is_active: Optional[bool] = None
    officer_in_charge: Optional[str] = None
    contact_number: Optional[str] = None
    admin_notes: Optional[str] = None


class PolicePatrolResponse(BaseModel):
    id: int
    station_name: str
    station_code: str
    latitude: float
    longitude: float
    patrol_route_name: str
    patrol_area_description: Optional[str]
    shift_date: date
    shift_type: str
    start_time: time
    end_time: time
    officer_in_charge: Optional[str]
    officer_badge_number: Optional[str]
    patrol_vehicle_number: Optional[str]
    contact_number: Optional[str]
    emergency_contact: Optional[str]
    coverage_radius_km: float
    is_active: bool
    status: str
    verified_by_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


def _is_patrol_active_now(patrol: PolicePatrol, now_dt: datetime) -> bool:
    """Support same-day and overnight shifts (e.g. 22:00 to 06:00)."""
    if not patrol.is_active:
        return False

    current_time = now_dt.time()
    today = now_dt.date()
    yesterday = today - timedelta(days=1)

    if patrol.start_time <= patrol.end_time:
        return patrol.shift_date == today and patrol.start_time <= current_time <= patrol.end_time

    # Overnight shift window crosses midnight.
    return (
        (patrol.shift_date == today and current_time >= patrol.start_time)
        or (patrol.shift_date == yesterday and current_time <= patrol.end_time)
    )


# API Endpoints

@router.post("/patrols", response_model=PolicePatrolResponse, status_code=status.HTTP_201_CREATED)
async def create_patrol_route(
    patrol: PolicePatrolCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new police patrol route entry
    
    Used by police/government officials to manually enter daily shift patrol routes.
    This data is used for calculating police presence scores in safety routing.
    
    **Access**: Police officials and admin users only
    """
    try:
        # Parse date and time
        from datetime import datetime as dt
        
        # Validate required fields
        if not patrol.station_name or not patrol.station_name.strip():
            raise HTTPException(status_code=400, detail="Station name is required")
        if not patrol.station_code or not patrol.station_code.strip():
            raise HTTPException(status_code=400, detail="Station code is required")
        if not patrol.patrol_route_name or not patrol.patrol_route_name.strip():
            raise HTTPException(status_code=400, detail="Patrol route name is required")
        
        shift_date = dt.strptime(patrol.shift_date, "%Y-%m-%d").date()
        start_time = dt.strptime(patrol.start_time, "%H:%M").time()
        end_time = dt.strptime(patrol.end_time, "%H:%M").time()
        
        # Create patrol entry with proper defaults
        new_patrol = PolicePatrol(
            station_name=patrol.station_name.strip(),
            station_code=patrol.station_code.strip(),
            latitude=patrol.latitude,
            longitude=patrol.longitude,
            patrol_route_name=patrol.patrol_route_name.strip(),
            patrol_area_description=patrol.patrol_area_description.strip() if patrol.patrol_area_description else None,
            shift_date=shift_date,
            shift_type=patrol.shift_type,
            start_time=start_time,
            end_time=end_time,
            officer_in_charge=patrol.officer_in_charge.strip() if patrol.officer_in_charge else None,
            officer_badge_number=patrol.officer_badge_number.strip() if patrol.officer_badge_number else None,
            patrol_vehicle_number=patrol.patrol_vehicle_number.strip() if patrol.patrol_vehicle_number else None,
            contact_number=patrol.contact_number.strip() if patrol.contact_number else None,
            emergency_contact=patrol.emergency_contact.strip() if patrol.emergency_contact else "100",
            coverage_radius_km=patrol.coverage_radius_km,
            created_by=patrol.created_by if patrol.created_by else "admin",
            is_active=True,
            status="scheduled"
        )
        
        db.add(new_patrol)
        db.commit()
        db.refresh(new_patrol)
        
        return new_patrol
        
    except HTTPException:
        raise
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date/time format: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        print(f"Error creating patrol: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create patrol route: {str(e)}"
        )


@router.get("/patrols/active", response_model=List[PolicePatrolResponse])
async def get_active_patrols(
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius_km: float = 5.0,
    shift_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get currently active police patrols
    
    Optionally filter by location to find nearby patrols.
    Used for real-time safety scoring in route calculations.
    
    **Query Parameters**:
    - latitude, longitude: User location for proximity filtering
    - radius_km: Search radius (default: 5km)
    - shift_type: Filter by shift (morning/afternoon/evening/night)
    """
    from datetime import date, datetime as dt

    now_dt = dt.now()
    today = date.today()
    yesterday = today - timedelta(days=1)

    # Include yesterday to account for overnight patrol windows.
    query = db.query(PolicePatrol).filter(
        and_(
            PolicePatrol.shift_date.in_([today, yesterday]),
            PolicePatrol.is_active == True
        )
    )
    
    # Filter by shift type if provided
    if shift_type:
        query = query.filter(PolicePatrol.shift_type == shift_type)
    
    patrols = [p for p in query.all() if _is_patrol_active_now(p, now_dt)]
    
    # Filter by proximity if location provided
    if latitude is not None and longitude is not None:
        from math import radians, sin, cos, sqrt, atan2
        
        def haversine_distance(lat1, lon1, lat2, lon2):
            R = 6371  # Earth radius in km
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
            c = 2 * atan2(sqrt(a), sqrt(1-a))
            return R * c
        
        nearby_patrols = []
        for patrol in patrols:
            distance = haversine_distance(latitude, longitude, patrol.latitude, patrol.longitude)
            if distance <= radius_km:
                nearby_patrols.append(patrol)
        
        return nearby_patrols
    
    return patrols


@router.get("/patrols/today", response_model=List[PolicePatrolResponse])
async def get_todays_patrols(
    shift_type: Optional[str] = None,
    station_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all patrols scheduled for today
    
    Used by police dashboard to view daily patrol schedules.
    """
    from datetime import date
    
    today = date.today()
    
    query = db.query(PolicePatrol).filter(PolicePatrol.shift_date == today)
    
    if shift_type:
        query = query.filter(PolicePatrol.shift_type == shift_type)
    
    if station_code:
        query = query.filter(PolicePatrol.station_code == station_code)
    
    return query.order_by(PolicePatrol.start_time).all()


@router.put("/patrols/{patrol_id}", response_model=PolicePatrolResponse)
async def update_patrol(
    patrol_id: int,
    updates: PolicePatrolUpdate,
    db: Session = Depends(get_db)
):
    """
    Update patrol status or details
    
    Used to mark patrols as active, completed, or cancelled.
    """
    patrol = db.query(PolicePatrol).filter(PolicePatrol.id == patrol_id).first()
    
    if not patrol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patrol not found"
        )
    
    # Update fields
    if updates.status:
        patrol.status = updates.status
    if updates.is_active is not None:
        patrol.is_active = updates.is_active
    if updates.officer_in_charge:
        patrol.officer_in_charge = updates.officer_in_charge
    if updates.contact_number:
        patrol.contact_number = updates.contact_number
    if updates.admin_notes:
        patrol.admin_notes = updates.admin_notes
    
    patrol.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(patrol)
    
    return patrol


@router.get("/patrols/coverage-score")
async def get_police_coverage_score(
    latitude: float,
    longitude: float,
    db: Session = Depends(get_db)
):
    """
    Calculate police presence score for a location
    
    Implements formula from paper Section III.D:
    S_police(p) = 10 × max_{ps ∈ PS} e^(-d(p,ps)/2000)
    
    **Returns**: Police coverage score (0-10) for the given location
    """
    from datetime import date, datetime as dt
    from math import radians, sin, cos, sqrt, atan2, exp
    
    now_dt = dt.now()
    today = date.today()
    yesterday = today - timedelta(days=1)

    active_patrols = db.query(PolicePatrol).filter(
        and_(
            PolicePatrol.shift_date.in_([today, yesterday]),
            PolicePatrol.is_active == True
        )
    ).all()
    active_patrols = [p for p in active_patrols if _is_patrol_active_now(p, now_dt)]
    
    if not active_patrols:
        return {
            "score": 3.0,
            "nearby_patrols": 0,
            "message": "No active patrols found nearby"
        }
    
    def haversine_distance(lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        return R * c
    
    # Calculate maximum proximity score
    max_score = 0.0
    nearby_count = 0
    
    for patrol in active_patrols:
        distance_km = haversine_distance(latitude, longitude, patrol.latitude, patrol.longitude)
        
        # Apply formula: 10 × e^(-d/2000) where d is in meters
        distance_m = distance_km * 1000
        score = 10.0 * exp(-distance_m / 2000)
        
        if score > max_score:
            max_score = score
        
        if distance_km <= 5.0:  # Within 5km
            nearby_count += 1
    
    return {
        "score": round(max_score, 2),
        "nearby_patrols": nearby_count,
        "active_patrols_total": len(active_patrols)
    }


@router.delete("/patrols/{patrol_id}")
async def delete_patrol(
    patrol_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a patrol entry
    
    **Access**: Admin only
    """
    patrol = db.query(PolicePatrol).filter(PolicePatrol.id == patrol_id).first()
    
    if not patrol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patrol not found"
        )
    
    db.delete(patrol)
    db.commit()
    
    return {"message": "Patrol deleted successfully"}
