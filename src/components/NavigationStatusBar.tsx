import { Route } from "@/lib/mock-data";
import { Mode } from "@/components/ui/ModeToggle";
import { Navigation, X, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface NavigationStatusBarProps {
  route: Route;
  mode: Mode;
  onStop: () => void;
  elapsedMin?: number;
}

const NavigationStatusBar = ({ route, mode, onStop, elapsedMin = 0 }: NavigationStatusBarProps) => {
  const totalDuration = mode === 'walk' ? route.duration_walk_min : route.duration_cycle_min;
  const remainingMin = Math.max(0, totalDuration - elapsedMin);
  const remainingKm = (route.distance_km * (remainingMin / totalDuration)).toFixed(1);
  const progress = ((totalDuration - remainingMin) / totalDuration) * 100;

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
