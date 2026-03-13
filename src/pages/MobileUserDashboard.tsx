import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { InteractiveMap } from '../components/InteractiveMap';
import { SOSButton } from '../components/safety/SOSButton';
import { Navigation, MapPin, DollarSign, Clock, ArrowRight, Star, Bell, Shield } from 'lucide-react';
import { STOPS, COLLEGE_BUS_ROUTE, HOME, TRANSPORT_ROUTES } from '../data/transportData';
import { calculateOptimalRoute } from '../utils/routeOptimizer';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function MobileUserDashboard() {
  const { t } = useTranslation();
  const [sourceStart, setSourceStart] = useState('');
  const [sourceStop, setSourceStop] = useState('');
  const [destination, setDestination] = useState('avadi');
  const [fareBudget, setFareBudget] = useState('any');
  const [result, setResult] = useState<{ dropPoints: any[]; optimal: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [arrivalTimes, setArrivalTimes] = useState<Record<string, number>>({});

  // Initialize arrival times from routes
  useEffect(() => {
    const times: Record<string, number> = {};
    TRANSPORT_ROUTES.forEach(route => {
      if (route.nextArrival) {
        times[route.id] = route.nextArrival * 60; // Convert to seconds
      }
    });
    setArrivalTimes(times);
  }, []);

  // Countdown timer for arrival times
  useEffect(() => {
    const interval = setInterval(() => {
      setArrivalTimes(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(routeId => {
          if (updated[routeId] > 0) {
            updated[routeId]--;
          } else {
            // Reset to original time when countdown completes
            const route = TRANSPORT_ROUTES.find(r => r.id === routeId);
            if (route?.nextArrival) {
              updated[routeId] = route.nextArrival * 60;
            }
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatArrivalTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFindRoute = () => {
    if (!sourceStart || !sourceStop) {
      toast.error('Please select source start and stop');
      return;
    }

    setLoading(true);
    
    // Simulate API call with delay for smooth UX
    setTimeout(() => {
      const dropPoints = calculateOptimalRoute(
        STOPS[sourceStart],
        STOPS[destination],
        COLLEGE_BUS_ROUTE,
        fareBudget === 'any' ? undefined : parseInt(fareBudget)
      );
      
      // Find the best drop point
      const optimal = dropPoints.length > 0 ? dropPoints.reduce((best, current) => 
        (current.optimalRoute?.score || 0) > (best.optimalRoute?.score || 0) ? current : best
      ) : null;
      
      setResult({ dropPoints, optimal });
      setLoading(false);
      
      // Show notification
      if (optimal) {
        toast.success(t('success'), {
          description: `${t('best_drop')}: ${optimal.stop.name}`,
        });
      }
    }, 1500);
  };

  const budgetOptions = [
    { value: 'any', label: t('any_amount') + ' 💰' },
    { value: '50', label: '₹50' },
    { value: '100', label: '₹100' },
    { value: '200', label: '₹200' },
    { value: '500', label: '₹500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 -left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -50, 0],
            x: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-2xl"
        />
      </div>

      {/* Glassmorphic Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="sticky top-0 z-50 backdrop-blur-2xl bg-white/10 border-b border-white/20 shadow-2xl"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl"
            >
              🚌
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow-lg">
                {t('app_title')}
              </h1>
              <p className="text-xs text-cyan-300">{t('symbol_user')} {t('user_portal')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/safety">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0 shadow-lg">
                  <Shield className="h-4 w-4 mr-1" />
                  Safety
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" className="rounded-full text-yellow-400 hover:bg-white/20">
                <Bell className="h-5 w-5" />
              </Button>
            </motion.div>
            <LanguageSwitcher />
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        {/* Main Planning Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <Card className="backdrop-blur-2xl bg-white/10 border-2 border-white/30 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-b border-white/20">
              <CardTitle className="flex items-center gap-3 text-2xl text-white drop-shadow-lg">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Navigation className="h-7 w-7 text-cyan-400" />
                </motion.div>
                {t('plan_journey')} ✨
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Input Fields with Icons */}
              <div className="space-y-4">
                {/* Source Start */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-white">
                    {t('symbol_location')} {t('source_start')}
                  </label>
                  <Select value={sourceStart} onValueChange={setSourceStart}>
                    <SelectTrigger className="h-14 text-lg border-2 border-white/30 bg-white/20 hover:bg-white/30 hover:border-cyan-400 transition-all text-white backdrop-blur-xl rounded-xl">
                      <SelectValue placeholder={t('symbol_bus') + " " + t('source_start')} />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-2xl bg-gray-900/95 border-white/20">
                      {Object.values(STOPS).map((stop) => (
                        <SelectItem key={stop.id} value={stop.id} className="text-lg py-3 text-white hover:bg-white/20">
                          {stop.type === 'bus' && '🚌'} 
                          {stop.type === 'metro' && '🚇'} 
                          {stop.type === 'train' && '🚆'} 
                          {' '}{stop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Source Stop */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-white">
                    📍 {t('source_stop')}
                  </label>
                  <Select value={sourceStop} onValueChange={setSourceStop}>
                    <SelectTrigger className="h-14 text-lg border-2 border-white/30 bg-white/20 hover:bg-white/30 hover:border-purple-400 transition-all text-white backdrop-blur-xl rounded-xl">
                      <SelectValue placeholder={`🚏 ${t('source_stop')}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {COLLEGE_BUS_ROUTE.stops.map((stop) => (
                        <SelectItem key={stop.id} value={stop.id} className="text-lg py-3">
                          {stop.type === 'bus' && '🚌'} 
                          {stop.type === 'metro' && '🚇'} 
                          {stop.type === 'train' && '🚆'} 
                          {' '}{stop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Destination */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-sm font-medium">
                    🎯 {t('destination')}
                  </label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger className="h-14 text-lg border-2 hover:border-blue-400 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(STOPS).map((stop) => (
                        <SelectItem key={stop.id} value={stop.id} className="text-lg py-3">
                          {stop.type === 'bus' && '🚌'} 
                          {stop.type === 'metro' && '🚇'} 
                          {stop.type === 'train' && '🚆'} 
                          {' '}{stop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Fare Budget */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-sm font-medium">
                    {t('symbol_money')} {t('fare_budget')}
                  </label>
                  <Select value={fareBudget} onValueChange={setFareBudget}>
                    <SelectTrigger className="h-14 text-lg border-2 hover:border-blue-400 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-lg py-3">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>

              {/* Find Route Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleFindRoute}
                  disabled={loading}
                  className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <Star className="mr-2 h-6 w-6" />
                      {t('find_route')}
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && result.optimal && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <Tabs defaultValue="route" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-14 bg-white/80 backdrop-blur-xl">
                  <TabsTrigger value="route" className="text-lg">
                    🗺️ {t('route_map')}
                  </TabsTrigger>
                  <TabsTrigger value="details" className="text-lg">
                    ⭐ {t('optimal_route')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="route" className="mt-4">
                  <InteractiveMap
                    stops={[...COLLEGE_BUS_ROUTE.stops, HOME]}
                    route={result.optimal.optimalRoute}
                    optimalDropPoint={result.optimal.stop}
                  />
                </TabsContent>

                <TabsContent value="details" className="mt-4">
                  <Card className="backdrop-blur-xl bg-gradient-to-br from-green-50/80 to-blue-50/80 dark:from-green-900/30 dark:to-blue-900/30 border-2 border-green-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl text-green-700 dark:text-green-300">
                        <Star className="h-7 w-7 fill-yellow-400 stroke-yellow-600" />
                        {t('best_drop')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                        <p className="text-4xl mb-2">📍</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {result.optimal.stop.name}
                        </p>
                      </div>

                      {result.optimal.optimalRoute && (
                        <>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                              <p className="text-2xl font-bold">{result.optimal.optimalRoute.totalTime}</p>
                              <p className="text-xs text-muted-foreground">{t('minutes')}</p>
                            </div>
                            <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                              <p className="text-2xl font-bold">₹{result.optimal.optimalRoute.totalFare}</p>
                              <p className="text-xs text-muted-foreground">{t('total_fare')}</p>
                            </div>
                            <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                              <ArrowRight className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                              <p className="text-2xl font-bold">{result.optimal.optimalRoute.transfers}</p>
                              <p className="text-xs text-muted-foreground">{t('transfers')}</p>
                            </div>
                          </div>

                          {/* Route Steps */}
                          <div className="space-y-3 mt-6">
                            {result.optimal.optimalRoute.segments.map((segment: any, idx: number) => (
                              <motion.div
                                key={idx}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl"
                              >
                                <div className="text-3xl">
                                  {segment.mode === 'bus' && '🚌'}
                                  {segment.mode === 'metro' && '🚇'}
                                  {segment.mode === 'train' && '🚆'}
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-lg text-gray-900 dark:text-white">{segment.routeName}</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {segment.from.name} → {segment.to.name}
                                  </p>
                                  <div className="flex gap-4 mt-2 flex-wrap">
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {segment.time} min
                                    </Badge>
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      ₹{segment.fare}
                                    </Badge>
                                    {/* Show real-time arrival if available */}
                                    {TRANSPORT_ROUTES.find(r => r.name === segment.routeName)?.id && arrivalTimes[TRANSPORT_ROUTES.find(r => r.name === segment.routeName)!.id] && (
                                      <Badge className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse">
                                        ⏱️ Arrives in {formatArrivalTime(arrivalTimes[TRANSPORT_ROUTES.find(r => r.name === segment.routeName)!.id])}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Floating SOS Button */}
      <SOSButton />
    </div>
  );
}
