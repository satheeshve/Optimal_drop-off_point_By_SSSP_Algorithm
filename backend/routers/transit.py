"""Transit router exposing GTFS and GTFS-RT live feeds."""

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from services.gtfs import build_route_shape, ensure_static_loaded, fetch_vehicle_positions

router = APIRouter()


class LiveVehicle(BaseModel):
    entity_id: str
    vehicle_id: str
    vehicle_label: str
    trip_id: str
    route_id: str
    route_short_name: str
    route_long_name: str
    mode: str
    lat: float
    lon: float
    bearing: Optional[float] = None
    speed: Optional[float] = None
    timestamp: Optional[int] = None
    occupancy_status: Optional[int] = None


class LiveTransitResponse(BaseModel):
    provider: str
    feed_type: str
    route_filter: Optional[str] = None
    vehicles: List[LiveVehicle]
    route_shape: List[dict]
    static_loaded_at: Optional[float] = None


@router.get("/live-feed", response_model=LiveTransitResponse)
async def get_live_feed(
    route_short_name: Optional[str] = Query(default=None, description="Filter by GTFS route_short_name (bus/train number)"),
    limit: int = Query(default=200, ge=1, le=1000),
):
    """Get real-time vehicle positions from GTFS-RT feed and optional static route geometry."""
    try:
        static_cache = await ensure_static_loaded(force=False)
        vehicles = await fetch_vehicle_positions(route_short_name=route_short_name, limit=limit)

        shape = []
        if route_short_name:
            shape = build_route_shape(static_cache, route_short_name)

        return LiveTransitResponse(
            provider="gtfs-rt",
            feed_type="vehicle_positions",
            route_filter=route_short_name,
            vehicles=[LiveVehicle(**vehicle) for vehicle in vehicles],
            route_shape=shape,
            static_loaded_at=static_cache.loaded_at,
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Unable to fetch GTFS live feed: {exc}") from exc


@router.post("/reload-static")
async def reload_gtfs_static():
    """Force reload static GTFS files (routes/trips/shapes)."""
    try:
        cache = await ensure_static_loaded(force=True)
        return {
            "message": "GTFS static cache reloaded",
            "routes": len(cache.routes),
            "trips": len(cache.trips),
            "shapes": len(cache.shapes),
            "loaded_at": cache.loaded_at,
        }
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Unable to reload GTFS static data: {exc}") from exc
