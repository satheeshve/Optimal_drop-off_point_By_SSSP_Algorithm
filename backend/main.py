"""
Commuter Genius Backend - FastAPI Application
Safety-Enhanced Urban Navigation System

As described in IEEE Paper:
"Optimal Drop-off Point Using Safety-Aware SSSP Algorithm"
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import time

from database import engine, Base, get_db
from routers import hazards, safety, emergency, admin, routes, users, police
from config import settings

# Initialize database tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Initializing Commuter Genius Backend...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
    
    # Initialize default data
    try:
        from init_default_data import init_default_patrols
        init_default_patrols()
    except Exception as e:
        print(f"⚠️  Warning: Could not initialize default data: {e}")
    
    yield
    # Shutdown
    print("👋 Shutting down...")

# Create FastAPI application
app = FastAPI(
    title="Commuter Genius API",
    description="Safety-Enhanced Urban Navigation and Hazard Reporting System",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# Configure CORS - Allow all origins for demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Middleware - Add security headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    start_time = time.time()
    
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(self), notifications=(self)"
    
    # Performance header (response time)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

# Error handling middleware
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Endpoint not found",
            "path": str(request.url),
            "method": request.method,
            "docs": "/api/docs"
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    """Custom 500 handler"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": "An unexpected error occurred. Please try again later."
        }
    )

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(hazards.router, prefix="/api/hazards", tags=["Hazard Reporting"])
app.include_router(safety.router, prefix="/api/safety", tags=["Safety Scoring"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["Emergency Response"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(routes.router, prefix="/api/routes", tags=["Route Planning"])
app.include_router(police.router, prefix="/api/police", tags=["Police Patrol Management"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Commuter Genius API",
        "version": "1.0.0",
        "paper": "Optimal Drop-off Point Using Safety-Aware SSSP Algorithm",
        "institution": "RMK College of Engineering and Technology",
        "docs": "/api/docs"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected",
        "features": {
            "hazard_reporting": True,
            "safety_scoring": True,
            "emergency_response": True,
            "admin_moderation": True,
            "route_optimization": True
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
