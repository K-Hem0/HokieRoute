import { useState } from "react";
import { Route } from "@/lib/mock-data";
import { RouteCard } from "@/components/RouteCard";
import { BottomSheet } from "@/components/BottomSheet";
import { Mode } from "@/components/ui/ModeToggle";
import { Heart } from "lucide-react";

interface SavedRoutesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  routes: Route[];
  savedRouteIds: string[];
  mode: Mode;
  onRouteSelect: (route: Route) => void;
  onUnsave: (routeId: string) => void;
}

const SavedRoutesSheet = ({
  isOpen,
  onClose,
  routes,
  savedRouteIds,
  mode,
  onRouteSelect,
  onUnsave,
}: SavedRoutesSheetProps) => {
  const savedRoutes = routes.filter((route) => savedRouteIds.includes(route.id));

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Saved Routes" snapPoints={[0.5, 0.85]}>
      <div className="space-y-4 py-4">
        {savedRoutes.length > 0 ? (
          <div className="space-y-2">
            {savedRoutes.map((route) => (
              <div key={route.id} className="relative">
                <RouteCard
                  route={route}
                  mode={mode}
                  variant="full"
                  onClick={() => onRouteSelect(route)}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnsave(route.id);
                  }}
                  className="absolute right-4 top-4 rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Heart className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No saved routes yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap the heart icon on any route to save it
            </p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

export { SavedRoutesSheet };
