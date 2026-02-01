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
import { RouteReassurance } from "@/components/RouteReassurance";
import { MapStateIndicator } from "@/components/map/MapStateIndicator";
import { Route } from "@/lib/mock-data";
import { SOSButton } from "@/components/SOSButton";
import { useRoutes } from "@/hooks/useRoutes";
import { useAuth } from "@/hooks/useAuth";
import { useSavedRoutes } from "@/hooks/useSavedRoutes";
import { useTheme } from "@/hooks/useTheme";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePlaceSearch, PlaceResult } from "@/hooks/usePlaceSearch";
import { useRouting, formatDistance, formatDuration } from "@/hooks/useRouting";
import { useMapState } from "@/hooks/useMapState";
import { Heart, User, LogOut, Loader2, Flag, Navigation, MapPin, Crosshair, Search, Flame, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [navElapsedMin, setNavElapsedMin] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState<PlaceResult | null>(null);
  
  // Point-to-point routing state
  const [routeOrigin, setRouteOrigin] = useState<PlaceResult | null>(null);
  const [routeDestination, setRouteDestination] = useState<PlaceResult | null>(null);
  const [showPointToPoint, setShowPointToPoint] = useState(false);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);

  // Map state management
  const { state: mapState, config, setExplore, setPlanning, setNavigation } = useMapState("explore");

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

  // Debounced place search for main search bar
  useEffect(() => {
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
  }, [searchQuery, searchPlaces, clearResults, effectiveLocation]);

  // Sync map state with UI state - only planning when point-to-point sheet or route detail is open
  useEffect(() => {
    if (showPointToPoint || showRouteDetail) {
      setPlanning();
    } else if (mapState === "navigation") {
      // Stay in navigation
    }
    // Note: selectedDestination alone doesn't trigger planning - stays in explore with destination card
  }, [showPointToPoint, showRouteDetail, mapState, setPlanning]);

  const nearbyRoutes = routes.slice(0, 3);

  // Simulate navigation progress
  useEffect(() => {
    if (mapState !== "navigation" || !selectedRoute) return;

    const totalDuration = mode === 'walk' 
      ? selectedRoute.duration_walk_min 
      : selectedRoute.duration_cycle_min;

    const interval = setInterval(() => {
      setNavElapsedMin((prev) => {
        if (prev >= totalDuration) {
          setExplore();
          return 0;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [mapState, selectedRoute, mode, setExplore]);

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setSelectedDestination(null);
    setShowDiscovery(false);
    setShowSaved(false);
    setShowRouteDetail(true);
  };

  const handlePlaceSelect = (place: PlaceResult) => {
    // Close point-to-point sheet if open
    if (showPointToPoint) {
      setShowPointToPoint(false);
    }
    
    // Set the destination
    setSelectedDestination({
      ...place,
      coordinates: place.coordinates,
    });
    setSearchQuery(place.name);
    clearResults();
    
    // Stay in explore state (no dim effect) - destination card will show
    setExplore();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedDestination(null);
    clearResults();
    clearRoute();
    setExplore();
  };

  const handleNavigateToDestination = async () => {
    if (!selectedDestination) return;
    
    // If route already calculated, start navigation
    if (calculatedRoute) {
      handleStartNavigation();
      return;
    }
    
    const origin = effectiveLocation || [-80.4139, 37.2296]; // Default to Blacksburg center
    
    // Walking-only routing
    const result = await calculateRoute(origin, selectedDestination.coordinates);
    
    if (!result) {
      // Only show error toast - success is silent
      toast.error("Could not calculate route. Try a different destination.");
    }
  };

  // Start live navigation - clear UI and focus on route
  const handleStartNavigation = () => {
    // Clear search and destination card UI
    setSearchQuery("");
    
    // Enter navigation mode
    setNavigation();
    setNavElapsedMin(0);
  };

  // Point-to-point routing completed - just display the route, don't start navigation
  const handlePointToPointComplete = (origin: PlaceResult, destination: PlaceResult) => {
    setRouteOrigin(origin);
    setRouteDestination(destination); // Store for marker display only
    setShowPointToPoint(false);
    setExplore(); // Stay in explore mode, just show the route
  };

  const handleClearPointToPoint = () => {
    setRouteOrigin(null);
    setRouteDestination(null);
    setSelectedDestination(null);
    setShowPointToPoint(false);
    clearRoute();
    setExplore();
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
    setNavigation();
    setNavElapsedMin(0);
  };

  const handleStopNavigation = () => {
    setExplore();
    setNavElapsedMin(0);
    setSelectedRoute(null);
    setSelectedDestination(null);
    setRouteOrigin(null);
    setRouteDestination(null);
    setSearchQuery("");
    clearRoute();
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
  };

  const handleOpenPointToPoint = () => {
    setShowPointToPoint(true);
    setPlanning();
  };

  // Convert PlaceResult coordinates to the format expected by MapView
  // Use point-to-point destination if available, otherwise selected destination
  const destinationMarkerCoords = routeDestination?.coordinates || selectedDestination?.coordinates || null;
  const originMarkerCoords = routeOrigin?.coordinates || null;
  
  // Determine if bottom UI should show
  const showBottomUI = !showDiscovery && !showRouteDetail && !showSaved && mapState === "explore";

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Map */}
      <MapView
        selectedRoute={selectedRoute}
        isNavigating={mapState === "navigation"}
        isDark={isDark}
        userLocation={effectiveLocation}
        destinationMarker={destinationMarkerCoords}
        originMarker={originMarkerCoords}
        calculatedRoute={calculatedRoute?.coordinates || null}
        heatmapEnabled={heatmapEnabled}
        onHeatmapToggle={setHeatmapEnabled}
        onMapClick={() => {
          if (mapState === "explore") {
            setSelectedRoute(null);
            setSelectedDestination(null);
            setRouteOrigin(null);
            setRouteDestination(null);
            clearRoute();
          }
        }}
      />

      {/* Planning mode dim overlay */}
      <AnimatePresence>
        {config.mapDimmed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-background/30 backdrop-blur-[1px] pointer-events-none z-[5]"
          />
        )}
      </AnimatePresence>

      {/* Navigation Status Bar - Compact at bottom */}
      <AnimatePresence>
        {mapState === "navigation" && (selectedRoute || calculatedRoute) && (
          <NavigationStatusBar
            route={selectedRoute}
            calculatedRoute={calculatedRoute}
            destinationName={selectedDestination?.name}
            mode={mode}
            onStop={handleStopNavigation}
            elapsedMin={navElapsedMin}
            compact={true}
          />
        )}
      </AnimatePresence>

      {/* State indicator pill */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
        <AnimatePresence mode="wait">
          <MapStateIndicator key={mapState} state={mapState} />
        </AnimatePresence>
      </div>

      {/* Top Overlay - Search bar (hidden during navigation) */}
      <AnimatePresence>
        {config.showSearch && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-x-0 top-12 z-50 p-4 pt-safe"
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
        )}
      </AnimatePresence>

      {/* Left side controls (hidden during navigation) */}
      <AnimatePresence>
        {config.showSideControls && (
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="absolute left-4 top-32 z-40 flex flex-col gap-2"
          >
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} className="shadow-lg" />
            
            {/* Recenter / Location accuracy button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-full shadow-lg",
                      !isAccurate && "animate-pulse"
                    )}
                    variant="secondary"
                    onClick={requestLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Crosshair className={cn(
                        "h-5 w-5",
                        isAccurate ? "text-primary" : "text-muted-foreground"
                      )} />
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
            
            {/* Heatmap toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-full shadow-lg",
                      heatmapEnabled && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    variant="secondary"
                    onClick={() => setHeatmapEnabled(!heatmapEnabled)}
                  >
                    <Flame className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{heatmapEnabled ? "Hide safety heatmap" : "Show safety heatmap"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right side controls - Account & Saved (hidden during navigation) */}
      <AnimatePresence>
        {config.showSideControls && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="absolute right-4 top-32 z-40 flex flex-col gap-2"
          >
            {/* Account button */}
            <Button
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg"
              variant="secondary"
              onClick={user ? handleSignOut : () => setShowAuth(true)}
            >
              {user ? <LogOut className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </Button>
            
            {/* Favorites button */}
            <Button
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg"
              variant="secondary"
              onClick={handleSavedClick}
            >
              <Heart className={cn(
                "h-5 w-5",
                user && savedRouteIds.length > 0 && "fill-primary text-primary"
              )} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigate to destination button (Planning state) */}
      <AnimatePresence>
        {selectedDestination && mapState !== "navigation" && !showPointToPoint && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 z-20 p-4 pb-safe-bottom"
          >
            <div className="mx-auto max-w-md rounded-xl border border-border bg-card/95 backdrop-blur-md p-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{selectedDestination.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedDestination.fullAddress}</p>
                </div>
              </div>
              
              {/* Show route info if calculated */}
              {calculatedRoute && (
                <>
                  <div className="flex items-center gap-4 mb-2 p-2 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-1 text-sm text-foreground">
                      <span className="font-medium">{formatDistance(calculatedRoute.distance)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-foreground">
                      <span className="font-medium">{formatDuration(calculatedRoute.duration)}</span>
                    </div>
                  </div>
                  
                  {/* Route reassurance - uses real safety data */}
                  <RouteReassurance 
                    className="mb-2 border-t border-border/50 pt-1" 
                    destinationName={selectedDestination?.name}
                  />
                </>
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

      {/* FAB Buttons Container (SOS + Report) */}
      <AnimatePresence>
        {config.showFABs && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute right-4 z-10 flex flex-col gap-3",
              showPointToPoint ? "bottom-[250px]" : 
              selectedDestination ? "bottom-40" : "bottom-24"
            )}
          >
            {/* SOS Emergency Button */}
            <SOSButton userLocation={effectiveLocation} />

            {/* Report FAB */}
            <Button
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setShowReport(true)}
            >
              <Flag className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Route Button - shown when point-to-point route is displayed */}
      <AnimatePresence>
        {routeOrigin && routeDestination && !showPointToPoint && mapState === "explore" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 z-10 p-4 pb-8"
          >
            <div className="mx-auto max-w-md flex justify-center">
              <Button
                className="h-12 px-5 rounded-2xl shadow-lg text-sm font-medium"
                onClick={handleClearPointToPoint}
              >
                <X className="h-4 w-4 mr-2" />
                Clear route
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Quick Access - Explore state only */}
      <AnimatePresence>
        {showBottomUI && !selectedDestination && !showPointToPoint && !routeOrigin && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="absolute inset-x-0 bottom-0 z-10 p-4 pb-8"
          >
            <div className="mx-auto max-w-md flex justify-center">
              <Button
                className="h-12 px-5 rounded-2xl shadow-lg text-sm font-medium"
                onClick={handleOpenPointToPoint}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Route between two locations
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Point-to-Point Routing UI (Planning state) */}
      <AnimatePresence>
        {showPointToPoint && mapState !== "navigation" && (
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
          setExplore();
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
