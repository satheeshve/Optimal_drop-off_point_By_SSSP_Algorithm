import { motion } from 'framer-motion';
import { Bus, Train, MapPin, ArrowRight } from 'lucide-react';
import { COLLEGE_BUS_ROUTE, HOME } from '@/data/transportData';
import type { RouteSegment } from '@/data/transportData';

interface RouteVisualizationProps {
  highlightedStopId?: string;
  optimalRoute?: RouteSegment[];
}

const RouteVisualization = ({ highlightedStopId, optimalRoute }: RouteVisualizationProps) => {
  const optimalStopIndex = COLLEGE_BUS_ROUTE.stops.findIndex(stop => stop.id === highlightedStopId);
  
  return (
    <div className="relative w-full py-8">
      {/* Main Bus Route Line - Vertical */}
      <div className="absolute left-8 top-16 w-1 bg-gradient-to-b from-primary via-secondary to-primary rounded-full" 
           style={{ height: optimalStopIndex >= 0 ? `${(optimalStopIndex + 1) * 88}px` : '100%' }} />

      {/* Stops */}
      <div className="space-y-6 relative">
        {COLLEGE_BUS_ROUTE.stops.map((stop, index) => {
          const isHighlighted = stop.id === highlightedStopId;
          const isLast = index === COLLEGE_BUS_ROUTE.stops.length - 1;

          return (
            <motion.div
              key={stop.id}
              className="flex items-center gap-4 relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Stop Marker */}
              <div
                className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-gradient-to-br from-accent to-accent/80 shadow-lg scale-110'
                    : 'bg-gradient-to-br from-primary to-primary/80'
                }`}
              >
                {stop.type === 'metro' ? (
                  <Train className="w-7 h-7 text-white" />
                ) : (
                  <Bus className="w-7 h-7 text-white" />
                )}
              </div>

              {/* Stop Info */}
              <div
                className={`flex-1 p-4 rounded-lg transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-card shadow-elevated border-2 border-accent'
                    : 'bg-card/50 border border-border'
                }`}
              >
                <h3 className={`font-semibold ${isHighlighted ? 'text-accent' : 'text-foreground'}`}>
                  {stop.name}
                </h3>
                <p className="text-sm text-muted-foreground capitalize">{stop.type} Stop</p>
                {isHighlighted && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-accent mt-1 font-medium"
                  >
                    ✓ Optimal Drop Point
                  </motion.p>
                )}
              </div>

              {/* Distance indicator */}
              {!isLast && (
                <div className="absolute left-[2.1rem] top-16 text-xs text-muted-foreground bg-background px-2 py-1 rounded-full border border-border">
                  ~25 min
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Branching Route - Onward Journey from Optimal Drop Point */}
        {highlightedStopId && optimalRoute && optimalRoute.length > 0 && (
          <div className="relative ml-16 mt-8">
            {/* Branching connector line */}
            <div className="absolute -left-8 top-0 w-8 h-1 bg-gradient-to-r from-accent to-accent/50" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mb-6 ml-4"
            >
              <ArrowRight className="w-5 h-5 text-accent animate-pulse" />
              <span className="text-sm font-semibold text-accent">Onward Journey</span>
            </motion.div>

            {/* Branching route stops */}
            <div className="relative ml-4">
              {/* Horizontal route line */}
              <div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-accent via-accent/70 to-secondary rounded-full" />
              
              <div className="space-y-6">
                {optimalRoute.map((segment, index) => {
                  const isLast = index === optimalRoute.length - 1;
                  const RouteIcon = segment.mode === 'metro' ? Train : Bus;
                  
                  return (
                    <motion.div
                      key={`${segment.from.id}-${segment.to.id}-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.15 }}
                      className="relative"
                    >
                      {/* From Stop */}
                      {index === 0 && (
                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 p-3 rounded-lg bg-card/80 backdrop-blur-sm border border-accent/50">
                            <h4 className="font-medium text-accent text-sm">{segment.from.name}</h4>
                            <p className="text-xs text-muted-foreground">Transfer Point</p>
                          </div>
                        </div>
                      )}

                      {/* Route segment info */}
                      <div className="flex items-center gap-4 ml-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 backdrop-blur-sm flex items-center justify-center border border-accent/30">
                          <RouteIcon className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1 p-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                          <p className="text-xs font-medium text-accent">{segment.routeName}</p>
                          <p className="text-xs text-muted-foreground">{segment.time} min</p>
                        </div>
                      </div>

                      {/* Connection line */}
                      {!isLast && (
                        <div className="absolute left-6 top-[52px] h-12 w-1 bg-gradient-to-b from-accent/50 to-accent/30" />
                      )}

                      {/* To Stop */}
                      <div className="flex items-center gap-4 mt-6">
                        <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          isLast 
                            ? 'bg-gradient-to-br from-secondary to-secondary/80' 
                            : 'bg-gradient-to-br from-accent/70 to-accent/50'
                        }`}>
                          {isLast ? (
                            <MapPin className="w-5 h-5 text-white" />
                          ) : (
                            <MapPin className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className={`flex-1 p-3 rounded-lg backdrop-blur-sm ${
                          isLast
                            ? 'bg-card border-2 border-secondary shadow-elevated'
                            : 'bg-card/80 border border-accent/50'
                        }`}>
                          <h4 className={`font-medium text-sm ${isLast ? 'text-secondary' : 'text-accent'}`}>
                            {segment.to.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {isLast ? 'Final Destination 🏠' : 'Via Stop'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteVisualization;
