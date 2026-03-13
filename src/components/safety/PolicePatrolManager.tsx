import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, MapPin, Clock, Phone, User, Car, Calendar, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';

interface PolicePatrol {
  id: number;
  station_name: string;
  station_code: string;
  latitude: number;
  longitude: number;
  patrol_route_name: string;
  patrol_area_description: string;
  shift_date: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  officer_in_charge: string;
  officer_badge_number: string;
  patrol_vehicle_number: string;
  contact_number: string;
  emergency_contact: string;
  coverage_radius_km: number;
  is_active: boolean;
  status: string;
  verified_by_admin: boolean;
  created_at: string;
}

export function PolicePatrolManager() {
  const [patrols, setPatrols] = useState<PolicePatrol[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [formData, setFormData] = useState({
    station_name: '',
    station_code: '',
    latitude: '',
    longitude: '',
    patrol_route_name: '',
    patrol_area_description: '',
    shift_date: new Date().toISOString().split('T')[0],
    shift_type: 'morning',
    start_time: '06:00',
    end_time: '14:00',
    officer_in_charge: '',
    officer_badge_number: '',
    patrol_vehicle_number: '',
    contact_number: '',
    emergency_contact: '100',
    coverage_radius_km: 2.0,
    created_by: 'admin' // In real app, get from auth context
  });

  const shiftTimes = {
    morning: { start: '06:00', end: '14:00' },
    afternoon: { start: '14:00', end: '22:00' },
    evening: { start: '18:00', end: '02:00' },
    night: { start: '22:00', end: '06:00' }
  };

  useEffect(() => {
    fetchTodaysPatrols();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error('Location error:', error)
      );
    }
  };

  const fetchTodaysPatrols = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/police/patrols/today');
      if (response.ok) {
        const data = await response.json();
        setPatrols(data);
      }
    } catch (error) {
      console.error('Error fetching patrols:', error);
    }
  };

  const handleShiftTypeChange = (shiftType: string) => {
    setFormData({
      ...formData,
      shift_type: shiftType,
      start_time: shiftTimes[shiftType as keyof typeof shiftTimes].start,
      end_time: shiftTimes[shiftType as keyof typeof shiftTimes].end
    });
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setFormData({
        ...formData,
        latitude: currentLocation.lat.toString(),
        longitude: currentLocation.lng.toString()
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.station_name.trim()) {
      alert('Please enter station name');
      return;
    }
    if (!formData.station_code.trim()) {
      alert('Please enter station code');
      return;
    }
    if (!formData.patrol_route_name.trim()) {
      alert('Please enter patrol route name');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      alert('Please enter GPS coordinates or use current location');
      return;
    }
    
    setLoading(true);

    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        coverage_radius_km: parseFloat(formData.coverage_radius_km.toString()),
        station_name: formData.station_name.trim(),
        station_code: formData.station_code.trim(),
        patrol_route_name: formData.patrol_route_name.trim(),
        patrol_area_description: formData.patrol_area_description.trim(),
        officer_in_charge: formData.officer_in_charge.trim(),
        officer_badge_number: formData.officer_badge_number.trim(),
        patrol_vehicle_number: formData.patrol_vehicle_number.trim(),
        contact_number: formData.contact_number.trim(),
        emergency_contact: formData.emergency_contact.trim() || '100'
      };
      
      console.log('Sending patrol data:', payload);
      
      const response = await fetch('http://localhost:8000/api/police/patrols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('✅ Patrol route added successfully!');
        setShowForm(false);
        fetchTodaysPatrols();
        resetForm();
      } else {
        const error = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        console.error('Server error:', error);
        alert(`❌ Error adding patrol: ${error.detail || 'Please check all fields and try again'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`❌ Failed to add patrol route: ${error instanceof Error ? error.message : 'Network error. Please check if the backend server is running.'}`);
    } finally {
      setLoading(false);
    }
  };

  const updatePatrolStatus = async (patrolId: number, status: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/police/patrols/${patrolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, is_active: status === 'active' })
      });

      if (response.ok) {
        alert(`✅ Patrol status updated to ${status}`);
        fetchTodaysPatrols();
      } else {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        alert(`❌ Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error updating patrol:', error);
      alert('❌ Failed to update patrol status');
    }
  };

  const deletePatrol = async (patrolId: number) => {
    if (!confirm('Are you sure you want to delete this patrol route?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/police/patrols/${patrolId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('✅ Patrol route deleted successfully!');
        fetchTodaysPatrols();
      } else {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        alert(`❌ Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error deleting patrol:', error);
      alert('❌ Failed to delete patrol route');
    }
  };

  const resetForm = () => {
    setFormData({
      station_name: '',
      station_code: '',
      latitude: '',
      longitude: '',
      patrol_route_name: '',
      patrol_area_description: '',
      shift_date: new Date().toISOString().split('T')[0],
      shift_type: 'morning',
      start_time: '06:00',
      end_time: '14:00',
      officer_in_charge: '',
      officer_badge_number: '',
      patrol_vehicle_number: '',
      contact_number: '',
      emergency_contact: '100',
      coverage_radius_km: 2.0,
      created_by: 'admin'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: 'secondary',
      active: 'default',
      completed: 'outline',
      cancelled: 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  const getShiftBadge = (shift: string) => {
    const colors: Record<string, string> = {
      morning: 'bg-yellow-100 text-yellow-800',
      afternoon: 'bg-orange-100 text-orange-800',
      evening: 'bg-purple-100 text-purple-800',
      night: 'bg-blue-100 text-blue-800'
    };
    return (
      <Badge className={colors[shift] || ''}>
        {shift.charAt(0).toUpperCase() + shift.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Police Patrol Route Management
              </CardTitle>
              <CardDescription>
                Daily shift-based patrol route entry for enhanced public safety
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Patrol Route
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Add Patrol Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Add New Patrol Route</CardTitle>
              <CardDescription>
                Enter daily patrol shift details for safety routing system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Station Details */}
                  <div>
                    <Label htmlFor="station_name">Police Station Name *</Label>
                    <Input
                      id="station_name"
                      value={formData.station_name}
                      onChange={(e) => setFormData({ ...formData, station_name: e.target.value })}
                      placeholder="e.g., Central Police Station"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="station_code">Station Code *</Label>
                    <Input
                      id="station_code"
                      value={formData.station_code}
                      onChange={(e) => setFormData({ ...formData, station_code: e.target.value })}
                      placeholder="e.g., CPS-001"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <Label htmlFor="latitude">Latitude *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        placeholder="13.0827"
                        required
                      />
                      <Button type="button" onClick={handleUseCurrentLocation} size="sm">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="80.2707"
                      required
                    />
                  </div>

                  {/* Patrol Details */}
                  <div className="md:col-span-2">
                    <Label htmlFor="patrol_route_name">Patrol Route Name *</Label>
                    <Input
                      id="patrol_route_name"
                      value={formData.patrol_route_name}
                      onChange={(e) => setFormData({ ...formData, patrol_route_name: e.target.value })}
                      placeholder="e.g., Anna Nagar - T Nagar Route"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="patrol_area_description">Area Description</Label>
                    <Textarea
                      id="patrol_area_description"
                      value={formData.patrol_area_description}
                      onChange={(e) => setFormData({ ...formData, patrol_area_description: e.target.value })}
                      placeholder="Describe the patrol coverage area..."
                      rows={3}
                    />
                  </div>

                  {/* Shift Details */}
                  <div>
                    <Label htmlFor="shift_date">Shift Date *</Label>
                    <Input
                      id="shift_date"
                      type="date"
                      value={formData.shift_date}
                      onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="shift_type">Shift Type *</Label>
                    <Select value={formData.shift_type} onValueChange={handleShiftTypeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (6 AM - 2 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (2 PM - 10 PM)</SelectItem>
                        <SelectItem value="evening">Evening (6 PM - 2 AM)</SelectItem>
                        <SelectItem value="night">Night (10 PM - 6 AM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="start_time">Start Time *</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_time">End Time *</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>

                  {/* Officer Details */}
                  <div>
                    <Label htmlFor="officer_in_charge">Officer In-Charge</Label>
                    <Input
                      id="officer_in_charge"
                      value={formData.officer_in_charge}
                      onChange={(e) => setFormData({ ...formData, officer_in_charge: e.target.value })}
                      placeholder="Officer name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="officer_badge_number">Badge Number</Label>
                    <Input
                      id="officer_badge_number"
                      value={formData.officer_badge_number}
                      onChange={(e) => setFormData({ ...formData, officer_badge_number: e.target.value })}
                      placeholder="Badge #"
                    />
                  </div>

                  <div>
                    <Label htmlFor="patrol_vehicle_number">Vehicle Number</Label>
                    <Input
                      id="patrol_vehicle_number"
                      value={formData.patrol_vehicle_number}
                      onChange={(e) => setFormData({ ...formData, patrol_vehicle_number: e.target.value })}
                      placeholder="TN-01-XX-1234"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input
                      id="contact_number"
                      type="tel"
                      value={formData.contact_number}
                      onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <Label htmlFor="coverage_radius_km">Coverage Radius (km)</Label>
                    <Input
                      id="coverage_radius_km"
                      type="number"
                      step="0.1"
                      value={formData.coverage_radius_km}
                      onChange={(e) => setFormData({ ...formData, coverage_radius_km: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Patrol Route'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Today's Patrols */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Patrol Schedule</CardTitle>
          <CardDescription>
            {patrols.length} patrol routes scheduled for {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patrols.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No patrols scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patrols.map((patrol) => (
                <motion.div
                  key={patrol.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{patrol.patrol_route_name}</h3>
                        {getStatusBadge(patrol.status)}
                        {getShiftBadge(patrol.shift_type)}
                      </div>
                      <p className="text-sm text-gray-600">{patrol.station_name} ({patrol.station_code})</p>
                    </div>
                    <div className="flex gap-2">
                      {patrol.status === 'scheduled' && (
                        <Button
                          size="sm"
                          onClick={() => updatePatrolStatus(patrol.id, 'active')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Start Patrol
                        </Button>
                      )}
                      {patrol.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePatrolStatus(patrol.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePatrol(patrol.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{patrol.start_time} - {patrol.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{patrol.officer_in_charge || 'Not assigned'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-400" />
                      <span>{patrol.patrol_vehicle_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{patrol.contact_number || 'N/A'}</span>
                    </div>
                  </div>

                  {patrol.patrol_area_description && (
                    <p className="text-sm text-gray-600 border-t pt-2">
                      {patrol.patrol_area_description}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
