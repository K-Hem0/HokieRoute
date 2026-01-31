import { Route } from "@/lib/mock-data";
import { SafetyBadge } from "@/components/ui/SafetyBadge";
import { MapPin, Clock, ChevronRight } from "lucide-react";
import { Mode } from "@/components/ui/ModeToggle";
import { cn } from "@/lib/utils";

interface RouteCardProps {
  route: Route;
  mode: Mode;
  onClick?: () => void;
  variant?: "compact" | "full";
}

const RouteCard = ({ route, mode, onClick, variant = "compact" }: RouteCardProps) => {
  const duration = mode === 'walk' ? route.duration_walk_min : route.duration_cycle_min;
  const durationLabel = mode === 'walk' ? 'walk' : 'ride';

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80",
        variant === "full" && "p-5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-semibold text-foreground",
              variant === "compact" ? "text-sm" : "text-base"
            )}>
              {route.name}
            </h3>
            <SafetyBadge level={route.safety_score} size="sm" showIcon={false} />
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {route.distance_km} km
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {duration} min {durationLabel}
            </span>
          </div>

          {variant === "full" && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {route.description}
            </p>
          )}
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </button>
  );
};

export { RouteCard };
