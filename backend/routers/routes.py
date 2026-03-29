"""
Routes Router
Implements safety-enhanced SSSP algorithm as per paper Section III.C
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Optional
import heapq
import math
import aiohttp
import urllib.parse
import urllib.request
import json

from database import get_db
from routers.safety import calculate_incident_score, calculate_feedback_score
from config import settings

router = APIRouter()

# Pydantic models
class RouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    mode: str = "public_transport"
    time_weight: float = 0.5
    fare_weight: float = 0.3
    safety_weight: float = 0.2
    avoid_unsafe: bool = True

class RouteResponse(BaseModel):
    path: List[Dict[str, float]]
    total_distance: float
    total_time: float
    total_fare: float
    average_safety_score: float
    waypoints: int


class GoogleTransitRouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    departure_time: Optional[str] = "now"


class GoogleTransitStep(BaseModel):
    travel_mode: str
    line_name: Optional[str] = None
    line_short_name: Optional[str] = None
    vehicle_type: Optional[str] = None
    headsign: Optional[str] = None
    departure_stop: Optional[str] = None
    arrival_stop: Optional[str] = None
    duration_text: Optional[str] = None
    distance_text: Optional[str] = None
    num_stops: Optional[int] = None


class GoogleTransitRouteResponse(BaseModel):
    provider: str
    summary: Optional[str] = None
    distance_text: Optional[str] = None
    duration_text: Optional[str] = None
    departure_time_text: Optional[str] = None
    arrival_time_text: Optional[str] = None
    fare_text: Optional[str] = None
    fare_value: Optional[float] = None
    fare_currency: Optional[str] = None
    warnings: List[str]
    steps: List[GoogleTransitStep]


class OpenRouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float


class OpenRouteResponse(BaseModel):
    provider: str
    distance_km: float
    duration_min: float
    geometry: List[Dict[str, float]]


class OpenGeocodeResult(BaseModel):
    display_name: str
    lat: float
    lon: float


class OpenGeocodeResponse(BaseModel):
    provider: str
    query: str
    results: List[OpenGeocodeResult]

# Sample Chennai transit network
CHENNAI_NETWORK = {
    "nodes": [
        {"id": 1, "name": "Chennai Central", "lat": 13.0827, "lon": 80.2707},
        {"id": 2, "name": "CMBT", "lat": 13.0569, "lon": 80.2425},
        {"id": 3, "name": "Avadi", "lat": 13.1175, "lon": 80.1018},
        {"id": 4, "name": "Tambaram", "lat": 12.9249, "lon": 80.1000},
        {"id": 5, "name": "Velachery", "lat": 12.9750, "lon": 80.2212},
        {"id": 6, "name": "Anna Nagar", "lat": 13.0850, "lon": 80.2101},
        {"id": 7, "name": "T Nagar", "lat": 13.0418, "lon": 80.2341},
    ],
    "edges": [
        {"from": 1, "to": 2, "distance": 8.2, "time": 25, "fare": 15},
        {"from": 1, "to": 6, "distance": 6.5, "time": 20, "fare": 12},
        {"from": 1, "to": 7, "distance": 5.0, "time": 18, "fare": 10},
        {"from": 2, "to": 3, "distance": 12.0, "time": 35, "fare": 20},
        {"from": 2, "to": 6, "distance": 7.0, "time": 22, "fare": 14},
        {"from": 4, "to": 5, "distance": 10.0, "time": 30, "fare": 18},
        {"from": 5, "to": 7, "distance": 8.0, "time": 25, "fare": 15},
        {"from": 6, "to": 3, "distance": 9.0, "time": 28, "fare": 16},
        {"from": 7, "to": 4, "distance": 15.0, "time": 40, "fare": 25},
    ]
}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km"""
    R = 6371  # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def apply_safety_factor(base_cost: float, safety_score: float) -> float:
    """
    Apply safety factor to edge cost
    Formula: c' = c × (1 + (10-S)/20)
    As per paper Section III.C
    """
    safety_factor = 1 + (10 - safety_score) / 20
    return base_cost * safety_factor

def find_nearest_node(lat: float, lon: float) -> Dict:
    """Find nearest transit node"""
    min_dist = float('inf')
    nearest = None
    
    for node in CHENNAI_NETWORK["nodes"]:
        dist = haversine_distance(lat, lon, node["lat"], node["lon"])
        if dist < min_dist:
            min_dist = dist
            nearest = node
    
    return nearest

def safety_enhanced_dijkstra(
    start_id: int,
    end_id: int,
    time_weight: float,
    fare_weight: float,
    safety_weight: float,
    db: Session
):
    """
    Safety-Enhanced SSSP Algorithm
    Implements Algorithm 2 from paper
    """
    # Initialize
    nodes = {node["id"]: node for node in CHENNAI_NETWORK["nodes"]}
    distances = {node_id: float('inf') for node_id in nodes}
    distances[start_id] = 0
    parent = {node_id: None for node_id in nodes}
    
    # Priority queue: (distance, node_id)
    pq = [(0, start_id)]
    visited = set()
    
    while pq:
        current_dist, u = heapq.heappop(pq)
        
        if u in visited:
            continue
        
        visited.add(u)
        
        if u == end_id:
            break
        
        # Process neighbors
        for edge in CHENNAI_NETWORK["edges"]:
            if edge["from"] != u:
                continue
            
            v = edge["to"]
            if v in visited:
                continue
            
            # Calculate base cost
            base_cost = (
                time_weight * edge["time"] +
                fare_weight * edge["fare"]
            )
            
            # Get safety score for destination node
            node_v = nodes[v]
            incident_score = calculate_incident_score(db, node_v["lat"], node_v["lon"])
            feedback_score = calculate_feedback_score(db, node_v["lat"], node_v["lon"])
            safety_score = (incident_score + feedback_score) / 2
            
            # Apply safety factor
            adjusted_cost = apply_safety_factor(base_cost, safety_score)
            
            # Add safety weight preference
            total_cost = adjusted_cost - (safety_weight * safety_score)
            
            # Relaxation
            if distances[u] + total_cost < distances[v]:
                distances[v] = distances[u] + total_cost
                parent[v] = u
                heapq.heappush(pq, (distances[v], v))
    
    # Reconstruct path
    path = []
    current = end_id
    while current is not None:
        path.append(current)
        current = parent[current]
    path.reverse()
    
    return path, distances[end_id]

@router.post("/plan", response_model=RouteResponse)
def plan_route(request: RouteRequest, db: Session = Depends(get_db)):
    """
    Plan optimal route with safety consideration
    Implements safety-enhanced SSSP as per paper
    """
    # Find nearest nodes
    start_node = find_nearest_node(request.start_lat, request.start_lon)
    end_node = find_nearest_node(request.end_lat, request.end_lon)
    
    print(f"🗺️  Route planning: {start_node['name']} → {end_node['name']}")
    
    # Run safety-enhanced Dijkstra
    path_ids, total_cost = safety_enhanced_dijkstra(
        start_node["id"],
        end_node["id"],
        request.time_weight,
        request.fare_weight,
        request.safety_weight,
        db
    )
    
    # Build response
    nodes = {node["id"]: node for node in CHENNAI_NETWORK["nodes"]}
    path = []
    total_distance = 0
    total_time = 0
    total_fare = 0
    safety_scores = []
    
    for i, node_id in enumerate(path_ids):
        node = nodes[node_id]
        
        # Calculate safety score
        incident_score = calculate_incident_score(db, node["lat"], node["lon"])
        feedback_score = calculate_feedback_score(db, node["lat"], node["lon"])
        safety_score = (incident_score + feedback_score) / 2
        safety_scores.append(safety_score)
        
        path.append({
            "name": node["name"],
            "latitude": node["lat"],
            "longitude": node["lon"],
            "safety_score": round(safety_score, 2)
        })
        
        # Accumulate costs from edges
        if i < len(path_ids) - 1:
            next_id = path_ids[i + 1]
            edge = next((e for e in CHENNAI_NETWORK["edges"] 
                        if e["from"] == node_id and e["to"] == next_id), None)
            if edge:
                total_distance += edge["distance"]
                total_time += edge["time"]
                total_fare += edge["fare"]
    
    avg_safety = sum(safety_scores) / len(safety_scores) if safety_scores else 5.0
    
    return RouteResponse(
        path=path,
        total_distance=round(total_distance, 2),
        total_time=total_time,
        total_fare=total_fare,
        average_safety_score=round(avg_safety, 2),
        waypoints=len(path)
    )

@router.post("/compare")
def compare_routes(request: RouteRequest, db: Session = Depends(get_db)):
    """
    Compare safety-aware route vs traditional shortest path
    Demonstrates algorithm improvement from paper
    """
    # Find nodes
    start_node = find_nearest_node(request.start_lat, request.start_lon)
    end_node = find_nearest_node(request.end_lat, request.end_lon)
    
    # Traditional route (no safety consideration)
    traditional_path, traditional_cost = safety_enhanced_dijkstra(
        start_node["id"], end_node["id"], 0.6, 0.4, 0.0, db
    )
    
    # Safety-aware route
    safety_path, safety_cost = safety_enhanced_dijkstra(
        start_node["id"], end_node["id"], 
        request.time_weight, request.fare_weight, request.safety_weight, db
    )
    
    # Calculate safety scores
    nodes = {node["id"]: node for node in CHENNAI_NETWORK["nodes"]}
    
    def calc_avg_safety(path_ids):
        scores = []
        for node_id in path_ids:
            node = nodes[node_id]
            inc = calculate_incident_score(db, node["lat"], node["lon"])
            fb = calculate_feedback_score(db, node["lat"], node["lon"])
            scores.append((inc + fb) / 2)
        return sum(scores) / len(scores) if scores else 5.0
    
    traditional_safety = calc_avg_safety(traditional_path)
    safety_aware_safety = calc_avg_safety(safety_path)
    
    improvement = ((safety_aware_safety - traditional_safety) / traditional_safety) * 100
    
    return {
        "traditional_route": {
            "waypoints": len(traditional_path),
            "avg_safety_score": round(traditional_safety, 2),
            "cost": round(traditional_cost, 2)
        },
        "safety_aware_route": {
            "waypoints": len(safety_path),
            "avg_safety_score": round(safety_aware_safety, 2),
            "cost": round(safety_cost, 2)
        },
        "improvement": {
            "safety_increase_percent": round(improvement, 1),
            "description": "Safety-aware routing improvement as per paper Section VIII"
        }
    }


@router.post("/google-transit", response_model=GoogleTransitRouteResponse)
async def get_google_transit_route(request: GoogleTransitRouteRequest):
    """
    Get Google transit route enrichment (bus/metro line details, ETA and fare).

    This endpoint is optional and only works when GOOGLE_MAPS_API_KEY is configured.
    """
    if not settings.GOOGLE_MAPS_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Google transit integration is not configured on the server"
        )

    params = {
        "origin": f"{request.start_lat},{request.start_lon}",
        "destination": f"{request.end_lat},{request.end_lon}",
        "mode": "transit",
        "alternatives": "true",
        "departure_time": request.departure_time or "now",
        "key": settings.GOOGLE_MAPS_API_KEY,
    }

    timeout = aiohttp.ClientTimeout(total=settings.GOOGLE_MAPS_TIMEOUT_SECONDS)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        try:
            async with session.get(settings.GOOGLE_DIRECTIONS_URL, params=params) as response:
                if response.status != 200:
                    body = await response.text()
                    raise HTTPException(
                        status_code=502,
                        detail=f"Google Directions API error: HTTP {response.status}: {body[:300]}"
                    )
                payload = await response.json()
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Google Directions request failed: {str(exc)}")

    api_status = payload.get("status")
    if api_status != "OK":
        if api_status == "ZERO_RESULTS":
            raise HTTPException(status_code=404, detail="No transit route found for this origin and destination")
        raise HTTPException(status_code=502, detail=f"Google Directions API status: {api_status}")

    route = payload["routes"][0]
    leg = route["legs"][0] if route.get("legs") else {}

    fare_info = route.get("fare") or leg.get("fare") or {}

    parsed_steps: List[GoogleTransitStep] = []
    for step in leg.get("steps", []):
        transit_details = step.get("transit_details", {})
        line = transit_details.get("line", {})
        vehicle = line.get("vehicle", {})

        parsed_steps.append(
            GoogleTransitStep(
                travel_mode=step.get("travel_mode", "UNKNOWN"),
                line_name=line.get("name"),
                line_short_name=line.get("short_name"),
                vehicle_type=vehicle.get("type"),
                headsign=transit_details.get("headsign"),
                departure_stop=(transit_details.get("departure_stop") or {}).get("name"),
                arrival_stop=(transit_details.get("arrival_stop") or {}).get("name"),
                duration_text=(step.get("duration") or {}).get("text"),
                distance_text=(step.get("distance") or {}).get("text"),
                num_stops=transit_details.get("num_stops"),
            )
        )

    return GoogleTransitRouteResponse(
        provider="google-directions",
        summary=route.get("summary"),
        distance_text=(leg.get("distance") or {}).get("text"),
        duration_text=(leg.get("duration") or {}).get("text"),
        departure_time_text=(leg.get("departure_time") or {}).get("text"),
        arrival_time_text=(leg.get("arrival_time") or {}).get("text"),
        fare_text=fare_info.get("text"),
        fare_value=float(fare_info["value"]) if fare_info.get("value") is not None else None,
        fare_currency=fare_info.get("currency"),
        warnings=route.get("warnings", []),
        steps=parsed_steps,
    )


@router.post("/open-route", response_model=OpenRouteResponse)
def get_open_route(request: OpenRouteRequest):
    """
    Open-source routing fallback using OSRM public API.

    Useful for demos and as a non-Google baseline. Does not include fare.
    """
    coords = f"{request.start_lon},{request.start_lat};{request.end_lon},{request.end_lat}"
    query = urllib.parse.urlencode({
        "overview": "full",
        "geometries": "geojson",
        "alternatives": "false",
        "steps": "false",
    })
    url = f"{settings.OSRM_ROUTE_URL.rstrip('/')}/{coords}?{query}"

    try:
        with urllib.request.urlopen(url, timeout=settings.OPENMAP_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Open-route provider request failed: {str(exc)}")

    routes = payload.get("routes", [])
    if not routes:
        raise HTTPException(status_code=404, detail="No open route found for this origin and destination")

    route = routes[0]
    geometry = route.get("geometry", {}).get("coordinates", [])

    mapped_geometry = [
        {"lat": point[1], "lon": point[0]}
        for point in geometry
        if isinstance(point, list) and len(point) >= 2
    ]

    return OpenRouteResponse(
        provider="osrm",
        distance_km=round(float(route.get("distance", 0)) / 1000, 3),
        duration_min=round(float(route.get("duration", 0)) / 60, 2),
        geometry=mapped_geometry,
    )


@router.get("/open-geocode", response_model=OpenGeocodeResponse)
def open_geocode(query: str):
    """
    Geocode using Nominatim (OpenStreetMap ecosystem).
    """
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query is required")

    params = urllib.parse.urlencode({
        "q": query,
        "format": "jsonv2",
        "limit": 5,
    })
    request_url = f"{settings.NOMINATIM_SEARCH_URL}?{params}"
    req = urllib.request.Request(
        request_url,
        headers={"User-Agent": settings.OPENMAP_USER_AGENT},
    )

    try:
        with urllib.request.urlopen(req, timeout=settings.OPENMAP_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read().decode("utf-8"))

        results = [
            OpenGeocodeResult(
                display_name=item.get("display_name", ""),
                lat=float(item.get("lat", 0.0)),
                lon=float(item.get("lon", 0.0)),
            )
            for item in payload
        ]

        return OpenGeocodeResponse(
            provider="nominatim",
            query=query,
            results=results,
        )
    except Exception:
        # Fallback provider for environments where Nominatim is blocked/rate-limited.
        photon_params = urllib.parse.urlencode({
            "q": query,
            "limit": 5,
        })
        photon_url = f"{settings.PHOTON_SEARCH_URL}?{photon_params}"
        photon_req = urllib.request.Request(
            photon_url,
            headers={"User-Agent": settings.OPENMAP_USER_AGENT},
        )

        try:
            with urllib.request.urlopen(photon_req, timeout=settings.OPENMAP_TIMEOUT_SECONDS) as response:
                photon_payload = json.loads(response.read().decode("utf-8"))
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Open-geocode provider request failed: {str(exc)}")

        features = photon_payload.get("features", [])
        results = []
        for feature in features:
            props = feature.get("properties", {})
            coords = (feature.get("geometry") or {}).get("coordinates", [0, 0])
            if len(coords) < 2:
                continue
            name = props.get("name") or props.get("street") or "Unknown"
            city = props.get("city") or props.get("state") or props.get("country") or ""
            display = f"{name}, {city}".strip(", ")
            results.append(
                OpenGeocodeResult(
                    display_name=display,
                    lat=float(coords[1]),
                    lon=float(coords[0]),
                )
            )

        return OpenGeocodeResponse(
            provider="photon",
            query=query,
            results=results,
        )
