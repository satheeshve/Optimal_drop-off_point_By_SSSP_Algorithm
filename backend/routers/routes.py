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

from database import get_db
from routers.safety import calculate_incident_score, calculate_feedback_score

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
