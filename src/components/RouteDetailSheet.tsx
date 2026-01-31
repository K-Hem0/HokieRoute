import { Route } from "@/lib/mock-data";
import { ModeToggle, Mode } from "@/components/ui/ModeToggle";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/BottomSheet";
import { MapPin, Clock, Heart, Navigation } from "lucide-react";

interface RouteDetailSheetProps {
  route: Route | null;
  isOpen: boolean;
  onClose: () => void;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onSave?: () => void;
  onStart?: () => void;
  isSaved?: boolean;
}

const RouteDetailSheet = ({
  route,
  isOpen,
  onClose,
  mode,
  onModeChange,
  onSave,
  onStart,
  isSaved = false,
}: RouteDetailSheetProps) => {
  if (!route) return null;

  const duration = mode === 'walk' ? route.duration_walk_min : route.duration_cycle_min;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} snapPoints={[0.55, 0.85]}>
      <div className="space-y-6 py-4">
        {/* Header */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">{route.name}</h2>
            {route.contextLabel && (
              <p className="text-xs text-primary font-medium">{route.contextLabel}</p>
            )}
            <p className="text-sm text-muted-foreground">{route.description}</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <ModeToggle mode={mode} onChange={onModeChange} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-secondary p-4 text-center">
            <MapPin className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-lg font-bold text-foreground">{route.distance_km} km</p>
            <p className="text-xs text-muted-foreground">Distance</p>
          </div>
          <div className="rounded-xl bg-secondary p-4 text-center">
            <Clock className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-lg font-bold text-foreground">{duration} min</p>
            <p className="text-xs text-muted-foreground">Duration</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant={isSaved ? "secondary" : "outline"}
            className="flex-1"
            onClick={onSave}
          >
            <Heart className={isSaved ? "fill-current text-primary" : ""} />
            {isSaved ? "Saved" : "Save Route"}
          </Button>
          <Button className="flex-1" onClick={onStart}>
            <Navigation />
            Start Route
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

export { RouteDetailSheet };
