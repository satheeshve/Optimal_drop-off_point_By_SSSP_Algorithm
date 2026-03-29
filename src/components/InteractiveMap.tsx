import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Stop, RouteOption } from '../data/transportData';
import { motion } from 'framer-motion';
import { GTFSLiveVehicle } from '../utils/apiService';

// Fix for default markers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Custom icons for different transport types - Using URL encoding for Unicode emojis
const busIcon = new Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
      <rect fill="#3b82f6" width="24" height="24" rx="4"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="16">🚌</text>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const metroIcon = new Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
      <rect fill="#10b981" width="24" height="24" rx="4"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="16">🚇</text>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const trainIcon = new Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
      <rect fill="#f59e0b" width="24" height="24" rx="4"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="16">🚆</text>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const optimalIcon = new Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
      <circle fill="#22c55e" cx="12" cy="12" r="12"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="18" fill="white">⭐</text>
    </svg>
  `),
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50]
});

interface InteractiveMapProps {
  stops: Stop[];
  route?: RouteOption;
  optimalDropPoint?: Stop;
  externalPolyline?: LatLngExpression[];
  liveVehicles?: GTFSLiveVehicle[];
  mapStyle?: 'dark' | 'satellite';
  className?: string;
}

// Component to fit bounds
const FitBounds = ({ stops }: { stops: Stop[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (stops.length > 0) {
      const bounds: [[number, number], [number, number]] = [
        [stops[0].lat, stops[0].lng],
        [stops[0].lat, stops[0].lng]
      ];
      
      stops.forEach(s => {
        bounds[0][0] = Math.min(bounds[0][0], s.lat);
        bounds[0][1] = Math.min(bounds[0][1], s.lng);
        bounds[1][0] = Math.max(bounds[1][0], s.lat);
        bounds[1][1] = Math.max(bounds[1][1], s.lng);
      });
      
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stops, map]);
  
  return null;
};

// Animated vehicle marker
const AnimatedVehicle = ({ position, type }: { position: LatLngExpression; type: 'bus' | 'metro' | 'train' }) => {
  const getIcon = () => {
    switch (type) {
      case 'bus': return busIcon;
      case 'metro': return metroIcon;
      case 'train': return trainIcon;
    }
  };

  return (
    <Marker position={position} icon={getIcon()}>
      <Popup>
        <div className="text-center">
          <div className="text-2xl mb-2">
            {type === 'bus' && '🚌'}
            {type === 'metro' && '🚇'}
            {type === 'train' && '🚆'}
          </div>
          <p className="font-bold capitalize">{type} Live</p>
          <p className="text-xs text-muted-foreground">Arriving in 5 mins</p>
        </div>
      </Popup>
    </Marker>
  );
};

export const InteractiveMap = ({
  stops,
  route,
  optimalDropPoint,
  externalPolyline,
  liveVehicles = [],
  mapStyle = 'dark',
  className = '',
}: InteractiveMapProps) => {
  const center: LatLngExpression = stops.length > 0 
    ? [stops[0].lat, stops[0].lng] 
    : [13.0827, 80.2707]; // Chennai Central default

  const getStopIcon = (stop: Stop) => {
    if (optimalDropPoint && stop.id === optimalDropPoint.id) {
      return optimalIcon;
    }
    switch (stop.type) {
      case 'bus': return busIcon;
      case 'metro': return metroIcon;
      case 'train': return trainIcon;
      default: return DefaultIcon;
    }
  };

  const tileConfig = mapStyle === 'satellite'
    ? {
        attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      }
    : {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      };

  const getLiveVehicleIcon = (mode: string) => {
    if (mode === 'train') return trainIcon;
    if (mode === 'metro' || mode === 'subway') return metroIcon;
    return busIcon;
  };

  // Create polyline from route segments
  const routeLines: LatLngExpression[][] = [];
  const routeColors: string[] = [];
  
  if (route) {
    route.segments.forEach((segment, idx) => {
      const line: LatLngExpression[] = [
        [segment.from.lat, segment.from.lng],
        [segment.to.lat, segment.to.lng]
      ];
      routeLines.push(line);
      
      // Color based on mode
      if (segment.mode === 'bus') routeColors.push('#3b82f6');
      else if (segment.mode === 'metro') routeColors.push('#10b981');
      else if (segment.mode === 'train') routeColors.push('#f59e0b');
      else routeColors.push('#6b7280');
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`rounded-lg overflow-hidden border-2 border-primary/20 shadow-2xl ${className}`}
      style={{ height: '500px', width: '100%' }}
    >
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution={tileConfig.attribution}
          url={tileConfig.url}
        />

        {mapStyle === 'satellite' && (
          <TileLayer
            attribution='&copy; Esri labels'
            url='https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
          />
        )}
        
        <FitBounds stops={stops} />
        
        {/* Draw route polylines with animation */}
        {routeLines.map((line, idx) => (
          <Polyline
            key={idx}
            positions={line}
            pathOptions={{
              color: routeColors[idx],
              weight: 6,
              opacity: 0.8,
              dashArray: '10, 10',
              className: 'animate-pulse'
            }}
          />
        ))}

        {externalPolyline && externalPolyline.length > 1 && (
          <Polyline
            positions={externalPolyline}
            pathOptions={{
              color: '#ef4444',
              weight: 4,
              opacity: 0.85,
            }}
          />
        )}
        
        {/* Stop markers */}
        {stops.map((stop, idx) => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={getStopIcon(stop)}
          >
            <Popup>
              <div className="text-center">
                <div className="text-2xl mb-2">
                  {stop.type === 'bus' && '🚌'}
                  {stop.type === 'metro' && '🚇'}
                  {stop.type === 'train' && '🚆'}
                </div>
                <p className="font-bold">{stop.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{stop.type} Stop</p>
                {optimalDropPoint && stop.id === optimalDropPoint.id && (
                  <p className="text-xs font-bold text-green-600 mt-1">⭐ Best Drop Point</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* GTFS real-time vehicle markers */}
        {liveVehicles.map((vehicle, index) => (
          <Marker
            key={`${vehicle.entity_id || vehicle.vehicle_id || 'vehicle'}-${index}`}
            position={[vehicle.lat, vehicle.lon]}
            icon={getLiveVehicleIcon(vehicle.mode)}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold">{vehicle.route_short_name || 'Transit Vehicle'}</p>
                <p className="text-xs text-muted-foreground">{vehicle.vehicle_label || vehicle.trip_id || 'Live position'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {vehicle.mode.toUpperCase()} {vehicle.speed ? `• ${Math.round(vehicle.speed * 3.6)} km/h` : ''}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Simulated marker fallback when GTFS feed is unavailable */}
        {liveVehicles.length === 0 && stops.length > 1 && (
          <AnimatedVehicle 
            position={[stops[Math.floor(stops.length / 2)].lat, stops[Math.floor(stops.length / 2)].lng]}
            type={stops[0].type}
          />
        )}
      </MapContainer>
    </motion.div>
  );
};
