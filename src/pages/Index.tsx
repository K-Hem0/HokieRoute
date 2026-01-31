import { useState } from "react";
import { MapView } from "@/components/MapView";
import { PillInput } from "@/components/ui/PillInput";
import { ModeToggle, Mode } from "@/components/ui/ModeToggle";
import { RouteCard } from "@/components/RouteCard";
import { RouteDetailSheet } from "@/components/RouteDetailSheet";
import { BottomSheet } from "@/components/BottomSheet";
import { AuthSheet } from "@/components/AuthSheet";
import { SavedRoutesSheet } from "@/components/SavedRoutesSheet";
import { Route } from "@/lib/mock-data";
import { useRoutes } from "@/hooks/useRoutes";
import { useAuth } from "@/hooks/useAuth";
import { useSavedRoutes } from "@/hooks/useSavedRoutes";
import { Heart, Search, User, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Index = () => {
  const [mode, setMode] = useState<Mode>("walk");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showRouteDetail, setShowRouteDetail] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { routes, loading: routesLoading } = useRoutes();
  const { user, signOut } = useAuth();
  const { savedRouteIds, toggleSaveRoute, unsaveRoute, isRouteSaved } = useSavedRoutes();

  const nearbyRoutes = routes.slice(0, 3);
  
  const filteredRoutes = routes.filter((route) =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setShowDiscovery(false);
    setShowSaved(false);
    setShowRouteDetail(true);
  };

  const handleSaveRoute = async () => {
    if (!selectedRoute) return;
    
    if (!user) {
      setShowAuth(true);
      return;
    }

    await toggleSaveRoute(selectedRoute.id);
  };

  const handleStartRoute = () => {
    toast.info("Navigation coming soon!");
  };

  const handleSavedClick = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setShowSaved(true);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background dark">
      {/* Map */}
      <MapView
        selectedRoute={selectedRoute}
        onMapClick={() => {
          if (!showDiscovery && !showRouteDetail && !showSaved) {
            setSelectedRoute(null);
          }
        }}
      />

      {/* Top Overlay */}
      <div className="absolute inset-x-0 top-0 z-10 p-4 pt-safe">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <PillInput
            placeholder="Where are you going?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowDiscovery(true)}
            icon={<Search className="h-5 w-5 text-muted-foreground" />}
          />
        </motion.div>
      </div>

      {/* User/Auth Button */}
      <Button
        size="icon"
        className="absolute left-4 top-20 z-10 h-12 w-12 rounded-full shadow-lg"
        variant="secondary"
        onClick={user ? handleSignOut : () => setShowAuth(true)}
      >
        {user ? <LogOut className="h-5 w-5" /> : <User className="h-5 w-5" />}
      </Button>

      {/* Saved Routes FAB */}
      <Button
        size="icon"
        className="absolute right-4 top-20 z-10 h-12 w-12 rounded-full shadow-lg"
        variant="secondary"
        onClick={handleSavedClick}
      >
        <Heart className={`h-5 w-5 ${user && savedRouteIds.length > 0 ? "fill-primary text-primary" : ""}`} />
      </Button>

      {/* Bottom Quick Access (when no sheet is open) */}
      {!showDiscovery && !showRouteDetail && !showSaved && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="absolute inset-x-0 bottom-0 z-10 space-y-3 p-4 pb-safe-bottom"
        >
          {/* Mode Toggle */}
          <div className="flex justify-center">
            <ModeToggle mode={mode} onChange={setMode} />
          </div>

          {/* Nearby Routes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-medium text-foreground">Nearby Routes</h3>
              <button
                onClick={() => setShowDiscovery(true)}
                className="text-xs text-primary hover:underline"
              >
                View all
              </button>
            </div>
            {routesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {nearbyRoutes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    mode={mode}
                    onClick={() => handleRouteSelect(route)}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Route Discovery Sheet */}
      <BottomSheet
        isOpen={showDiscovery}
        onClose={() => {
          setShowDiscovery(false);
          setSearchQuery("");
        }}
        title="Discover Routes"
        snapPoints={[0.6, 0.9]}
      >
        <div className="space-y-4 py-4">
          {/* Search */}
          <PillInput
            placeholder="Search routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />

          {/* Mode Toggle */}
          <div className="flex justify-center">
            <ModeToggle mode={mode} onChange={setMode} />
          </div>

          {/* Route List */}
          <div className="space-y-2 pt-2">
            {routesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredRoutes.length > 0 ? (
              filteredRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  mode={mode}
                  variant="full"
                  onClick={() => handleRouteSelect(route)}
                />
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No routes found</p>
              </div>
            )}
          </div>
        </div>
      </BottomSheet>

      {/* Saved Routes Sheet */}
      <SavedRoutesSheet
        isOpen={showSaved}
        onClose={() => setShowSaved(false)}
        routes={routes}
        savedRouteIds={savedRouteIds}
        mode={mode}
        onRouteSelect={handleRouteSelect}
        onUnsave={unsaveRoute}
      />

      {/* Route Detail Sheet */}
      <RouteDetailSheet
        route={selectedRoute}
        isOpen={showRouteDetail}
        onClose={() => {
          setShowRouteDetail(false);
          setSelectedRoute(null);
        }}
        mode={mode}
        onModeChange={setMode}
        onSave={handleSaveRoute}
        onStart={handleStartRoute}
        isSaved={selectedRoute ? isRouteSaved(selectedRoute.id) : false}
      />

      {/* Auth Sheet */}
      <AuthSheet
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
      />
    </div>
  );
};

export default Index;
