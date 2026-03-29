import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Route, Sparkles, Search, Shield, Smartphone, AlertCircle, AlertTriangle, UserCircle, Settings, TrendingUp, Phone, Car, Clock, Check, ChevronsUpDown, Siren, GraduationCap, Briefcase, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import RouteVisualization from '@/components/RouteVisualization';
import RouteComparison from '@/components/RouteComparison';
import OptimalRecommendation from '@/components/OptimalRecommendation';
import { InteractiveMap } from '@/components/InteractiveMap';
import { PolicePatrolInfo } from '@/components/PolicePatrolInfo';
import { calculateOptimalRoute, getBestDropPoint } from '@/utils/routeOptimizer';
import { DropPoint, STOPS, COLLEGE_BUS_ROUTE, Stop } from '@/data/transportData';
import { getGoogleTransitRoute, getOpenRoute, getGtfsLiveFeed, planRoute, GoogleTransitRoute, GTFSLiveFeedResponse, OpenRouteResponse } from '@/utils/apiService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DemoLocationOption {
  id: string;
  name: string;
  zone: 'Central' | 'OMR' | 'North Chennai' | 'West Chennai';
}

const SOURCE_ROUTE_OPTIONS: DemoLocationOption[] = [
  { id: 'planetarium', name: 'Birla Planetarium', zone: 'Central' },
  { id: 'guindy', name: 'Guindy Metro Station', zone: 'Central' },
  { id: 'little_mount', name: 'Little Mount Metro', zone: 'Central' },
  { id: 'saidapet', name: 'Saidapet', zone: 'Central' },
  { id: 'teynampet', name: 'Teynampet', zone: 'Central' },
  { id: 'cmbt', name: 'Koyambedu CMBT', zone: 'West Chennai' },
  { id: 'anna_nagar', name: 'Anna Nagar Roundtana', zone: 'West Chennai' },
  { id: 'villivakkam', name: 'Villivakkam', zone: 'West Chennai' },
  { id: 'redhills', name: 'Red Hills', zone: 'North Chennai' },
  { id: 'rmkcet', name: 'R.M.K College of Engineering and Technology', zone: 'North Chennai' },
  { id: 'central', name: 'Chennai Central', zone: 'Central' },
  { id: 'avadi', name: 'Avadi', zone: 'West Chennai' },
  { id: 'thoraipakkam', name: 'Thoraipakkam OMR', zone: 'OMR' },
  { id: 'sholinganallur', name: 'Sholinganallur', zone: 'OMR' },
  { id: 'navalur', name: 'Navalur', zone: 'OMR' },
  { id: 'siruseri', name: 'Siruseri SIPCOT', zone: 'OMR' },
];

const DESTINATION_OPTIONS: DemoLocationOption[] = [
  { id: 'avadi', name: 'Avadi', zone: 'West Chennai' },
  { id: 'central', name: 'Chennai Central', zone: 'Central' },
  { id: 'egmore', name: 'Egmore', zone: 'Central' },
  { id: 'guindy', name: 'Guindy', zone: 'Central' },
  { id: 'tnagar', name: 'T. Nagar', zone: 'Central' },
  { id: 'velachery', name: 'Velachery', zone: 'OMR' },
  { id: 'thoraipakkam', name: 'Thoraipakkam OMR', zone: 'OMR' },
  { id: 'sholinganallur', name: 'Sholinganallur', zone: 'OMR' },
  { id: 'navalur', name: 'Navalur', zone: 'OMR' },
  { id: 'siruseri', name: 'Siruseri SIPCOT', zone: 'OMR' },
  { id: 'tambaram', name: 'Tambaram', zone: 'West Chennai' },
  { id: 'porur', name: 'Porur', zone: 'West Chennai' },
  { id: 'redhills', name: 'Red Hills', zone: 'North Chennai' },
  { id: 'rmkcet', name: 'R.M.K College of Engineering and Technology', zone: 'North Chennai' },
];

const STOP_ZONE_MAP: Record<string, DemoLocationOption['zone']> = {
  planetarium: 'Central',
  guindy: 'Central',
  central: 'Central',
  cmbt: 'West Chennai',
  avadi: 'West Chennai',
  redhills: 'North Chennai',
  rmkcet: 'North Chennai',
};

const NETWORK_STOP_ALIASES: Record<string, string> = {
  planetarium: 'planetarium',
  guindy: 'guindy',
  cmbt: 'cmbt',
  redhills: 'redhills',
  rmkcet: 'rmkcet',
  central: 'central',
  avadi: 'avadi',
  little_mount: 'guindy',
  saidapet: 'guindy',
  teynampet: 'central',
  anna_nagar: 'cmbt',
  villivakkam: 'cmbt',
  egmore: 'central',
  tnagar: 'guindy',
  velachery: 'guindy',
  thoraipakkam: 'guindy',
  sholinganallur: 'guindy',
  navalur: 'redhills',
  siruseri: 'redhills',
  tambaram: 'guindy',
  porur: 'cmbt',
};

const resolveNetworkStopId = (id: string): string => {
  if (!id) return 'central';
  const mappedId = NETWORK_STOP_ALIASES[id] || id;
  return STOPS[mappedId] ? mappedId : 'central';
};

const ZONE_ORDER: DemoLocationOption['zone'][] = ['Central', 'OMR', 'North Chennai', 'West Chennai'];

interface DemoPreset {
  id: string;
  title: string;
  description: string;
  sourceStart: string;
  sourceStop: string;
  destination: string;
  fareBudget: string;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'it-corridor',
    title: 'IT Corridor Commute',
    description: 'Peak-hour commute via city interchanges toward OMR belt.',
    sourceStart: 'central',
    sourceStop: 'guindy',
    destination: 'sholinganallur',
    fareBudget: '₹150',
  },
  {
    id: 'rmk-commute',
    title: 'R.M.K College Commute',
    description: 'Daily travel scenario ending at R.M.K CET in Puduvoyal.',
    sourceStart: 'planetarium',
    sourceStop: 'redhills',
    destination: 'rmkcet',
    fareBudget: '₹100',
  },
  {
    id: 'emergency-reroute',
    title: 'Emergency Reroute',
    description: 'Fast reroute model during hazard escalation near north corridor.',
    sourceStart: 'guindy',
    sourceStop: 'cmbt',
    destination: 'redhills',
    fareBudget: 'Any',
  },
];

interface SearchableZoneSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: DemoLocationOption[];
  placeholder: string;
}

const SearchableZoneSelect = ({ value, onChange, options, placeholder }: SearchableZoneSelectProps) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);

  const grouped = options.reduce<Record<string, DemoLocationOption[]>>((acc, option) => {
    if (!acc[option.zone]) {
      acc[option.zone] = [];
    }
    acc[option.zone].push(option);
    return acc;
  }, {});

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-12 w-full justify-between border-border bg-background text-base font-normal"
        >
          <span className="truncate text-left">
            {selected ? `${selected.name} (${selected.zone})` : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Type quickly to search location..." />
          <CommandList>
            <CommandEmpty>No locations found.</CommandEmpty>
            {ZONE_ORDER.filter((zone) => grouped[zone]?.length).map((zone) => (
              <CommandGroup key={zone} heading={zone}>
                {grouped[zone].map((option) => (
                  <CommandItem
                    key={option.id}
                    value={`${option.name} ${option.zone} ${option.id}`}
                    onSelect={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', value === option.id ? 'opacity-100' : 'opacity-0')} />
                    <span className="truncate">{option.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const Index = () => {
  const GOOGLE_TRANSIT_ENABLED = import.meta.env.VITE_ENABLE_GOOGLE_TRANSIT === 'true';
  const GTFS_LIVE_ENABLED = import.meta.env.VITE_ENABLE_GTFS_LIVE === 'true';
  const [dropPoints, setDropPoints] = useState<DropPoint[]>([]);
  const [bestDropPoint, setBestDropPoint] = useState<DropPoint | null>(null);
  const [highlightedStopId, setHighlightedStopId] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [googleTransitData, setGoogleTransitData] = useState<GoogleTransitRoute | null>(null);
  const [googleTransitLoading, setGoogleTransitLoading] = useState(false);
  const [googleTransitError, setGoogleTransitError] = useState<string | null>(null);
  const [openRouteData, setOpenRouteData] = useState<OpenRouteResponse | null>(null);
  const [openRouteError, setOpenRouteError] = useState<string | null>(null);
  const [gtfsLiveData, setGtfsLiveData] = useState<GTFSLiveFeedResponse | null>(null);
  const [gtfsLiveLoading, setGtfsLiveLoading] = useState(false);
  const [gtfsLiveError, setGtfsLiveError] = useState<string | null>(null);
  const [gtfsAutoRefresh, setGtfsAutoRefresh] = useState(true);
  const [plannerNotice, setPlannerNotice] = useState<string | null>(null);
  const [backendRouteData, setBackendRouteData] = useState<any | null>(null);
  const mapStyle: 'dark' = 'dark';
  
  // User Input States
  const [sourceStart, setSourceStart] = useState<string>('');
  const [sourceStop, setSourceStop] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [fareBudget, setFareBudget] = useState<string>('');

  const fetchGoogleTransitPreview = async (origin: Stop, target: Stop) => {
    if (!GOOGLE_TRANSIT_ENABLED) return;

    setGoogleTransitLoading(true);
    setGoogleTransitError(null);

    const response = await getGoogleTransitRoute(origin.lat, origin.lng, target.lat, target.lng, 'now');

    if (response.error) {
      setGoogleTransitData(null);
      setGoogleTransitError(response.error);
    } else {
      setGoogleTransitData(response.data ?? null);
    }

    setGoogleTransitLoading(false);
  };

  const fetchOpenRoutePreview = async (origin: Stop, target: Stop) => {
    const response = await getOpenRoute(origin.lat, origin.lng, target.lat, target.lng);
    if (response.error) {
      setOpenRouteData(null);
      setOpenRouteError(response.error);
      return;
    }

    setOpenRouteError(null);
    setOpenRouteData(response.data ?? null);
  };

  const fetchGtfsLiveData = async () => {
    if (!GTFS_LIVE_ENABLED) return;

    setGtfsLiveLoading(true);
    setGtfsLiveError(null);

    const response = await getGtfsLiveFeed(undefined, 250);
    if (response.error) {
      setGtfsLiveData(null);
      setGtfsLiveError(response.error);
    } else {
      setGtfsLiveData(response.data ?? null);
    }

    setGtfsLiveLoading(false);
  };

  const fetchBackendRoutePlan = async (origin: Stop, target: Stop) => {
    const response = await planRoute(origin.lat, origin.lng, target.lat, target.lng, 0.4, 0.3, 0.3);
    if (response.error) {
      setBackendRouteData(null);
      return;
    }

    setBackendRouteData(response.data ?? null);
  };

  const parseFareBudgetValue = (budget: string): number | null => {
    if (!budget || budget.toLowerCase() === 'any') {
      return null;
    }

    const digits = budget.replace(/[^0-9]/g, '');
    if (!digits) {
      return null;
    }

    return Number(digits);
  };

  const handleCalculateRoute = () => {
    // Validate inputs
    if (!sourceStart || !sourceStop || !destination || !fareBudget) {
      alert('Please fill in all fields');
      return;
    }

    setIsCalculating(true);
    setGoogleTransitData(null);
    setGoogleTransitError(null);
    setOpenRouteData(null);
    setOpenRouteError(null);
    setBackendRouteData(null);
    setPlannerNotice(null);

    const resolvedStart = resolveNetworkStopId(sourceStart);
    const resolvedSourceStop = resolveNetworkStopId(sourceStop);
    const resolvedDestination = resolveNetworkStopId(destination);

    if (resolvedStart === resolvedDestination) {
      alert('Start and destination cannot be the same. Please choose different points.');
      return;
    }
    
    // Simulate calculation time for effect
    setTimeout(() => {
      const points = calculateOptimalRoute({
        movingStartId: resolvedStart,
        movingEndId: resolvedSourceStop,
        destinationId: resolvedDestination,
      });
      const budgetLimit = parseFareBudgetValue(fareBudget);
      const filteredPoints = budgetLimit === null
        ? points
        : points.filter((point) => (point.optimalRoute?.totalFare ?? Number.MAX_SAFE_INTEGER) <= budgetLimit);

      if (filteredPoints.length === 0) {
        setDropPoints([]);
        setBestDropPoint(null);
        setHighlightedStopId('');
        setPlannerNotice('No route option matches the selected fare budget and route choices. Increase budget or adjust source/destination.');
        setIsCalculating(false);
        return;
      }

      const best = getBestDropPoint(filteredPoints);
      setDropPoints(filteredPoints);
      setBestDropPoint(best);
      setHighlightedStopId(best?.stop.id || '');
      setIsCalculating(false);

      if (GOOGLE_TRANSIT_ENABLED) {
        const origin = STOPS[resolvedStart] || best?.stop;
        const target = STOPS[resolvedDestination] || null;
        if (origin && target) {
          void fetchBackendRoutePlan(origin, target);
          void fetchGoogleTransitPreview(origin, target);
          void fetchOpenRoutePreview(origin, target);
        } else {
          setGoogleTransitError('Google transit preview is available for mapped stops only.');
          setOpenRouteError('Open route preview is available for mapped stops only.');
        }
      } else {
        const origin = STOPS[resolvedStart] || best?.stop;
        const target = STOPS[resolvedDestination] || null;
        if (origin && target) {
          void fetchBackendRoutePlan(origin, target);
          void fetchOpenRoutePreview(origin, target);
        }
      }

      if (GTFS_LIVE_ENABLED) {
        void fetchGtfsLiveData();
      }
    }, 1500);
  };

  useEffect(() => {
    if (!GTFS_LIVE_ENABLED) return;
    void fetchGtfsLiveData();
  }, [GTFS_LIVE_ENABLED]);

  useEffect(() => {
    if (!GTFS_LIVE_ENABLED) return;
    if (!gtfsAutoRefresh) return;

    const timer = window.setInterval(() => {
      void fetchGtfsLiveData();
    }, 20000);

    return () => window.clearInterval(timer);
  }, [GTFS_LIVE_ENABLED, gtfsAutoRefresh]);

  // Get available stops for dropdowns
  const allStops = Object.values(STOPS);
  const busRouteStops = COLLEGE_BUS_ROUTE.stops;
  const enrichedSourceOptions: DemoLocationOption[] = Array.from(
    new Map(
      [
        ...busRouteStops.map((s) => ({
          id: s.id,
          name: s.name,
          zone: STOP_ZONE_MAP[s.id] ?? 'Central',
        })),
        ...SOURCE_ROUTE_OPTIONS,
      ].map((opt) => [opt.id, opt])
    ).values()
  );
  const enrichedDestinationOptions: DemoLocationOption[] = Array.from(
    new Map(
      [
        ...allStops.map((s) => ({
          id: s.id,
          name: s.name,
          zone: STOP_ZONE_MAP[s.id] ?? 'Central',
        })),
        ...DESTINATION_OPTIONS,
      ].map((opt) => [opt.id, opt])
    ).values()
  );
  const fareBudgetOptions = ['₹50', '₹100', '₹150', '₹200', 'Any'];

  const selectedSourceStop = sourceStart ? STOPS[resolveNetworkStopId(sourceStart)] : undefined;
  const selectedDestinationStop = destination ? STOPS[resolveNetworkStopId(destination)] : undefined;

  const liveMapStops = useMemo(() => {
    if (!bestDropPoint?.optimalRoute) {
      return COLLEGE_BUS_ROUTE.stops;
    }

    const routeStops = bestDropPoint.optimalRoute.segments.flatMap((segment, index) => {
      if (index === 0) return [segment.from, segment.to];
      return [segment.to];
    });

    const merged = [...COLLEGE_BUS_ROUTE.stops, ...routeStops];
    const deduped = new Map(merged.map((stop) => [stop.id, stop]));
    return Array.from(deduped.values());
  }, [bestDropPoint]);

  const applyDemoPreset = (preset: DemoPreset) => {
    setSourceStart(preset.sourceStart);
    setSourceStop(preset.sourceStop);
    setDestination(preset.destination);
    setFareBudget(preset.fareBudget);
  };

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Route Planning */}
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -10, scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => document.getElementById('route-planning-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative mb-3">
                <div className="absolute -inset-2 rounded-full bg-blue-500/30 blur-md opacity-70 transition-opacity group-hover:opacity-100" />
                <div className="relative h-24 w-24 rounded-full border border-blue-300/30 bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl flex items-center justify-center">
                  <Route className="h-9 w-9 text-white" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-foreground">Route Planning</h3>
              <p className="text-xs text-muted-foreground mt-1">Smart route engine</p>
            </motion.button>

            {/* Hazard Reporting */}
            <Link to="/safety" className="group flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                whileHover={{ y: -10, scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                <div className="relative mb-3">
                  <div className="absolute -inset-2 rounded-full bg-orange-500/30 blur-md opacity-70 transition-opacity group-hover:opacity-100" />
                  <div className="relative h-24 w-24 rounded-full border border-orange-300/30 bg-gradient-to-br from-orange-500 to-orange-700 shadow-xl flex items-center justify-center">
                    <AlertTriangle className="h-9 w-9 text-white" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-foreground">Report Hazard</h3>
                <p className="text-xs text-muted-foreground mt-1">Live community alerts</p>
              </motion.div>
            </Link>

            {/* Police Patrol */}
            <Link to="/police-patrol" className="group flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                whileHover={{ y: -10, scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                <div className="relative mb-3">
                  <div className="absolute -inset-2 rounded-full bg-indigo-500/30 blur-md opacity-70 transition-opacity group-hover:opacity-100" />
                  <div className="relative h-24 w-24 rounded-full border border-indigo-300/30 bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-xl flex items-center justify-center">
                    <Shield className="h-9 w-9 text-white" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-foreground">Police Patrol</h3>
                <p className="text-xs text-muted-foreground mt-1">Coverage control panel</p>
              </motion.div>
            </Link>

            {/* Login */}
            <Link to="/login" className="group flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34 }}
                whileHover={{ y: -10, scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                <div className="relative mb-3">
                  <div className="absolute -inset-2 rounded-full bg-slate-500/30 blur-md opacity-70 transition-opacity group-hover:opacity-100" />
                  <div className="relative h-24 w-24 rounded-full border border-slate-300/30 bg-gradient-to-br from-slate-600 to-slate-800 shadow-xl flex items-center justify-center">
                    <Settings className="h-9 w-9 text-white" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-foreground">Login</h3>
                <p className="text-xs text-muted-foreground mt-1">Secure access</p>
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

      <section className="container mx-auto px-6 py-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 backdrop-blur-xl"
        >
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--primary)/0.24),transparent_40%),radial-gradient(circle_at_80%_50%,hsl(var(--secondary)/0.22),transparent_42%)]" />
          <div className="relative h-24 flex items-center justify-center px-6">
            <motion.div
              initial={{ scaleX: 0.6, opacity: 0.4 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.6, repeat: Infinity, repeatType: 'reverse' }}
              className="h-1.5 w-full max-w-3xl rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
            />
            <motion.div
              animate={{ x: ['-42%', '42%'] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute h-3 w-3 rounded-full bg-secondary shadow-[0_0_20px_hsl(var(--secondary)/0.8)]"
            />
            <p className="absolute text-xs md:text-sm font-medium text-muted-foreground tracking-wide">
              Route Flow Demo: Inputs &rarr; Multi-Modal Analysis &rarr; Optimal Drop Point
            </p>
          </div>
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
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-foreground">
                    Professional Demo Presets
                  </Label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {DEMO_PRESETS.map((preset) => (
                      <Button
                        key={preset.id}
                        type="button"
                        variant="outline"
                        onClick={() => applyDemoPreset(preset)}
                        className="h-auto justify-start border-primary/30 bg-primary/5 px-4 py-3 text-left hover:bg-primary/15"
                      >
                        <div className="flex items-start gap-3">
                          {preset.id === 'it-corridor' && <Briefcase className="mt-0.5 h-4 w-4 text-primary" />}
                          {preset.id === 'rmk-commute' && <GraduationCap className="mt-0.5 h-4 w-4 text-primary" />}
                          {preset.id === 'emergency-reroute' && <Siren className="mt-0.5 h-4 w-4 text-primary" />}
                          <div>
                            <p className="text-sm font-semibold text-foreground">{preset.title}</p>
                            <p className="text-xs text-muted-foreground">{preset.description}</p>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Source Start */}
                  <div className="space-y-2">
                    <Label htmlFor="sourceStart" className="text-base font-semibold text-foreground">
                      Source Start (Moving Vehicle Route)
                    </Label>
                    <SearchableZoneSelect
                      value={sourceStart}
                      onChange={setSourceStart}
                      options={enrichedSourceOptions}
                      placeholder="Select starting point..."
                    />
                  </div>

                  {/* Source Stop */}
                  <div className="space-y-2">
                    <Label htmlFor="sourceStop" className="text-base font-semibold text-foreground">
                      Source Stop (End of Vehicle Route)
                    </Label>
                    <SearchableZoneSelect
                      value={sourceStop}
                      onChange={setSourceStop}
                      options={enrichedSourceOptions}
                      placeholder="Select ending point..."
                    />
                  </div>

                  {/* Destination */}
                  <div className="space-y-2">
                    <Label htmlFor="destination" className="text-base font-semibold text-foreground">
                      Final Destination
                    </Label>
                    <SearchableZoneSelect
                      value={destination}
                      onChange={setDestination}
                      options={enrichedDestinationOptions}
                      placeholder="Where do you want to go?"
                    />
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
        {!isCalculating && plannerNotice && (
          <div className="mb-6 rounded-xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-800">
            {plannerNotice}
          </div>
        )}

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
              {(selectedSourceStop || selectedDestinationStop) && (
                <PolicePatrolInfo
                  sourceLocation={selectedSourceStop ? { lat: selectedSourceStop.lat, lng: selectedSourceStop.lng } : undefined}
                  destinationLocation={selectedDestinationStop ? { lat: selectedDestinationStop.lat, lng: selectedDestinationStop.lng } : undefined}
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
                    Branching route from the R.M.K CET shuttle to your final destination
                  </p>
                </div>
                <div className="p-8">
                  <RouteVisualization 
                    highlightedStopId={highlightedStopId}
                    optimalRoute={bestDropPoint?.optimalRoute?.segments}
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-card/50 backdrop-blur-xl border border-border/50 shadow-elevated overflow-hidden">
                <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Live Transit Command Center</h3>
                      <p className="text-muted-foreground mt-1">
                        Route-level map with service legs, ETA windows, and fare visibility for panel presentation.
                      </p>
                    </div>
                    <Badge className="bg-indigo-500/20 text-indigo-700 border border-indigo-500/30">
                      Dark Map Mode: Active
                    </Badge>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <InteractiveMap
                    stops={liveMapStops}
                    route={bestDropPoint?.optimalRoute ?? undefined}
                    optimalDropPoint={bestDropPoint?.stop}
                    externalPolyline={(gtfsLiveData?.route_shape.length ?? 0) > 1
                      ? gtfsLiveData?.route_shape.map((p) => [p.lat, p.lon])
                      : openRouteData?.geometry.map((p) => [p.lat, p.lon])}
                    liveVehicles={gtfsLiveData?.vehicles ?? []}
                    mapStyle={mapStyle}
                  />

                  {GTFS_LIVE_ENABLED ? (
                    <div className="rounded-2xl border border-border/50 bg-background/70 p-5">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h4 className="text-lg font-semibold text-foreground">Real-Time GTFS Vehicle Tracking</h4>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setGtfsAutoRefresh((v) => !v)}>
                            {gtfsAutoRefresh ? 'Auto Refresh: ON' : 'Auto Refresh: OFF'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => void fetchGtfsLiveData()}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh Now
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3 mt-4">
                        <div className="rounded-xl border border-border/40 p-3">
                          <p className="text-xs text-muted-foreground">Live Vehicles</p>
                          <p className="font-semibold">{gtfsLiveData?.vehicles.length ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-border/40 p-3">
                          <p className="text-xs text-muted-foreground">Feed Provider</p>
                          <p className="font-semibold uppercase">{gtfsLiveData?.provider ?? 'GTFS-RT'}</p>
                        </div>
                        <div className="rounded-xl border border-border/40 p-3">
                          <p className="text-xs text-muted-foreground">Route Shape Points</p>
                          <p className="font-semibold">{gtfsLiveData?.route_shape.length ?? 0}</p>
                        </div>
                      </div>

                      {gtfsLiveLoading && <p className="text-sm text-muted-foreground mt-3">Syncing GTFS-RT feed...</p>}
                      {gtfsLiveError && <p className="text-sm text-destructive mt-3">{gtfsLiveError}</p>}

                      {gtfsLiveData && gtfsLiveData.vehicles.length > 0 && (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 mt-4">
                          {gtfsLiveData.vehicles.slice(0, 12).map((vehicle, idx) => (
                            <div key={`${vehicle.entity_id}-${idx}`} className="rounded-xl border border-border/40 p-3">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold">{vehicle.route_short_name || 'Route N/A'}</p>
                                <Badge variant="outline">{vehicle.mode.toUpperCase()}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {vehicle.vehicle_label || vehicle.vehicle_id || vehicle.trip_id || 'Vehicle'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {vehicle.lat}, {vehicle.lon}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border/50 bg-background/70 p-5">
                      <h4 className="text-lg font-semibold text-foreground">Real-Time GTFS Vehicle Tracking</h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        Live vehicle feed demo controls are hidden for presentation mode until GTFS endpoint setup is finalized.
                      </p>
                    </div>
                  )}

                  {backendRouteData && (
                    <div className="rounded-2xl border border-border/50 bg-background/70 p-5">
                      <h4 className="text-lg font-semibold text-foreground">Backend Route Engine (Live)</h4>
                      <div className="grid gap-3 md:grid-cols-4 mt-3">
                        <div className="rounded-xl border border-border/40 p-3">
                          <p className="text-xs text-muted-foreground">Distance</p>
                          <p className="font-semibold">{backendRouteData.total_distance} km</p>
                        </div>
                        <div className="rounded-xl border border-border/40 p-3">
                          <p className="text-xs text-muted-foreground">Travel Time</p>
                          <p className="font-semibold">{backendRouteData.total_time} min</p>
                        </div>
                        <div className="rounded-xl border border-border/40 p-3">
                          <p className="text-xs text-muted-foreground">Fare</p>
                          <p className="font-semibold">₹{backendRouteData.total_fare}</p>
                        </div>
                        <div className="rounded-xl border border-border/40 p-3">
                          <p className="text-xs text-muted-foreground">Avg Safety</p>
                          <p className="font-semibold">{backendRouteData.average_safety_score}/10</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-border/50 bg-background/70 p-5">
                    <h4 className="text-lg font-semibold text-foreground">Open Map Stack Strategy</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Frontend alternatives reviewed: FacilMap, Mapcarta, and OpenStreetMap ecosystem. For production-safe API usage,
                      this platform uses OpenStreetMap-backed services (OSRM routing and Nominatim geocoding) and optional Google Transit enrichment.
                    </p>
                    <div className="grid gap-3 md:grid-cols-3 mt-4">
                      <div className="rounded-xl border border-border/40 p-3">
                        <p className="font-semibold text-sm">FacilMap</p>
                        <p className="text-xs text-muted-foreground mt-1">Great frontend UX, but not positioned as your dedicated API backend.</p>
                      </div>
                      <div className="rounded-xl border border-border/40 p-3">
                        <p className="font-semibold text-sm">Mapcarta</p>
                        <p className="text-xs text-muted-foreground mt-1">Consumer map experience, no clear general-purpose public API for app backend integration.</p>
                      </div>
                      <div className="rounded-xl border border-border/40 p-3">
                        <p className="font-semibold text-sm">OpenStreetMap Stack</p>
                        <p className="text-xs text-muted-foreground mt-1">Open data + proven APIs via Nominatim/OSRM, ideal for your project defense.</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/50 bg-background/70 p-5">
                    <h4 className="text-lg font-semibold text-foreground">Open Route Intelligence</h4>
                    {openRouteError && <p className="text-sm text-destructive mt-2">{openRouteError}</p>}
                    {openRouteData && (
                      <div className="grid gap-3 md:grid-cols-3 mt-3">
                        <div className="rounded-xl border border-border/40 p-3">
                          <p className="text-xs text-muted-foreground">Provider</p>
                          <p className="font-semibold uppercase">{openRouteData.provider}</p>
                        </div>
                        <div className="rounded-xl border border-border/40 p-3">
                          <p className="text-xs text-muted-foreground">Distance</p>
                          <p className="font-semibold">{openRouteData.distance_km} km</p>
                        </div>
                        <div className="rounded-xl border border-border/40 p-3">
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-semibold">{openRouteData.duration_min} min</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {GOOGLE_TRANSIT_ENABLED && (
                    <div className="rounded-2xl border border-border/50 bg-background/70 p-5">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h4 className="text-lg font-semibold text-foreground">Google Transit Intelligence</h4>
                        {googleTransitLoading && <Badge variant="outline">Syncing live feed...</Badge>}
                      </div>

                      {googleTransitError && (
                        <p className="text-sm text-destructive mt-2">{googleTransitError}</p>
                      )}

                      {!googleTransitLoading && googleTransitData && (
                        <div className="mt-4 space-y-4">
                          <div className="grid gap-3 md:grid-cols-4">
                            <div className="rounded-xl border border-border/40 p-3">
                              <p className="text-xs text-muted-foreground">Duration</p>
                              <p className="font-semibold">{googleTransitData.duration_text ?? 'N/A'}</p>
                            </div>
                            <div className="rounded-xl border border-border/40 p-3">
                              <p className="text-xs text-muted-foreground">Distance</p>
                              <p className="font-semibold">{googleTransitData.distance_text ?? 'N/A'}</p>
                            </div>
                            <div className="rounded-xl border border-border/40 p-3">
                              <p className="text-xs text-muted-foreground">Estimated Fare</p>
                              <p className="font-semibold">{googleTransitData.fare_text ?? 'Provider not available'}</p>
                            </div>
                            <div className="rounded-xl border border-border/40 p-3">
                              <p className="text-xs text-muted-foreground">Provider</p>
                              <p className="font-semibold uppercase">{googleTransitData.provider}</p>
                            </div>
                          </div>

                          {googleTransitData.steps.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-foreground">Transit Legs and Service Numbers</p>
                              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {googleTransitData.steps.map((step, idx) => (
                                  <div key={`${step.line_short_name || step.line_name || step.travel_mode}-${idx}`} className="rounded-xl border border-border/40 p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <Badge variant="outline">{step.travel_mode}</Badge>
                                      <span className="text-xs text-muted-foreground">{step.vehicle_type || 'N/A'}</span>
                                    </div>
                                    <p className="text-sm font-semibold">{step.line_short_name || step.line_name || 'Walking / Transfer'}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {step.departure_stop && step.arrival_stop
                                        ? `${step.departure_stop} to ${step.arrival_stop}`
                                        : 'Interchange leg'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {step.duration_text || 'N/A'} {step.num_stops ? `• ${step.num_stops} stops` : ''}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {bestDropPoint?.optimalRoute && bestDropPoint.optimalRoute.segments.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {bestDropPoint.optimalRoute.segments.map((segment, index) => (
                        <div
                          key={`${segment.routeName}-${index}`}
                          className="rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">Leg {index + 1}</Badge>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">{segment.mode}</span>
                          </div>
                          <p className="font-semibold text-foreground">{segment.routeName}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {segment.from.name} to {segment.to.name}
                          </p>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">ETA</span>
                            <span className="font-semibold text-foreground">{segment.time + (segment.waitTime ?? 0)} min</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Fare</span>
                            <span className="font-semibold text-foreground">₹{segment.fare}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                      Evaluates each stop along the R.M.K CET shuttle route as a potential drop point
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
