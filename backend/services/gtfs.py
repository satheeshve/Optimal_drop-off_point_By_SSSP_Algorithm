"""GTFS and GTFS-RT ingestion helpers."""

from __future__ import annotations

import csv
import io
import time
import zipfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import aiohttp
from google.transit import gtfs_realtime_pb2

from config import settings


ROUTE_TYPE_TO_MODE = {
    0: "tram",
    1: "metro",
    2: "train",
    3: "bus",
    4: "ferry",
    5: "cable_tram",
    6: "gondola",
    7: "funicular",
    11: "trolleybus",
    12: "monorail",
}


@dataclass
class GTFSStaticCache:
    routes: Dict[str, Dict[str, str]] = field(default_factory=dict)
    trips: Dict[str, Dict[str, str]] = field(default_factory=dict)
    shapes: Dict[str, List[Tuple[float, float, int]]] = field(default_factory=dict)
    route_to_trips: Dict[str, List[str]] = field(default_factory=dict)
    loaded_at: Optional[float] = None


_cache = GTFSStaticCache()


def _request_headers() -> Dict[str, str]:
    headers = {
        "User-Agent": settings.OPENMAP_USER_AGENT,
    }
    if settings.GTFS_RT_API_KEY:
        headers[settings.GTFS_RT_API_KEY_HEADER] = settings.GTFS_RT_API_KEY
    return headers


async def _read_static_zip_bytes() -> bytes:
    if settings.GTFS_STATIC_URL:
        timeout = aiohttp.ClientTimeout(total=settings.GTFS_TIMEOUT_SECONDS)
        async with aiohttp.ClientSession(timeout=timeout, headers=_request_headers()) as session:
            async with session.get(settings.GTFS_STATIC_URL) as response:
                response.raise_for_status()
                return await response.read()

    if settings.GTFS_STATIC_PATH:
        static_path = Path(settings.GTFS_STATIC_PATH)
        if not static_path.exists():
            raise FileNotFoundError(f"GTFS static path does not exist: {static_path}")
        return static_path.read_bytes()

    raise RuntimeError("GTFS static source is not configured. Set GTFS_STATIC_URL or GTFS_STATIC_PATH.")


def _load_csv_from_zip(zip_bytes: bytes, file_name: str) -> List[Dict[str, str]]:
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        with zf.open(file_name) as file_obj:
            text = io.TextIOWrapper(file_obj, encoding="utf-8-sig")
            reader = csv.DictReader(text)
            return [row for row in reader]


async def ensure_static_loaded(force: bool = False) -> GTFSStaticCache:
    now = time.time()
    should_reload = force or _cache.loaded_at is None

    if _cache.loaded_at is not None and settings.GTFS_STATIC_CACHE_TTL_SECONDS > 0:
        if now - _cache.loaded_at > settings.GTFS_STATIC_CACHE_TTL_SECONDS:
            should_reload = True

    if not should_reload:
        return _cache

    zip_bytes = await _read_static_zip_bytes()

    routes_rows = _load_csv_from_zip(zip_bytes, "routes.txt")
    trips_rows = _load_csv_from_zip(zip_bytes, "trips.txt")

    shapes_rows: List[Dict[str, str]] = []
    try:
        shapes_rows = _load_csv_from_zip(zip_bytes, "shapes.txt")
    except KeyError:
        shapes_rows = []

    routes: Dict[str, Dict[str, str]] = {}
    for row in routes_rows:
        route_id = row.get("route_id", "").strip()
        if not route_id:
            continue
        route_type_raw = row.get("route_type", "3").strip() or "3"
        route_type_int = int(route_type_raw) if route_type_raw.isdigit() else 3
        routes[route_id] = {
            "route_short_name": row.get("route_short_name", "").strip(),
            "route_long_name": row.get("route_long_name", "").strip(),
            "route_type": str(route_type_int),
            "mode": ROUTE_TYPE_TO_MODE.get(route_type_int, "bus"),
        }

    trips: Dict[str, Dict[str, str]] = {}
    route_to_trips: Dict[str, List[str]] = {}
    for row in trips_rows:
        trip_id = row.get("trip_id", "").strip()
        route_id = row.get("route_id", "").strip()
        if not trip_id or not route_id:
            continue
        trips[trip_id] = {
            "route_id": route_id,
            "shape_id": row.get("shape_id", "").strip(),
            "trip_headsign": row.get("trip_headsign", "").strip(),
        }
        route_to_trips.setdefault(route_id, []).append(trip_id)

    shapes: Dict[str, List[Tuple[float, float, int]]] = {}
    for row in shapes_rows:
        shape_id = row.get("shape_id", "").strip()
        if not shape_id:
            continue
        try:
            lat = float(row.get("shape_pt_lat", "0"))
            lon = float(row.get("shape_pt_lon", "0"))
            seq = int(row.get("shape_pt_sequence", "0"))
        except ValueError:
            continue
        shapes.setdefault(shape_id, []).append((lat, lon, seq))

    for shape_id in list(shapes.keys()):
        shapes[shape_id].sort(key=lambda point: point[2])

    _cache.routes = routes
    _cache.trips = trips
    _cache.shapes = shapes
    _cache.route_to_trips = route_to_trips
    _cache.loaded_at = now
    return _cache


async def fetch_vehicle_positions(route_short_name: Optional[str] = None, limit: int = 250) -> List[Dict[str, object]]:
    if not settings.GTFS_RT_VEHICLE_POSITIONS_URL:
        raise RuntimeError("GTFS-RT vehicle feed is not configured. Set GTFS_RT_VEHICLE_POSITIONS_URL.")

    cache = await ensure_static_loaded(force=False)

    timeout = aiohttp.ClientTimeout(total=settings.GTFS_TIMEOUT_SECONDS)
    async with aiohttp.ClientSession(timeout=timeout, headers=_request_headers()) as session:
        async with session.get(settings.GTFS_RT_VEHICLE_POSITIONS_URL) as response:
            response.raise_for_status()
            payload = await response.read()

    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(payload)

    normalized_route = route_short_name.strip().lower() if route_short_name else None
    vehicles: List[Dict[str, object]] = []

    for entity in feed.entity:
        if not entity.HasField("vehicle"):
            continue

        vehicle = entity.vehicle
        if not vehicle.HasField("position"):
            continue

        trip_id = vehicle.trip.trip_id if vehicle.HasField("trip") else ""
        route_id = vehicle.trip.route_id if vehicle.HasField("trip") else ""

        if not route_id and trip_id in cache.trips:
            route_id = cache.trips[trip_id].get("route_id", "")

        route_meta = cache.routes.get(route_id, {}) if route_id else {}
        route_short = route_meta.get("route_short_name", "")

        if normalized_route:
            candidate = route_short.lower().strip()
            if not candidate or candidate != normalized_route:
                continue

        position = vehicle.position
        if position.latitude == 0 and position.longitude == 0:
            continue

        vehicle_id = ""
        vehicle_label = ""
        if vehicle.HasField("vehicle"):
            vehicle_id = vehicle.vehicle.id or ""
            vehicle_label = vehicle.vehicle.label or ""

        vehicles.append(
            {
                "entity_id": entity.id,
                "vehicle_id": vehicle_id,
                "vehicle_label": vehicle_label,
                "trip_id": trip_id,
                "route_id": route_id,
                "route_short_name": route_short,
                "route_long_name": route_meta.get("route_long_name", ""),
                "mode": route_meta.get("mode", "bus"),
                "lat": round(float(position.latitude), 6),
                "lon": round(float(position.longitude), 6),
                "bearing": float(position.bearing) if position.bearing else None,
                "speed": float(position.speed) if position.speed else None,
                "timestamp": int(vehicle.timestamp) if vehicle.timestamp else None,
                "occupancy_status": int(vehicle.occupancy_status) if vehicle.occupancy_status else None,
            }
        )

        if len(vehicles) >= limit:
            break

    return vehicles


def build_route_shape(cache: GTFSStaticCache, route_short_name: str) -> List[Dict[str, float]]:
    if not route_short_name:
        return []

    normalized = route_short_name.strip().lower()
    matched_route_ids = [
        route_id
        for route_id, route_meta in cache.routes.items()
        if route_meta.get("route_short_name", "").strip().lower() == normalized
    ]

    for route_id in matched_route_ids:
        trip_ids = cache.route_to_trips.get(route_id, [])
        for trip_id in trip_ids:
            shape_id = cache.trips.get(trip_id, {}).get("shape_id", "")
            if not shape_id:
                continue
            shape_points = cache.shapes.get(shape_id, [])
            if shape_points:
                return [{"lat": lat, "lon": lon} for lat, lon, _ in shape_points]

    return []
