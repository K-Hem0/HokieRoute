import { Route } from "@/lib/mock-data";
import { FeatureBadge } from "@/components/ui/FeatureBadge";
import { MapPin, Clock, ChevronRight, Lightbulb, CheckCircle, Phone, ArrowRight, Camera, Info, Building2, Users, TreePine } from "lucide-react";
import { Mode } from "@/components/ui/ModeToggle";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RouteCardProps {
  route: Route;
  mode: Mode;
  onClick?: () => void;
  variant?: "compact" | "full";
}

const iconMap: Record<string, LucideIcon> = {
  Lightbulb,
  CheckCircle,
  Phone,
  ArrowRight,
  Camera,
  Building2,
  Users,
  TreePine,
};

// Generate a helpful context label based on route characteristics
const getRouteContext = (route: Route): { label: string; icon: LucideIcon; tooltip: string } => {
  // Check badges and description for context clues
  const badgeLabels = route.badges.map(b => b.label.toLowerCase()).join(' ');
  const description = route.description.toLowerCase();
  const name = route.name.toLowerCase();
  
  if (description.includes('trail') || name.includes('trail')) {
    return {
      label: "Quieter path",
      icon: TreePine,
      tooltip: "This route uses trails with less vehicle traffic"
    };
  }
  
  if (description.includes('downtown') || description.includes('main street') || badgeLabels.includes('busy')) {
    return {
      label: "More active area",
      icon: Users,
      tooltip: "Passes through busier areas with more people around"
    };
  }
  
  if (description.includes('campus') || description.includes('academic') || name.includes('campus')) {
    return {
      label: "Near buildings",
      icon: Building2,
      tooltip: "Stays close to campus buildings and lit areas"
    };
  }
  
  if (badgeLabels.includes('well-lit') || badgeLabels.includes('lit')) {
    return {
      label: "Well-lit route",
      icon: Lightbulb,
      tooltip: "Good lighting along most of this path"
    };
  }
  
  return {
    label: "Direct route",
    icon: ArrowRight,
    tooltip: "A straightforward path to your destination"
  };
};

const RouteCard = ({ route, mode, onClick, variant = "compact" }: RouteCardProps) => {
  const duration = mode === 'walk' ? route.duration_walk_min : route.duration_cycle_min;
  const durationLabel = mode === 'walk' ? 'walk' : 'ride';
  const context = getRouteContext(route);
  const ContextIcon = context.icon;

  // Select top 2 most relevant badges
  const displayBadges = route.badges.slice(0, 2);

  return (
    <TooltipProvider>
      <button
        onClick={onClick}
        className={cn(
          "group w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80",
          variant === "full" && "p-5"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            {/* Route name and context */}
            <div className="space-y-1">
              <h3 className={cn(
                "font-semibold text-foreground tracking-tight",
                variant === "compact" ? "text-sm" : "text-base"
              )}>
                {route.name}
              </h3>
              
              {/* Contextual interpretation label */}
              <div className="flex items-center gap-1.5">
                <ContextIcon className="h-3 w-3 text-muted-foreground/70" />
                <span className="text-xs text-muted-foreground/70">{context.label}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                    {context.tooltip}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            {/* Distance and time - 8px gap */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {route.distance_km} km
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {duration} min {durationLabel}
              </span>
            </div>

            {/* Feature Badges - show top 2 */}
            {displayBadges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {displayBadges.map((badge) => (
                  <FeatureBadge
                    key={badge.id}
                    label={badge.label}
                    icon={iconMap[badge.icon]}
                    variant={badge.type === 'verified' ? 'verified' : badge.type === 'safety' ? 'safety' : 'default'}
                  />
                ))}
              </div>
            )}

            {variant === "full" && (
              <p className="text-sm text-muted-foreground line-clamp-2 pt-1">
                {route.description}
              </p>
            )}
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
      </button>
    </TooltipProvider>
  );
};

export { RouteCard };
