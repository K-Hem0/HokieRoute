import { useState, useEffect } from "react";
import { MapView } from "@/components/MapView";
import { PillInput } from "@/components/ui/PillInput";
import { ModeToggle, Mode } from "@/components/ui/ModeToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { RouteCard } from "@/components/RouteCard";
import { RouteDetailSheet } from "@/components/RouteDetailSheet";
import { BottomSheet } from "@/components/BottomSheet";
import { AuthSheet } from "@/components/AuthSheet";
import { SavedRoutesSheet } from "@/components/SavedRoutesSheet";
import { ReportModal } from "@/components/ReportModal";
import { NavigationStatusBar } from "@/components/NavigationStatusBar";
import { Route } from "@/lib/mock-data";
import { useRoutes } from "@/hooks/useRoutes";
import { useAuth } from "@/hooks/useAuth";
import { useSavedRoutes } from "@/hooks/useSavedRoutes";
import { useTheme } from "@/hooks/useTheme";
import { Heart, Search, User, LogOut, Loader2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const Map = () => {
  const [mode, setMode] = useState<Mode>("walk");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showRouteDetail, setShowRouteDetail] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [navElapsedMin, setNavElapsedMin] = useState(0);

  const { routes, loading: routesLoading } = useRoutes();
  const { user, signOut } = useAuth();
  const { savedRouteIds, toggleSaveRoute, unsaveRoute, isRouteSaved } = useSavedRoutes();
  const { isDark, toggleTheme } = useTheme();

  const nearbyRoutes = routes.slice(0, 3);
  
  const filteredRoutes = routes.filter((route) =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simulate navigation progress
  useEffect(() => {
    if (!isNavigating || !selectedRoute) return;

    const totalDuration = mode === 'walk' 
      ? selectedRoute.duration_walk_min 
      : selectedRoute.duration_cycle_min;

    const interval = setInterval(() => {
      setNavElapsedMin((prev) => {
        if (prev >= totalDuration) {
          setIsNavigating(false);
          toast.success("You've arrived at your destination!");
          return 0;
        }
        return prev + 1;
      });
    }, 3000); // Speed up for demo: 3 seconds = 1 minute

    return () => clearInterval(interval);
  }, [isNavigating, selectedRoute, mode]);

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
    if (!selectedRoute) return;
    setShowRouteDetail(false);
    setIsNavigating(true);
    setNavElapsedMin(0);
    toast.success("Navigation started");
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setNavElapsedMin(0);
    setSelectedRoute(null);
    toast.info("Navigation ended");
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

  const showBottomUI = !showDiscovery && !showRouteDetail && !showSaved && !isNavigating;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Map */}
      <MapView
        selectedRoute={selectedRoute}
        isNavigating={isNavigating}
        isDark={isDark}
        onMapClick={() => {
          if (!showDiscovery && !showRouteDetail && !showSaved && !isNavigating) {
            setSelectedRoute(null);
          }
        }}
      />

      {/* Navigation Status Bar */}
      <AnimatePresence>
        {isNavigating && selectedRoute && (
          <NavigationStatusBar
            route={selectedRoute}
            mode={mode}
            onStop={handleStopNavigation}
            elapsedMin={navElapsedMin}
          />
        )}
      </AnimatePresence>

      {/* Top Overlay - Hidden during navigation */}
      {!isNavigating && (
        <div className="absolute inset-x-0 top-0 z-10 p-4 pt-safe">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <PillInput
              placeholder="Where in Blacksburg?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDiscovery(true)}
              icon={<Search className="h-5 w-5 text-muted-foreground" />}
            />
          </motion.div>
        </div>
      )}

      {/* Left side controls - Hidden during navigation */}
      {!isNavigating && (
        <div className="absolute left-4 top-20 z-10 flex flex-col gap-2">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            variant="secondary"
            onClick={user ? handleSignOut : () => setShowAuth(true)}
          >
            {user ? <LogOut className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </Button>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} className="shadow-lg" />
        </div>
      )}

      {/* Saved Routes FAB - Hidden during navigation */}
      {!isNavigating && (
        <Button
          size="icon"
          className="absolute right-4 top-20 z-10 h-12 w-12 rounded-full shadow-lg"
          variant="secondary"
          onClick={handleSavedClick}
        >
          <Heart className={`h-5 w-5 ${user && savedRouteIds.length > 0 ? "fill-primary text-primary" : ""}`} />
        </Button>
      )}

      {/* Report FAB - Always visible but positioned based on nav state */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        className={`absolute right-4 z-10 ${isNavigating ? "bottom-8" : "bottom-[280px]"}`}
      >
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-caution hover:bg-caution/90 text-caution-foreground"
          onClick={() => setShowReport(true)}
        >
          <Flag className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Bottom Quick Access (when no sheet is open and not navigating) */}
      {showBottomUI && (
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
              <h3 className="text-sm font-medium text-foreground">Around campus</h3>
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
        title="Explore Blacksburg"
        snapPoints={[0.6, 0.9]}
      >
        <div className="space-y-4 py-4">
          {/* Search */}
          <PillInput
            placeholder="Campus, downtown, trails..."
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

      {/* Report Modal */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />
    </div>
  );
};

export default Map;
