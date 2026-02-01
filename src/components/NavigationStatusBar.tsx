import { Route } from "@/lib/mock-data";
import { Mode } from "@/components/ui/ModeToggle";
import { Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface NavigationStatusBarProps {
  /** Preset route (optional) */
  route?: Route | null;
  /** Calculated route data (optional) - used when navigating from search */
  calculatedRoute?: {
    distance: number; // meters
    duration: number; // seconds
  } | null;
  /** Destination name for calculated routes */
  destinationName?: string;
  mode: Mode;
  onStop: () => void;
  elapsedMin?: number;
  /** Compact mode for live navigation state */
  compact?: boolean;
}

const NavigationStatusBar = ({ 
  route, 
  calculatedRoute,
  destinationName,
  mode, 
  onStop, 
  elapsedMin = 0,
  compact = false 
}: NavigationStatusBarProps) => {
  // Calculate values based on preset route or calculated route
  let totalDurationMin: number;
  let totalDistanceKm: number;
  let name: string;

  if (route) {
    totalDurationMin = mode === 'walk' ? route.duration_walk_min : route.duration_cycle_min;
    totalDistanceKm = route.distance_km;
    name = route.name;
  } else if (calculatedRoute) {
    totalDurationMin = Math.round(calculatedRoute.duration / 60);
    totalDistanceKm = calculatedRoute.distance / 1000;
    name = destinationName || "Destination";
  } else {
    return null;
  }

  const remainingMin = Math.max(0, totalDurationMin - elapsedMin);
  const remainingKm = (totalDistanceKm * (remainingMin / Math.max(totalDurationMin, 1))).toFixed(1);
  const progress = totalDurationMin > 0 ? ((totalDurationMin - remainingMin) / totalDurationMin) * 100 : 0;

  // Compact version - minimal status bar at bottom
  if (compact) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="absolute inset-x-0 bottom-0 z-[40] px-3 sm:px-4 pb-[calc(env(safe-area-inset-bottom)+8px)] sm:pb-[calc(env(safe-area-inset-bottom)+12px)]"
      >
        <div className="mx-auto max-w-md">
          {/* Progress bar outside card */}
          <div className="h-1 w-full overflow-hidden rounded-t-xl bg-secondary/50">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="rounded-b-xl border border-t-0 border-border bg-card/95 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 gap-2">
              {/* Navigation icon and destination */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 flex-shrink-0">
                  <Navigation className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Navigating</p>
                  <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                    {name}
                  </p>
                </div>
              </div>

              {/* Stats - compact */}
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <div className="text-center">
                  <p className="text-base sm:text-lg font-bold text-foreground tabular-nums">{remainingMin}</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">min</p>
                </div>
                <div className="h-6 sm:h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="text-base sm:text-lg font-bold text-foreground tabular-nums">{remainingKm}</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">km</p>
                </div>
              </div>

              {/* Stop button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onStop}
                className="h-9 px-2 sm:px-3 rounded-full hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-transform flex-shrink-0"
              >
                <X className="h-4 w-4 sm:mr-1" />
                <span className="text-xs font-medium hidden sm:inline">End</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full version (legacy)
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="absolute inset-x-0 top-0 z-20 p-4 pt-safe"
    >
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card shadow-lg">
        <div className="h-1 w-full overflow-hidden rounded-t-2xl bg-secondary">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Navigation className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Navigating to</p>
                <p className="text-sm font-semibold text-foreground">{name}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onStop}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{remainingMin}</p>
              <p className="text-xs text-muted-foreground">min left</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{remainingKm}</p>
              <p className="text-xs text-muted-foreground">km left</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export { NavigationStatusBar };
