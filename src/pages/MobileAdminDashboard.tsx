import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { InteractiveMap } from '../components/InteractiveMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { LogOut, MapPin, DollarSign, Route, Plus, Edit, Trash2, Save } from 'lucide-react';
import { STOPS, TRANSPORT_ROUTES, Stop, Route as TransportRoute } from '../data/transportData';
import { toast } from 'sonner';

export default function MobileAdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stops, setStops] = useState<Record<string, Stop>>(STOPS);
  const [routes, setRoutes] = useState<TransportRoute[]>(TRANSPORT_ROUTES);
  const [newStop, setNewStop] = useState<{ name: string; lat: string; lng: string; type: 'bus' | 'metro' | 'train' }>({ 
    name: '', 
    lat: '', 
    lng: '', 
    type: 'bus' 
  });
  const [editingRoute, setEditingRoute] = useState<string | null>(null);
  const [routeFares, setRouteFares] = useState<Record<string, number>>({});

  useEffect(() => {
    // Check if admin is logged in
    const isAdmin = sessionStorage.getItem('isAdminLoggedIn');
    if (!isAdmin) {
      navigate('/admin/login');
    }

    // Initialize route fares
    const fares: Record<string, number> = {};
    routes.forEach(route => {
      fares[route.id] = route.fare;
    });
    setRouteFares(fares);
  }, [navigate, routes]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    toast.success(t('logout'));
    navigate('/admin/login');
  };

  const handleAddStop = () => {
    if (!newStop.name || !newStop.lat || !newStop.lng) {
      toast.error('Please fill all fields');
      return;
    }

    const stopId = newStop.name.toLowerCase().replace(/\s+/g, '_');
    const stop: Stop = {
      id: stopId,
      name: newStop.name,
      lat: parseFloat(newStop.lat),
      lng: parseFloat(newStop.lng),
      type: newStop.type
    };

    setStops({ ...stops, [stopId]: stop });
    setNewStop({ name: '', lat: '', lng: '', type: 'bus' });
    toast.success(t('stop_added'));
  };

  const handleDeleteStop = (stopId: string) => {
    const newStops = { ...stops };
    delete newStops[stopId];
    setStops(newStops);
    toast.success('Stop deleted successfully');
  };

  const handleUpdateFare = (routeId: string) => {
    const newFare = routeFares[routeId];
    const updatedRoutes = routes.map(route => 
      route.id === routeId ? { ...route, fare: newFare } : route
    );
    setRoutes(updatedRoutes);
    setEditingRoute(null);
    toast.success(t('fare_updated'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Admin Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10 shadow-2xl"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xl">
              🔑
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {t('admin_dashboard')}
              </h1>
              <p className="text-xs text-gray-400">{t('symbol_admin')} Admin Access</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button onClick={handleLogout} variant="destructive" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs defaultValue="stops" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-14 bg-white/10 backdrop-blur-xl border border-white/20">
            <TabsTrigger value="stops" className="text-base text-white data-[state=active]:bg-blue-600">
              <MapPin className="mr-2 h-4 w-4" />
              {t('manage_stops')}
            </TabsTrigger>
            <TabsTrigger value="fares" className="text-base text-white data-[state=active]:bg-green-600">
              <DollarSign className="mr-2 h-4 w-4" />
              {t('manage_fares')}
            </TabsTrigger>
            <TabsTrigger value="routes" className="text-base text-white data-[state=active]:bg-purple-600">
              <Route className="mr-2 h-4 w-4" />
              {t('manage_routes')}
            </TabsTrigger>
          </TabsList>

          {/* Manage Stops */}
          <TabsContent value="stops" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Add Stop Form */}
              <Card className="backdrop-blur-xl bg-white/10 border-2 border-white/20 text-white">
                <CardHeader className="bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-6 w-6" />
                    {t('add_stop')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stop-name">{t('stop_name')} 📝</Label>
                    <Input
                      id="stop-name"
                      value={newStop.name}
                      onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                      placeholder="e.g., Anna Nagar"
                      className="bg-white/20 border-white/30 text-white placeholder:text-gray-400 h-12"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">{t('latitude')} 🌐</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.0001"
                        value={newStop.lat}
                        onChange={(e) => setNewStop({ ...newStop, lat: e.target.value })}
                        placeholder="13.0827"
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-400 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">{t('longitude')} 🌐</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.0001"
                        value={newStop.lng}
                        onChange={(e) => setNewStop({ ...newStop, lng: e.target.value })}
                        placeholder="80.2707"
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-400 h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('stop_type')}</Label>
                    <Select 
                      value={newStop.type} 
                      onValueChange={(value: 'bus' | 'metro' | 'train') => setNewStop({ ...newStop, type: value })}
                    >
                      <SelectTrigger className="bg-white/20 border-white/30 text-white h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bus">🚌 {t('bus')}</SelectItem>
                        <SelectItem value="metro">🚇 {t('metro')}</SelectItem>
                        <SelectItem value="train">🚆 {t('train')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleAddStop} className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600">
                    <Plus className="mr-2 h-5 w-5" />
                    {t('add_stop')}
                  </Button>
                </CardContent>
              </Card>

              {/* Stops List */}
              <Card className="backdrop-blur-xl bg-white/10 border-2 border-white/20 text-white">
                <CardHeader className="bg-gradient-to-r from-green-500/20 to-blue-500/20">
                  <CardTitle>Existing Stops ({Object.keys(stops).length})</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {Object.values(stops).map((stop) => (
                      <motion.div
                        key={stop.id}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {stop.type === 'bus' && '🚌'}
                            {stop.type === 'metro' && '🚇'}
                            {stop.type === 'train' && '🚆'}
                          </span>
                          <div>
                            <p className="font-bold">{stop.name}</p>
                            <p className="text-xs text-gray-400">
                              {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDeleteStop(stop.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map Preview */}
            <Card className="mt-6 backdrop-blur-xl bg-white/10 border-2 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Map Preview 🗺️</CardTitle>
              </CardHeader>
              <CardContent>
                <InteractiveMap stops={Object.values(stops)} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Fares */}
          <TabsContent value="fares" className="mt-6">
            <Card className="backdrop-blur-xl bg-white/10 border-2 border-white/20 text-white">
              <CardHeader className="bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  {t('update_fare')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20 hover:bg-white/5">
                      <TableHead className="text-white font-bold">Route</TableHead>
                      <TableHead className="text-white font-bold">Type</TableHead>
                      <TableHead className="text-white font-bold">Current Fare</TableHead>
                      <TableHead className="text-white font-bold">New Fare</TableHead>
                      <TableHead className="text-white font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.map((route) => (
                      <TableRow key={route.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {route.type === 'bus' && '🚌'}
                            {route.type === 'metro' && '🚇'}
                            {route.type === 'train' && '🚆'}
                            {route.name}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{route.type}</TableCell>
                        <TableCell className="text-green-400 font-bold">₹{route.fare}</TableCell>
                        <TableCell>
                          {editingRoute === route.id ? (
                            <Input
                              type="number"
                              value={routeFares[route.id]}
                              onChange={(e) => setRouteFares({ ...routeFares, [route.id]: parseInt(e.target.value) || 0 })}
                              className="w-24 bg-white/20 border-white/30 text-white h-10"
                            />
                          ) : (
                            <span className="text-yellow-400 font-bold">₹{routeFares[route.id]}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRoute === route.id ? (
                            <Button
                              onClick={() => handleUpdateFare(route.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setEditingRoute(route.id)}
                              size="sm"
                              variant="outline"
                              className="border-white/30 text-white hover:bg-white/10"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Routes */}
          <TabsContent value="routes" className="mt-6">
            <Card className="backdrop-blur-xl bg-white/10 border-2 border-white/20 text-white">
              <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-6 w-6" />
                  {t('manage_routes')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {routes.map((route) => (
                    <motion.div
                      key={route.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-white/10 rounded-xl border border-white/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {route.type === 'bus' && '🚌'}
                            {route.type === 'metro' && '🚇'}
                            {route.type === 'train' && '🚆'}
                          </span>
                          <div>
                            <p className="font-bold">{route.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{route.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">₹{route.fare}</p>
                          <p className="text-xs text-gray-400">~{route.avgTime} min</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-300">
                        <p className="font-semibold mb-1">Stops ({route.stops.length}):</p>
                        <p className="text-xs">{route.stops.map(s => s.name).join(' → ')}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
