import { useState, useEffect, useCallback } from "react";
import { MapView } from "@/components/MapView";
import { PlaceSearchInput } from "@/components/PlaceSearchInput";
import { ModeToggle, Mode } from "@/components/ui/ModeToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { RouteCard } from "@/components/RouteCard";
import { RouteDetailSheet } from "@/components/RouteDetailSheet";
import { BottomSheet } from "@/components/BottomSheet";
import { AuthSheet } from "@/components/AuthSheet";
import { SavedRoutesSheet } from "@/components/SavedRoutesSheet";
import { ReportModal } from "@/components/ReportModal";
import { NavigationStatusBar } from "@/components/NavigationStatusBar";
import { PointToPointSheet } from "@/components/PointToPointSheet";
import { Route } from "@/lib/mock-data";
import { useRoutes } from "@/hooks/useRoutes";
import { useAuth } from "@/hooks/useAuth";
import { useSavedRoutes } from "@/hooks/useSavedRoutes";
import { useTheme } from "@/hooks/useTheme";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePlaceSearch, PlaceResult } from "@/hooks/usePlaceSearch";
import { useRouting, formatDistance, formatDuration } from "@/hooks/useRouting";
import { Heart, User, LogOut, Loader2, Flag, Navigation, MapPin, Crosshair, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  const [hasSearched, setHasSearched] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navElapsedMin, setNavElapsedMin] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState<PlaceResult | null>(null);
  
  // Point-to-point routing state
  const [routeOrigin, setRouteOrigin] = useState<PlaceResult | null>(null);
  const [showPointToPoint, setShowPointToPoint] = useState(false);

  const { routes, loading: routesLoading } = useRoutes();
  const { user, signOut } = useAuth();
  const { savedRouteIds, toggleSaveRoute, unsaveRoute, isRouteSaved } = useSavedRoutes();
  const { isDark, toggleTheme } = useTheme();
  const { effectiveLocation, accuracy, isAccurate, requestLocation, startWatching, stopWatching, isWatching, loading: locationLoading } = useGeolocation();
  const { results: placeResults, loading: placesLoading, searchPlaces, clearResults } = usePlaceSearch();
  const { route: calculatedRoute, loading: routeLoading, calculateRoute, clearRoute } = useRouting();

  // Start watching location on mount for better accuracy
  useEffect(() => {
    startWatching();
    return () => stopWatching();
  }, [startWatching, stopWatching]);

  // Debounced place search - only for main search bar (not point-to-point)
  useEffect(() => {
    // Skip if point-to-point is open - those inputs handle their own search
    if (showPointToPoint) return;
    
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.length >= 1) {
        setHasSearched(true);
        searchPlaces(searchQuery);
      } else {
        setHasSearched(false);
        clearResults();
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, searchPlaces, clearResults, effectiveLocation, showPointToPoint]);

  const nearbyRoutes = routes.slice(0, 3);

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
    }, 3000);

    return () => clearInterval(interval);
  }, [isNavigating, selectedRoute, mode]);

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setSelectedDestination(null);
    setShowDiscovery(false);
    setShowSaved(false);
    setShowRouteDetail(true);
  };

  const handlePlaceSelect = (place: PlaceResult) => {
    setSelectedDestination({
      ...place,
      coordinates: place.coordinates,
    });
    setSearchQuery(place.name);
    clearResults();
    toast.success(`Selected: ${place.name}`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedDestination(null);
    clearResults();
    clearRoute();
  };

  const handleNavigateToDestination = async () => {
    if (!selectedDestination) return;
    
    const origin = effectiveLocation || [-80.4139, 37.2296]; // Default to Blacksburg center
    
    // Walking-only routing
    const result = await calculateRoute(origin, selectedDestination.coordinates);
    
    if (result) {
      toast.success(`Route found: ${formatDistance(result.distance)} • ${formatDuration(result.duration)}`);
    } else {
      toast.error("Could not calculate route. Try a different destination.");
    }
  };

  // Point-to-point routing completed
  const handlePointToPointComplete = (origin: PlaceResult, destination: PlaceResult) => {
    setRouteOrigin(origin);
    setSelectedDestination(destination);
    setShowPointToPoint(false);
    toast.success("Route ready - tap Start Navigation to begin");
  };

  const handleClearPointToPoint = () => {
    setRouteOrigin(null);
    setSelectedDestination(null);
    setShowPointToPoint(false);
    clearRoute();
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

  // Convert PlaceResult coordinates to the format expected by MapView
  const destinationMarkerCoords = selectedDestination?.coordinates || null;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Map */}
      <MapView
        selectedRoute={selectedRoute}
        isNavigating={isNavigating}
        isDark={isDark}
        userLocation={effectiveLocation}
        destinationMarker={destinationMarkerCoords}
        calculatedRoute={calculatedRoute?.coordinates || null}
        onMapClick={() => {
          if (!showDiscovery && !showRouteDetail && !showSaved && !isNavigating) {
            setSelectedRoute(null);
            setSelectedDestination(null);
            clearRoute();
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
            <PlaceSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              results={placeResults}
              loading={placesLoading}
              onSelectPlace={handlePlaceSelect}
              onClear={handleClearSearch}
              placeholder="Search buildings, places in Blacksburg..."
              hasSearched={hasSearched}
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
          
          {/* Recenter / Location accuracy button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className={`h-12 w-12 rounded-full shadow-lg ${!isAccurate ? 'animate-pulse' : ''}`}
                  variant="secondary"
                  onClick={requestLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Crosshair className={`h-5 w-5 ${isAccurate ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>
                  {accuracy ? `Accuracy: ~${Math.round(accuracy)}m` : 'Get location'}
                  {!isAccurate && accuracy && ' (low accuracy)'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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

      {/* Navigate to destination button */}
      <AnimatePresence>
        {selectedDestination && !isNavigating && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute inset-x-0 bottom-0 z-20 p-4 pb-safe-bottom"
          >
            <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-4 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{selectedDestination.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedDestination.fullAddress}</p>
                </div>
              </div>
              
              {/* Show route info if calculated */}
              {calculatedRoute && (
                <div className="flex items-center gap-4 mb-3 p-2 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-1 text-sm text-foreground">
                    <span className="font-medium">{formatDistance(calculatedRoute.distance)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-foreground">
                    <span className="font-medium">{formatDuration(calculatedRoute.duration)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {calculatedRoute.steps.length} steps
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleClearSearch}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleNavigateToDestination}
                  disabled={routeLoading}
                >
                  {routeLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Navigation className="h-4 w-4 mr-2" />
                  )}
                  {calculatedRoute ? "Start" : "Navigate"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report FAB - Always visible but positioned based on nav state */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        className={`absolute right-4 z-10 ${isNavigating ? "bottom-8" : showPointToPoint ? "bottom-[320px]" : selectedDestination ? "bottom-40" : "bottom-24"}`}
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
      {showBottomUI && !selectedDestination && !showPointToPoint && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="absolute inset-x-0 bottom-0 z-10 p-4 pb-safe-bottom"
        >
          {/* Point-to-Point Route Button */}
          <div className="mx-auto max-w-md">
            <Button
              className="w-full h-14 rounded-xl shadow-lg text-base font-medium"
              onClick={() => setShowPointToPoint(true)}
            >
              <Navigation className="h-5 w-5 mr-3" />
              Route between two locations
            </Button>
          </div>
        </motion.div>
      )}

      {/* Point-to-Point Routing UI */}
      <AnimatePresence>
        {showPointToPoint && !isNavigating && (
          <PointToPointSheet
            isOpen={showPointToPoint}
            onClose={handleClearPointToPoint}
            onRouteCalculated={handlePointToPointComplete}
            calculatedRoute={calculatedRoute}
            routeLoading={routeLoading}
            calculateRoute={calculateRoute}
          />
        )}
      </AnimatePresence>

      {/* Route Discovery Sheet */}
      <BottomSheet
        isOpen={showDiscovery}
        onClose={() => {
          setShowDiscovery(false);
        }}
        title="Explore Blacksburg"
        snapPoints={[0.6, 0.9]}
      >
        <div className="space-y-4 py-4">
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
            ) : routes.length > 0 ? (
              routes.map((route) => (
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
