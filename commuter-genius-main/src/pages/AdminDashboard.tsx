import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LogOut, Plus, Edit, Trash2, DollarSign, MapPin, Route as RouteIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STOPS, TRANSPORT_ROUTES } from '@/data/transportData';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState(TRANSPORT_ROUTES);
  const [stops, setStops] = useState(Object.values(STOPS));
  const [editingFare, setEditingFare] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Check authentication
    const isAuth = sessionStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  const handleFareChange = (routeId: string, newFare: string) => {
    const fareValue = parseFloat(newFare);
    if (!isNaN(fareValue)) {
      setEditingFare({ ...editingFare, [routeId]: fareValue });
    }
  };

  const saveFare = (routeId: string) => {
    const newFare = editingFare[routeId];
    if (newFare !== undefined) {
      setRoutes(routes.map(route => 
        route.id === routeId ? { ...route, fare: newFare } : route
      ));
      
      // Remove from editing state
      const updatedEditing = { ...editingFare };
      delete updatedEditing[routeId];
      setEditingFare(updatedEditing);
      
      alert(`Fare updated for ${routes.find(r => r.id === routeId)?.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Header */}
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
                <Shield className="w-7 h-7 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Manage Routes, Stops & Fares
                </p>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-7xl relative z-10">
        <Tabs defaultValue="fares" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto bg-card/50 backdrop-blur-xl border border-border/50 p-1.5 h-14 rounded-2xl">
            <TabsTrigger value="fares" className="rounded-xl text-base data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-lg">
              <DollarSign className="w-4 h-4 mr-2" />
              Fares
            </TabsTrigger>
            <TabsTrigger value="routes" className="rounded-xl text-base data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-lg">
              <RouteIcon className="w-4 h-4 mr-2" />
              Routes
            </TabsTrigger>
            <TabsTrigger value="stops" className="rounded-xl text-base data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-lg">
              <MapPin className="w-4 h-4 mr-2" />
              Stops
            </TabsTrigger>
          </TabsList>

          {/* Fares Management */}
          <TabsContent value="fares" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-elevated">
                <CardHeader>
                  <CardTitle className="text-2xl">Manage Route Fares</CardTitle>
                  <CardDescription>Update fare prices for all transport routes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {routes.map((route) => (
                      <div
                        key={route.id}
                        className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-foreground mb-1">
                              {route.name}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="capitalize">{route.type}</span>
                              <span>•</span>
                              <span>{route.stops.length} stops</span>
                              <span>•</span>
                              <span>~{route.avgTime} min</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Current Fare</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={editingFare[route.id] !== undefined ? editingFare[route.id] : route.fare}
                                  onChange={(e) => handleFareChange(route.id, e.target.value)}
                                  className="w-24 h-10 text-base font-semibold"
                                  min="0"
                                  step="5"
                                />
                                <span className="text-lg font-semibold text-foreground">₹</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => saveFare(route.id)}
                              disabled={editingFare[route.id] === undefined}
                              className="bg-primary hover:bg-primary/90 text-black"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Routes Management */}
          <TabsContent value="routes" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Manage Routes</CardTitle>
                      <CardDescription>Add, edit, or remove transport routes</CardDescription>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-black">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Route
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {routes.map((route) => (
                      <div
                        key={route.id}
                        className="p-6 rounded-2xl bg-gradient-to-br from-secondary/5 to-transparent border border-border/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-foreground mb-2">
                              {route.name}
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Type:</span>
                                <span className="capitalize font-medium">{route.type}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Stops:</span>
                                <span className="font-medium">
                                  {route.stops.map(s => s.name).join(' → ')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Stops Management */}
          <TabsContent value="stops" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Manage Stops</CardTitle>
                      <CardDescription>Add, edit, or remove transport stops</CardDescription>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-black">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Stop
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {stops.map((stop) => (
                      <div
                        key={stop.id}
                        className="p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent border border-border/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-foreground mb-2">
                              {stop.name}
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Type:</span>
                                <span className="capitalize font-medium">{stop.type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Coordinates:</span>
                                <span className="font-mono text-xs">{stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
