"""
Emergency Response Router
Implements SOS and emergency features as per paper Section V
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import Point

from database import get_db, SOSAlert, EmergencyContact, User
from config import settings

router = APIRouter()

# Pydantic models
class SOSActivation(BaseModel):
    user_id: int
    latitude: float
    longitude: float
    address: Optional[str] = None
    notes: Optional[str] = None

class EmergencyContactCreate(BaseModel):
    user_id: int
    name: str
    phone: str
    email: Optional[str] = None
    relation: str
    priority: int  # 1, 2, or 3
    notify_sms: bool = True
    notify_whatsapp: bool = True
    notify_email: bool = True

class EmergencyContactResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str]
    relation: str
    priority: int
    notify_sms: bool
    notify_whatsapp: bool
    notify_email: bool
    
    class Config:
        from_attributes = True

# Endpoints
@router.post("/sos/activate")
def activate_sos(alert: SOSActivation, db: Session = Depends(get_db)):
    """
    Activate SOS emergency alert
    Implements multi-channel alert distribution as per paper Section V
    """
    # Verify user
    user = db.query(User).filter(User.id == alert.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Create SOS alert
    point = from_shape(Point(alert.longitude, alert.latitude), srid=4326)
    
    sos_alert = SOSAlert(
        user_id=alert.user_id,
        location=point,
        address=alert.address,
        notes=alert.notes,
        is_active=True
    )
    
    db.add(sos_alert)
    db.commit()
    db.refresh(sos_alert)
    
    # Get emergency contacts
    contacts = db.query(EmergencyContact).filter(
        EmergencyContact.user_id == alert.user_id
    ).order_by(EmergencyContact.priority).all()
    
    # Simulate alert distribution (in production, integrate with SMS/email services)
    notifications_sent = 0
    successful = 0
    
    for contact in contacts:
        channels = []
        if contact.notify_sms:
            channels.append("SMS")
            notifications_sent += 1
            successful += 1  # Simulate success
        if contact.notify_whatsapp:
            channels.append("WhatsApp")
            notifications_sent += 1
            successful += 1
        if contact.notify_email and contact.email:
            channels.append("Email")
            notifications_sent += 1
            successful += 1
        
        print(f"📢 ALERT to {contact.name} (P{contact.priority}) via {', '.join(channels)}")
        print(f"   Location: {alert.latitude}, {alert.longitude}")
        print(f"   Time: {datetime.utcnow().isoformat()}")
    
    # Update alert with notification stats
    sos_alert.contacts_notified = notifications_sent
    sos_alert.successful_notifications = successful
    db.commit()
    
    return {
        "alert_id": sos_alert.id,
        "status": "active",
        "triggered_at": sos_alert.triggered_at,
        "location": {
            "latitude": alert.latitude,
            "longitude": alert.longitude
        },
        "notifications": {
            "sent": notifications_sent,
            "successful": successful,
            "contacts": len(contacts)
        },
        "message": "Emergency alert activated successfully"
    }

@router.post("/sos/{alert_id}/deactivate")
def deactivate_sos(alert_id: int, user_id: int, db: Session = Depends(get_db)):
    """Deactivate SOS alert"""
    alert = db.query(SOSAlert).filter(
        SOSAlert.id == alert_id,
        SOSAlert.user_id == user_id
    ).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    alert.is_active = False
    alert.resolved_at = datetime.utcnow()
    db.commit()
    
    return {
        "alert_id": alert_id,
        "status": "resolved",
        "duration_seconds": (alert.resolved_at - alert.triggered_at).total_seconds()
    }

@router.get("/sos/active/{user_id}")
def get_active_sos(user_id: int, db: Session = Depends(get_db)):
    """Get active SOS alerts for user"""
    alerts = db.query(SOSAlert).filter(
        SOSAlert.user_id == user_id,
        SOSAlert.is_active == True
    ).order_by(SOSAlert.triggered_at.desc()).all()
    
    result = []
    for alert in alerts:
        shape = to_shape(alert.location)
        result.append({
            "id": alert.id,
            "location": {
                "latitude": shape.y,
                "longitude": shape.x
            },
            "address": alert.address,
            "triggered_at": alert.triggered_at,
            "contacts_notified": alert.contacts_notified
        })
    
    return result

@router.post("/contacts", response_model=EmergencyContactResponse, status_code=status.HTTP_201_CREATED)
def add_emergency_contact(contact: EmergencyContactCreate, db: Session = Depends(get_db)):
    """
    Add emergency contact
    Implements priority-based contact management as per paper Section V.3
    """
    # Validate priority
    if contact.priority not in [1, 2, 3]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Priority must be 1, 2, or 3"
        )
    
    # Create contact
    db_contact = EmergencyContact(
        user_id=contact.user_id,
        name=contact.name,
        phone=contact.phone,
        email=contact.email,
        relation=contact.relation,
        priority=contact.priority,
        notify_sms=contact.notify_sms,
        notify_whatsapp=contact.notify_whatsapp,
        notify_email=contact.notify_email
    )
    
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    
    return db_contact

@router.get("/contacts/{user_id}", response_model=List[EmergencyContactResponse])
def get_emergency_contacts(user_id: int, db: Session = Depends(get_db)):
    """Get all emergency contacts for user"""
    contacts = db.query(EmergencyContact).filter(
        EmergencyContact.user_id == user_id
    ).order_by(EmergencyContact.priority).all()
    
    return contacts

@router.delete("/contacts/{contact_id}")
def delete_emergency_contact(contact_id: int, user_id: int, db: Session = Depends(get_db)):
    """Delete emergency contact"""
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id,
        EmergencyContact.user_id == user_id
    ).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    db.delete(contact)
    db.commit()
    
    return {"message": "Contact deleted successfully"}

@router.get("/stats/{user_id}")
def get_emergency_stats(user_id: int, db: Session = Depends(get_db)):
    """Get emergency response statistics"""
    total_alerts = db.query(SOSAlert).filter(SOSAlert.user_id == user_id).count()
    active_alerts = db.query(SOSAlert).filter(
        SOSAlert.user_id == user_id,
        SOSAlert.is_active == True
    ).count()
    
    resolved = db.query(SOSAlert).filter(
        SOSAlert.user_id == user_id,
        SOSAlert.resolved_at.isnot(None)
    ).all()
    
    avg_response_time = 0
    if resolved:
        total_time = sum(
            (alert.resolved_at - alert.triggered_at).total_seconds() 
            for alert in resolved
        )
        avg_response_time = total_time / len(resolved) / 60  # minutes
    
    num_contacts = db.query(EmergencyContact).filter(
        EmergencyContact.user_id == user_id
    ).count()
    
    return {
        "total_alerts": total_alerts,
        "active_alerts": active_alerts,
        "resolved_alerts": len(resolved),
        "average_response_time_minutes": round(avg_response_time, 1),
        "emergency_contacts": num_contacts
    }
