"""
Initialize Default Data for Police Patrols
This script adds default police patrol data for demonstration purposes
"""

from datetime import date, time, datetime, timedelta
from database import SessionLocal, Base, engine
from routers.police import PolicePatrol

def init_default_patrols():
    """Add default police patrol data for today"""
    db = SessionLocal()
    
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        
        # Check if we already have patrols for today
        today = date.today()
        existing_patrols = db.query(PolicePatrol).filter(
            PolicePatrol.shift_date == today
        ).count()
        
        if existing_patrols > 0:
            print(f"✅ Default patrols already exist for today ({existing_patrols} patrols)")
            return
        
        # Default police patrol data for Chennai (example coordinates)
        default_patrols = [
            {
                "station_name": "T. Nagar Police Station",
                "station_code": "TNP001",
                "latitude": 13.0418,
                "longitude": 80.2341,
                "patrol_route_name": "T. Nagar Commercial Area Patrol",
                "patrol_area_description": "Covering T. Nagar main roads, shopping areas, and public transport hubs. High-traffic commercial zone requiring constant monitoring.",
                "shift_date": today,
                "shift_type": "morning",
                "start_time": time(6, 0),
                "end_time": time(14, 0),
                "officer_in_charge": "Inspector Rajesh Kumar",
                "officer_badge_number": "TNP2301",
                "patrol_vehicle_number": "TN-01-AB-1234",
                "contact_number": "+91-9876543210",
                "emergency_contact": "100",
                "coverage_radius_km": 2.5,
                "is_active": True,
                "status": "active",
                "created_by": "system_admin",
                "verified_by_admin": True
            },
            {
                "station_name": "Mylapore Police Station",
                "station_code": "MLP002",
                "latitude": 13.0339,
                "longitude": 80.2619,
                "patrol_route_name": "Mylapore Temple & Residential Patrol",
                "patrol_area_description": "Patrolling Mylapore temple area, residential neighborhoods, and bus routes. Focus on safety of morning commuters and temple visitors.",
                "shift_date": today,
                "shift_type": "morning",
                "start_time": time(6, 0),
                "end_time": time(14, 0),
                "officer_in_charge": "Sub-Inspector Priya Devi",
                "officer_badge_number": "MLP2105",
                "patrol_vehicle_number": "TN-01-CD-5678",
                "contact_number": "+91-9876543211",
                "emergency_contact": "100",
                "coverage_radius_km": 2.0,
                "is_active": True,
                "status": "active",
                "created_by": "system_admin",
                "verified_by_admin": True
            },
            {
                "station_name": "Adyar Police Station",
                "station_code": "ADY003",
                "latitude": 13.0067,
                "longitude": 80.2565,
                "patrol_route_name": "Adyar IT Corridor & Metro Station Patrol",
                "patrol_area_description": "Coverage of IT corridor, metro stations, and major bus stops. Evening shift focusing on office-goers' safety during rush hours.",
                "shift_date": today,
                "shift_type": "evening",
                "start_time": time(18, 0),
                "end_time": time(2, 0),
                "officer_in_charge": "Inspector Murugan S",
                "officer_badge_number": "ADY2204",
                "patrol_vehicle_number": "TN-01-EF-9012",
                "contact_number": "+91-9876543212",
                "emergency_contact": "100",
                "coverage_radius_km": 3.0,
                "is_active": True,
                "status": "active",
                "created_by": "system_admin",
                "verified_by_admin": True
            },
            {
                "station_name": "Guindy Police Station",
                "station_code": "GND004",
                "latitude": 13.0067,
                "longitude": 80.2206,
                "patrol_route_name": "Guindy Industrial Estate & Railway Patrol",
                "patrol_area_description": "Monitoring Guindy industrial area, railway station, and connecting bus routes. Afternoon shift covering peak commute hours.",
                "shift_date": today,
                "shift_type": "afternoon",
                "start_time": time(14, 0),
                "end_time": time(22, 0),
                "officer_in_charge": "Sub-Inspector Lakshmi R",
                "officer_badge_number": "GND2302",
                "patrol_vehicle_number": "TN-01-GH-3456",
                "contact_number": "+91-9876543213",
                "emergency_contact": "100",
                "coverage_radius_km": 2.5,
                "is_active": True,
                "status": "active",
                "created_by": "system_admin",
                "verified_by_admin": True
            }
        ]
        
        # Add patrols to database
        for patrol_data in default_patrols:
            patrol = PolicePatrol(**patrol_data)
            db.add(patrol)
        
        db.commit()
        print(f"✅ Successfully added {len(default_patrols)} default police patrols for today!")
        print("\nDefault Patrols Added:")
        for i, patrol in enumerate(default_patrols, 1):
            print(f"{i}. {patrol['station_name']} - {patrol['shift_type'].upper()} shift")
            print(f"   Route: {patrol['patrol_route_name']}")
            print(f"   Officer: {patrol['officer_in_charge']}")
            print()
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error initializing default patrols: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Initializing default police patrol data...")
    init_default_patrols()
    print("✅ Initialization complete!")
