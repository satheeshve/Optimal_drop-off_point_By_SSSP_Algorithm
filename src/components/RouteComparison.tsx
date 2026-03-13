import { motion } from 'framer-motion';
import { Clock, IndianRupee, ArrowRight, Award, Shield } from 'lucide-react';
import { DropPoint, calculateCrimeScore, getPolicePatrolsOnRoute, getCrimeRateLabel } from '@/data/transportData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RouteComparisonProps {
  dropPoints: DropPoint[];
  bestDropPoint: DropPoint | null;
}

const RouteComparison = ({ dropPoints, bestDropPoint }: RouteComparisonProps) => {
  if (dropPoints.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Award className="w-6 h-6 text-accent" />
        Route Analysis
      </h2>

      <div className="grid gap-4">
        {dropPoints.map((dropPoint, index) => {
          const isBest = bestDropPoint?.stop.id === dropPoint.stop.id;
          const route = dropPoint.optimalRoute;

          if (!route) return null;

          // Calculate crime score for the route
          const routeStops = route.segments.flatMap(seg => [seg.from, seg.to]);
          const crimeScore = route.crimeScore || calculateCrimeScore(routeStops);
          const policePatrols = route.policePatrols || getPolicePatrolsOnRoute(routeStops);
          const crimeLabel = getCrimeRateLabel(crimeScore);

          return (
            <motion.div
              key={dropPoint.stop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`transition-all duration-300 ${
                  isBest
                    ? 'border-2 border-accent shadow-elevated bg-gradient-to-br from-accent/5 to-accent/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {dropPoint.stop.name}
                      {isBest && (
                        <Badge className="bg-accent text-accent-foreground">
                          Best Option ⭐
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`flex items-center gap-1 ${
                          crimeScore >= 80 ? 'bg-green-500/20 text-green-700 border-green-500/30' :
                          crimeScore >= 60 ? 'bg-blue-500/20 text-blue-700 border-blue-500/30' :
                          crimeScore >= 40 ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' :
                          'bg-red-500/20 text-red-700 border-red-500/30'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {crimeLabel}
                      </Badge>
                      {policePatrols.length > 0 && (
                        <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">
                          🚔 {policePatrols.length} Patrol{policePatrols.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="font-semibold text-sm">{route.totalTime} min</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-secondary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Fare</p>
                        <p className="font-semibold text-sm">₹{route.totalFare}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-xs text-muted-foreground">Transfers</p>
                        <p className="font-semibold text-sm">{route.transfers}</p>
                      </div>
                    </div>
                  </div>

                  {/* Route segments */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Route Details:</p>
                    {route.segments.map((segment, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30"
                      >
                        <Badge
                          variant="outline"
                          className={
                            segment.mode === 'bus'
                              ? 'border-secondary text-secondary'
                              : 'border-primary text-primary'
                          }
                        >
                          {segment.routeName}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {segment.time} min · ₹{segment.fare}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Optimization score */}
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Optimization Score:</span>
                      <span
                        className={`text-sm font-semibold ${
                          isBest ? 'text-accent' : 'text-foreground'
                        }`}
                      >
                        {(route.score * 100).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteComparison;
