import { motion } from 'framer-motion';
import { TrendingDown, CheckCircle, Clock, IndianRupee } from 'lucide-react';
import { DropPoint } from '@/data/transportData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OptimalRecommendationProps {
  bestDropPoint: DropPoint | null;
  onHighlight: (stopId: string) => void;
}

const OptimalRecommendation = ({ bestDropPoint, onHighlight }: OptimalRecommendationProps) => {
  if (!bestDropPoint || !bestDropPoint.optimalRoute) return null;

  const route = bestDropPoint.optimalRoute;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/95 to-card/90 border-2 border-accent/50 shadow-elevated backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="relative p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center flex-shrink-0 shadow-glow">
              <TrendingDown className="w-8 h-8 text-black" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">Optimal Route Found!</h2>
              <p className="text-base text-muted-foreground">
                Get down at <span className="font-bold text-accent">{bestDropPoint.stop.name}</span> for the fastest, most efficient journey home
              </p>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/30">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Time</p>
                <p className="text-2xl font-bold text-foreground">{route.totalTime} <span className="text-sm">min</span></p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-transparent border border-secondary/30">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Fare</p>
                <p className="text-2xl font-bold text-foreground">₹{route.totalFare}</p>
              </div>
            </div>
          </div>

          {/* Journey breakdown */}
          <div className="space-y-3 p-6 rounded-2xl bg-background/30 border border-border/50">
            <p className="text-sm font-semibold text-foreground uppercase tracking-wide">Journey Breakdown</p>
            {route.segments.map((segment, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Take <span className="font-semibold text-foreground">{segment.routeName}</span>{' '}
                  from <span className="text-foreground">{segment.from.name}</span> to <span className="text-foreground">{segment.to.name}</span>
                  <span className="text-xs ml-2 text-muted-foreground">({segment.time} min · ₹{segment.fare})</span>
                </p>
              </div>
            ))}
          </div>

          {/* Action button */}
          <Button
            onClick={() => onHighlight(bestDropPoint.stop.id)}
            className="w-full h-14 bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-black font-semibold text-base rounded-2xl shadow-lg"
          >
            Show on Route Map
          </Button>

          {/* Savings indicator */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30">
            <p className="text-sm text-center text-foreground font-medium">
              💡 This route saves you significant time and money compared to staying on the college bus!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OptimalRecommendation;
