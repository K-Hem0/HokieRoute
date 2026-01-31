import { Route } from "@/lib/mock-data";
import { Mode } from "@/components/ui/ModeToggle";
import { Navigation, X, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface NavigationStatusBarProps {
  route: Route;
  mode: Mode;
  onStop: () => void;
  elapsedMin?: number;
  /** Compact mode for live navigation state */
  compact?: boolean;
}

const NavigationStatusBar = ({ 
  route, 
  mode, 
  onStop, 
  elapsedMin = 0,
  compact = false 
}: NavigationStatusBarProps) => {
  const totalDuration = mode === 'walk' ? route.duration_walk_min : route.duration_cycle_min;
  const remainingMin = Math.max(0, totalDuration - elapsedMin);
  const remainingKm = (route.distance_km * (remainingMin / totalDuration)).toFixed(1);
  const progress = ((totalDuration - remainingMin) / totalDuration) * 100;

  // Compact version - minimal status bar at bottom
  if (compact) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="absolute inset-x-0 bottom-0 z-30 p-4 pb-safe-bottom"
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
            <div className="flex items-center justify-between px-4 py-3">
              {/* Navigation icon and destination */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
                  <Navigation className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Navigating</p>
                  <p className="text-sm font-semibold text-foreground truncate max-w-[120px]">
                    {route.name}
                  </p>
                </div>
              </div>

              {/* Stats - compact */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground tabular-nums">{remainingMin}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">min</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground tabular-nums">{remainingKm}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">km</p>
                </div>
              </div>

              {/* Stop button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onStop}
                className="h-9 px-3 rounded-full hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">End</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full version - top status bar (legacy, keeping for reference)
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="absolute inset-x-0 top-0 z-20 p-4 pt-safe"
    >
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card shadow-lg">
        {/* Progress bar */}
        <div className="h-1 w-full overflow-hidden rounded-t-2xl bg-secondary">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="p-4">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Navigation className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Navigating to</p>
                <p className="text-sm font-semibold text-foreground">{route.name}</p>
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

          {/* Stats */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{remainingMin}</p>
                <p className="text-xs text-muted-foreground">min left</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{remainingKm}</p>
                <p className="text-xs text-muted-foreground">km left</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export { NavigationStatusBar };
