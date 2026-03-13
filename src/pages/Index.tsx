import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Route, Sparkles, Search, Shield, Smartphone, AlertCircle, AlertTriangle, Navigation, UserCircle, Settings, TrendingUp, Phone, Car, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import RouteVisualization from '@/components/RouteVisualization';
import RouteComparison from '@/components/RouteComparison';
import OptimalRecommendation from '@/components/OptimalRecommendation';
import { PolicePatrolInfo } from '@/components/PolicePatrolInfo';
import { calculateOptimalRoute, getBestDropPoint } from '@/utils/routeOptimizer';
import { DropPoint, STOPS, COLLEGE_BUS_ROUTE } from '@/data/transportData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [dropPoints, setDropPoints] = useState<DropPoint[]>([]);
  const [bestDropPoint, setBestDropPoint] = useState<DropPoint | null>(null);
  const [highlightedStopId, setHighlightedStopId] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  
  // User Input States
  const [sourceStart, setSourceStart] = useState<string>('');
  const [sourceStop, setSourceStop] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [fareBudget, setFareBudget] = useState<string>('');

  const handleCalculateRoute = () => {
    // Validate inputs
    if (!sourceStart || !sourceStop || !destination || !fareBudget) {
      alert('Please fill in all fields');
      return;
    }

    setIsCalculating(true);
    
    // Simulate calculation time for effect
    setTimeout(() => {
      // Call calculateOptimalRoute with optional parameters (currently uses default data)
      const points = calculateOptimalRoute();
      const best = getBestDropPoint(points);
      setDropPoints(points);
      setBestDropPoint(best);
      setHighlightedStopId(best?.stop.id || '');
      setIsCalculating(false);
    }, 1500);
  };

  // Get available stops for dropdowns
  const allStops = Object.values(STOPS);
  const busRouteStops = COLLEGE_BUS_ROUTE.stops;
  const fareBudgetOptions = ['₹50', '₹100', '₹150', '₹200', 'Any'];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent" />
      
      {/* Header */}
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
                <Route className="w-7 h-7 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">RouteIQ</h1>
                <p className="text-sm text-muted-foreground">
                  Smart Multi-Modal Transport Optimizer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/diagnostic">
                <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0 shadow-lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Research Demo
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg">
                  <Smartphone className="w-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/mobile">
                <Button variant="outline" className="border-blue-500/50 text-blue-600 hover:bg-blue-500 hover:text-white">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile
                </Button>
              </Link>
              <Link to="/safety">
                <Button variant="outline" className="border-red-500/50 text-red-600 hover:bg-red-500 hover:text-white">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Safety SOS
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary hover:text-black">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Access Dashboard */}
      <section className="container mx-auto px-6 py-12 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-lg border border-primary/30 rounded-full px-6 py-3 mb-6"
            >
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <h2 className="text-xl font-bold text-foreground tracking-wide">Quick Access Dashboard</h2>
            </motion.div>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              Navigate through all features with a single click - designed for speed and simplicity
            </p>
          </div>
          
          {/* Icon Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {/* Route Planning */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('route-planning-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative bg-gradient-to-br from-blue-500/90 via-blue-600/90 to-blue-700/90 backdrop-blur-xl rounded-3xl p-8 text-center cursor-pointer shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 border border-blue-400/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <Route className="w-10 h-10 mx-auto mb-3 text-white drop-shadow-lg" />
              </motion.div>
              <h3 className="font-bold text-white mb-1 text-base">Route Planning</h3>
              <p className="text-xs text-blue-50 opacity-90">Find optimal routes</p>
              <div className="mt-2 text-[10px] text-blue-100 font-semibold">1,247+ routes calculated</div>
              <div className="absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </motion.div>

            {/* Emergency SOS */}
            <Link to="/safety">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-br from-red-500/90 via-red-600/90 to-red-700/90 backdrop-blur-xl rounded-3xl p-8 text-center cursor-pointer shadow-2xl hover:shadow-red-500/50 transition-all duration-300 border border-red-400/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="relative"
                >
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-white drop-shadow-lg" />
                </motion.div>
                <h3 className="font-bold text-white mb-1 text-base">Emergency SOS</h3>
                <p className="text-xs text-red-50 opacity-90">Quick help button</p>
                <div className="mt-2 text-[10px] text-red-100 font-semibold">24/7 Active • 3 patrols nearby</div>
                <Badge className="absolute top-3 right-3 bg-yellow-400 text-black text-[10px] font-bold animate-pulse">URGENT</Badge>
              </motion.div>
            </Link>

            {/* Hazard Reporting */}
            <Link to="/safety">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-br from-orange-500/90 via-orange-600/90 to-orange-700/90 backdrop-blur-xl rounded-3xl p-8 text-center cursor-pointer shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 border border-orange-400/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-white drop-shadow-lg" />
                </motion.div>
                <h3 className="font-bold text-white mb-1 text-base">Report Hazard</h3>
                <p className="text-xs text-orange-50 opacity-90">Alert community</p>
                <div className="mt-2 text-[10px] text-orange-100 font-semibold">89 reports verified today</div>
              </motion.div>
            </Link>

            {/* Police Patrol */}
            <Link to="/police-patrol">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-br from-indigo-500/90 via-indigo-600/90 to-indigo-700/90 backdrop-blur-xl rounded-3xl p-8 text-center cursor-pointer shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 border border-indigo-400/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <Shield className="w-10 h-10 mx-auto mb-3 text-white drop-shadow-lg" />
                </motion.div>
                <h3 className="font-bold text-white mb-1 text-base">Police Patrol</h3>
                <p className="text-xs text-indigo-50 opacity-90">Daily shift entry</p>
                <div className="mt-2 text-[10px] text-indigo-100 font-semibold">12 active patrols • 8 zones covered</div>
                <Badge className="absolute top-3 right-3 bg-yellow-400 text-black text-[10px] font-bold">For Police</Badge>
              </motion.div>
            </Link>

            {/* Emergency Contacts */}
            <Link to="/safety">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-br from-green-500/90 via-green-600/90 to-green-700/90 backdrop-blur-xl rounded-3xl p-8 text-center cursor-pointer shadow-2xl hover:shadow-green-500/50 transition-all duration-300 border border-green-400/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div
                  whileHover={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <Phone className="w-10 h-10 mx-auto mb-3 text-white drop-shadow-lg" />
                </motion.div>
                <h3 className="font-bold text-white mb-1 text-base">Emergency Contacts</h3>
                <p className="text-xs text-green-50 opacity-90">Manage contacts</p>
                <div className="mt-2 text-[10px] text-green-100 font-semibold">456 contacts saved</div>
              </motion.div>
            </Link>

            {/* Delivery Platform */}
            <Link to="/mobile">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-br from-pink-500/90 via-pink-600/90 to-pink-700/90 backdrop-blur-xl rounded-3xl p-8 text-center cursor-pointer shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 border border-pink-400/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div
                  animate={{ x: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="relative"
                >
                  <Car className="w-10 h-10 mx-auto mb-3 text-white drop-shadow-lg" />
                </motion.div>
                <h3 className="font-bold text-white mb-1 text-base">Delivery Riders</h3>
                <p className="text-xs text-pink-50 opacity-90">For Zomato/Swiggy</p>
                <div className="mt-2 text-[10px] text-pink-100 font-semibold">234 riders using app</div>
              </motion.div>
            </Link>

            {/* Mobile App */}
            <Link to="/mobile">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-br from-cyan-500/90 via-cyan-600/90 to-cyan-700/90 backdrop-blur-xl rounded-3xl p-8 text-center cursor-pointer shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 border border-cyan-400/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div
                  whileHover={{ rotateZ: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <Smartphone className="w-10 h-10 mx-auto mb-3 text-white drop-shadow-lg" />
                </motion.div>
                <h3 className="font-bold text-white mb-1 text-base">Mobile View</h3>
                <p className="text-xs text-cyan-50 opacity-90">Optimized UI</p>
                <div className="mt-2 text-[10px] text-cyan-100 font-semibold">567 active users online</div>
              </motion.div>
            </Link>

            {/* Login */}
            <Link to="/login">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 }}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-br from-slate-600/90 via-slate-700/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 text-center cursor-pointer shadow-2xl hover:shadow-slate-500/50 transition-all duration-300 border border-slate-400/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <Settings className="w-10 h-10 mx-auto mb-3 text-white drop-shadow-lg" />
                </motion.div>
                <h3 className="font-bold text-white mb-1 text-base">Login</h3>
                <p className="text-xs text-slate-200 opacity-90">User account</p>
                <div className="mt-2 text-[10px] text-slate-300 font-semibold">Secure OTP authentication</div>
              </motion.div>
            </Link>
          </div>

          {/* Bottom Accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-12 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
          />
        </motion.div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-7xl relative z-10" id="route-planning-section">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/95 to-card/90 border border-border/50 shadow-elevated backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
            
            <div className="relative p-8 md:p-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">
                    Find Your Optimal Drop Point
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Discover the perfect drop point on your route to save time, money, and energy
                  </p>
                </div>
              </div>

              {/* Input Form */}
              <div className="mt-8 space-y-6 bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/30 shadow-lg">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Source Start */}
                  <div className="space-y-2">
                    <Label htmlFor="sourceStart" className="text-base font-semibold text-foreground">
                      Source Start (Moving Vehicle Route)
                    </Label>
                    <Select value={sourceStart} onValueChange={setSourceStart}>
                      <SelectTrigger className="h-12 text-base bg-background border-border">
                        <SelectValue placeholder="Select starting point..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {busRouteStops.map((stop) => (
                          <SelectItem key={stop.id} value={stop.id}>
                            {stop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source Stop */}
                  <div className="space-y-2">
                    <Label htmlFor="sourceStop" className="text-base font-semibold text-foreground">
                      Source Stop (End of Vehicle Route)
                    </Label>
                    <Select value={sourceStop} onValueChange={setSourceStop}>
                      <SelectTrigger className="h-12 text-base bg-background border-border">
                        <SelectValue placeholder="Select ending point..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {busRouteStops.map((stop) => (
                          <SelectItem key={stop.id} value={stop.id}>
                            {stop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Destination */}
                  <div className="space-y-2">
                    <Label htmlFor="destination" className="text-base font-semibold text-foreground">
                      Final Destination
                    </Label>
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger className="h-12 text-base bg-background border-border">
                        <SelectValue placeholder="Where do you want to go?" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {allStops.map((stop) => (
                          <SelectItem key={stop.id} value={stop.id}>
                            {stop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fare Budget */}
                  <div className="space-y-2">
                    <Label htmlFor="fare" className="text-base font-semibold text-foreground">
                      Fare Budget
                    </Label>
                    <Select value={fareBudget} onValueChange={setFareBudget}>
                      <SelectTrigger className="h-12 text-base bg-background border-border">
                        <SelectValue placeholder="How much can you spend?" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {fareBudgetOptions.map((budget) => (
                          <SelectItem key={budget} value={budget}>
                            {budget}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Calculate Button */}
                <Button 
                  onClick={handleCalculateRoute}
                  disabled={isCalculating}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {isCalculating ? 'Calculating...' : 'Find Optimal Route'}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-6 mt-8">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary/10 border border-secondary/30">
                  <div className="w-4 h-4 rounded-full bg-secondary shadow-lg" />
                  <span className="text-sm font-medium text-foreground">Metro</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30">
                  <div className="w-4 h-4 rounded-full bg-primary shadow-lg" />
                  <span className="text-sm font-medium text-foreground">Bus</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-accent/10 border border-accent/30">
                  <div className="w-4 h-4 rounded-full bg-accent shadow-lg" />
                  <span className="text-sm font-medium text-foreground">Optimal Point</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isCalculating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-6"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin shadow-glow" />
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/10 blur-xl" />
            </div>
            <p className="text-xl font-semibold text-foreground">
              Analyzing optimal routes...
            </p>
            <p className="text-sm text-muted-foreground">
              Processing multi-modal transport data
            </p>
          </motion.div>
        )}

        {/* Results */}
        {!isCalculating && dropPoints.length > 0 && (
          <Tabs defaultValue="recommendation" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto bg-card/50 backdrop-blur-xl border border-border/50 p-1.5 h-14 rounded-2xl">
              <TabsTrigger value="recommendation" className="rounded-xl text-base data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-lg">
                Best Route
              </TabsTrigger>
              <TabsTrigger value="route" className="rounded-xl text-base data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-lg">
                Route Map
              </TabsTrigger>
              <TabsTrigger value="comparison" className="rounded-xl text-base data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-lg">
                All Options
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommendation" className="space-y-6">
              <OptimalRecommendation
                bestDropPoint={bestDropPoint}
                onHighlight={setHighlightedStopId}
              />
              
              {/* Police Patrol Information */}
              {bestDropPoint && bestDropPoint.stop && bestDropPoint.stop.coordinates && (
                <PolicePatrolInfo
                  sourceLocation={{ 
                    lat: bestDropPoint.stop.coordinates.lat, 
                    lng: bestDropPoint.stop.coordinates.lng 
                  }}
                  destinationLocation={{ 
                    lat: bestDropPoint.stop.coordinates.lat, 
                    lng: bestDropPoint.stop.coordinates.lng 
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="route" className="space-y-6">
              <div className="rounded-3xl bg-card/50 backdrop-blur-xl border border-border/50 shadow-elevated overflow-hidden">
                <div className="p-8 bg-gradient-to-br from-secondary/10 to-transparent">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-bold text-foreground">Complete Journey Map</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Branching route from college bus to your final destination
                  </p>
                </div>
                <div className="p-8">
                  <RouteVisualization 
                    highlightedStopId={highlightedStopId}
                    optimalRoute={bestDropPoint?.optimalRoute?.segments}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <RouteComparison dropPoints={dropPoints} bestDropPoint={bestDropPoint} />
            </TabsContent>
          </Tabs>
        )}

        {/* Algorithm Info */}
        {!isCalculating && dropPoints.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16"
          >
            <div className="rounded-3xl bg-card/50 backdrop-blur-xl border border-border/50 shadow-elevated overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6">How It Works</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-primary">1</span>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Path Analysis</h4>
                    <p className="text-muted-foreground text-sm">
                      Evaluates each stop along the college bus route as a potential drop point
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-transparent border border-secondary/20">
                    <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-secondary">2</span>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Multi-Modal Search</h4>
                    <p className="text-muted-foreground text-sm">
                      Uses modified SSSP algorithm to find routes from each drop point via bus, metro, and train
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-accent">3</span>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Cost Optimization</h4>
                    <p className="text-muted-foreground text-sm">
                      Weighs time (50%), fare (30%), and transfers (20%) to calculate optimal score
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-primary">4</span>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Smart Recommendation</h4>
                    <p className="text-muted-foreground text-sm">
                      Suggests the drop point with the lowest combined cost across all factors
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20 py-8 bg-card/20 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-foreground font-medium mb-1">RouteIQ - Optimal Route Planner</p>
          <p className="text-sm text-muted-foreground">
            Final Year Project using Randomized SSSP for Multi-Modal Transport Optimization
          </p>
        </div>
      </footer>

      {/* Floating Quick Access Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 flex flex-col gap-3 z-50"
      >
        <Link to="/safety">
          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-2xl hover:shadow-red-500/50 transition-all duration-300 group"
          >
            <AlertCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
          </Button>
        </Link>
        <Link to="/mobile">
          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 group"
          >
            <Smartphone className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default Index;
