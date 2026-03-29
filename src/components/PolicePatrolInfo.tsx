import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Phone, MapPin, Clock, User, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface PolicePatrol {
  id: number;
  station_name: string;
  station_code: string;
  latitude: number;
  longitude: number;
  patrol_route_name: string;
  patrol_area_description: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  officer_in_charge: string;
  contact_number: string;
  emergency_contact: string;
  coverage_radius_km: number;
  status: string;
}

interface PolicePatrolInfoProps {
  sourceLocation?: { lat: number; lng: number };
  destinationLocation?: { lat: number; lng: number };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function PolicePatrolInfo({ sourceLocation, destinationLocation }: PolicePatrolInfoProps) {
  const [patrols, setPatrols] = useState<PolicePatrol[]>([]);
  const [loading, setLoading] = useState(true);
  const [policeScore, setPoliceScore] = useState<number>(0);

  useEffect(() => {
    if (sourceLocation || destinationLocation) {
      fetchNearbyPatrols();
    }
  }, [sourceLocation, destinationLocation]);

  useEffect(() => {
    if (!sourceLocation && !destinationLocation) {
      return;
    }

    const timer = window.setInterval(() => {
      void fetchNearbyPatrols();
    }, 20000);

    return () => window.clearInterval(timer);
  }, [sourceLocation, destinationLocation]);

  const fetchNearbyPatrols = async () => {
    try {
      setLoading(true);
      const location = destinationLocation || sourceLocation;
      if (!location) return;

      // Fetch active patrols near the route
      const response = await fetch(`${API_BASE_URL}/police/patrols/active?latitude=${location.lat}&longitude=${location.lng}&radius_km=5`);

      if (response.ok) {
        const data = await response.json();
        setPatrols(data);

        // Fetch police coverage score
        const scoreResponse = await fetch(`${API_BASE_URL}/police/patrols/coverage-score?latitude=${location.lat}&longitude=${location.lng}`);
        if (scoreResponse.ok) {
          const scoreData = await scoreResponse.json();
          setPoliceScore(scoreData.score);
        }
      }
    } catch (error) {
      console.error('Error fetching patrols:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const getShiftColor = (shift: string) => {
    const colors: Record<string, string> = {
      morning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      afternoon: 'bg-orange-100 text-orange-800 border-orange-300',
      evening: 'bg-purple-100 text-purple-800 border-purple-300',
      night: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[shift] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600 bg-green-50 border-green-300';
    if (score >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
    return 'text-red-600 bg-red-50 border-red-300';
  };

  if (loading) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Shield className="w-5 h-5" />
            Loading Police Patrol Information...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (patrols.length === 0) {
    return (
      <Card className="border-gray-200 bg-gray-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Shield className="w-5 h-5" />
            Police Patrol Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            No active police patrols found within 5km of your route.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            For emergencies, dial 100 (Police) or 112 (Emergency Services)
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Safety Score Card */}
      <Card className={`border-2 ${getScoreColor(policeScore)}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Route Safety Assessment
            </div>
            <Badge variant="outline" className="text-lg font-bold">
              {policeScore.toFixed(1)}/10
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-semibold mb-2">Police Coverage Score</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full transition-all ${
                  policeScore >= 7 ? 'bg-green-600' : 
                  policeScore >= 4 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${(policeScore / 10) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm">
              {policeScore >= 7 && '✅ Excellent police coverage - This is a safe route with high police presence'}
              {policeScore >= 4 && policeScore < 7 && '⚠️ Moderate police coverage - Stay aware of your surroundings'}
              {policeScore < 4 && '⚠️ Limited police coverage - Exercise caution and travel during daylight if possible'}
            </p>
            
            {/* Crime Risk Assessment */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">🛡️ Safety Tips for Your Route:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {policeScore >= 7 ? (
                  <>
                    <li>• {patrols.length} active patrol{patrols.length > 1 ? 's' : ''} monitoring this area</li>
                    <li>• High police visibility - low crime risk zone</li>
                    <li>• Safe to travel at any time of day</li>
                  </>
                ) : policeScore >= 4 ? (
                  <>
                    <li>• {patrols.length} patrol{patrols.length > 1 ? 's' : ''} active in this area</li>
                    <li>• Moderate risk - stay in well-lit areas</li>
                    <li>• Prefer traveling with companions when possible</li>
                    <li>• Keep emergency contacts handy</li>
                  </>
                ) : (
                  <>
                    <li>• Limited active patrols in this area</li>
                    <li>• Higher crime risk - exercise extra caution</li>
                    <li>• Travel during daylight hours if possible</li>
                    <li>• Stay in crowded, well-lit public areas</li>
                    <li>• Share your location with family/friends</li>
                    <li>• Keep emergency number 100 on speed dial</li>
                  </>
                )}
              </ul>
            </div>

            {/* Crime Statistics Estimate */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-900 mb-2">📊 Area Risk Assessment:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-blue-700">Crime Risk Level:</p>
                  <p className="font-bold text-blue-900">
                    {policeScore >= 7 ? 'LOW' : policeScore >= 4 ? 'MODERATE' : 'ELEVATED'}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Police Response:</p>
                  <p className="font-bold text-blue-900">
                    {policeScore >= 7 ? 'RAPID' : policeScore >= 4 ? 'STANDARD' : 'STANDARD'}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Patrol Frequency:</p>
                  <p className="font-bold text-blue-900">
                    {policeScore >= 7 ? 'HIGH' : policeScore >= 4 ? 'MODERATE' : 'LOW'}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Safety Rating:</p>
                  <p className="font-bold text-blue-900">
                    {policeScore >= 7 ? '⭐⭐⭐⭐⭐' : policeScore >= 4 ? '⭐⭐⭐⭐' : '⭐⭐⭐'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Patrols Header */}
      <Card className="border-indigo-200 bg-indigo-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <Shield className="w-5 h-5" />
            Active Police Patrols Near Your Route
            <Badge className="bg-indigo-600 text-white ml-auto">
              {patrols.length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-indigo-700">
            🚔 Police patrols are currently active in your route area. Contact details below:
          </p>

          {/* Patrol Cards */}
          {patrols.map((patrol, index) => (
            <motion.div
              key={patrol.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl p-4 border-2 border-indigo-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      {patrol.station_name}
                      <Badge className={getShiftColor(patrol.shift_type)}>
                        {patrol.shift_type.charAt(0).toUpperCase() + patrol.shift_type.slice(1)} Shift
                      </Badge>
                    </h3>
                    <p className="text-sm text-gray-600">{patrol.station_code}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    ● ACTIVE
                  </Badge>
                </div>

                {/* Patrol Route */}
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-indigo-900 mb-1">
                    📍 Patrol Route: {patrol.patrol_route_name}
                  </p>
                  {patrol.patrol_area_description && (
                    <p className="text-xs text-indigo-700">{patrol.patrol_area_description}</p>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Duty Hours</p>
                      <p className="font-medium">{patrol.start_time} - {patrol.end_time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Officer</p>
                      <p className="font-medium">{patrol.officer_in_charge || 'On Duty'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Coverage</p>
                      <p className="font-medium">{patrol.coverage_radius_km} km radius</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium text-xs">
                        {patrol.latitude.toFixed(4)}, {patrol.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="flex gap-2 pt-2">
                  {patrol.contact_number && (
                    <Button
                      onClick={() => handleCall(patrol.contact_number)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Patrol: {patrol.contact_number}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleCall(patrol.emergency_contact || '100')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Emergency: {patrol.emergency_contact || '100'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Additional Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>ℹ️ Note:</strong> Police patrol information is updated by officers at the start of each shift. 
              For immediate emergencies, always call 100 (Police) or 112 (All Emergency Services).
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
