import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Loader2, X, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { PlaceResult } from "@/hooks/usePlaceSearch";
import { formatDistance, formatDuration } from "@/hooks/useRouting";
import { cn } from "@/lib/utils";

interface PointToPointSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteCalculated: (origin: PlaceResult, destination: PlaceResult) => void;
  calculatedRoute: {
    distance: number;
    duration: number;
    steps: any[];
  } | null;
  routeLoading: boolean;
  calculateRoute: (origin: [number, number], destination: [number, number]) => Promise<any>;
}

type ActiveField = "origin" | "destination" | null;

export const PointToPointSheet = ({
  isOpen,
  onClose,
  onRouteCalculated,
  calculatedRoute,
  routeLoading,
  calculateRoute,
}: PointToPointSheetProps) => {
  const [origin, setOrigin] = useState<PlaceResult | null>(null);
  const [destination, setDestination] = useState<PlaceResult | null>(null);
  const [originQuery, setOriginQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [activeField, setActiveField] = useState<ActiveField>(null);
  
  const originInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);
  
  const { results, loading, search, clear, hasSearched } = useDebouncedSearch({ debounceMs: 250, minLength: 1 });

  useEffect(() => {
    if (isOpen && originInputRef.current) {
      setTimeout(() => originInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (origin && destination) {
      calculateRoute(origin.coordinates, destination.coordinates);
    }
  }, [origin, destination, calculateRoute]);

  const handleOriginChange = (value: string) => {
    setOriginQuery(value);
    setOrigin(null);
    setActiveField("origin");
    search(value);
  };

  const handleDestChange = (value: string) => {
    setDestQuery(value);
    setDestination(null);
    setActiveField("destination");
    search(value);
  };

  const handleSelectPlace = (place: PlaceResult) => {
    if (activeField === "origin") {
      setOrigin(place);
      setOriginQuery(place.name);
      clear();
      if (!destination) {
        setTimeout(() => destInputRef.current?.focus(), 50);
      }
    } else if (activeField === "destination") {
      setDestination(place);
      setDestQuery(place.name);
      clear();
    }
    setActiveField(null);
  };

  const handleSwapLocations = () => {
    const tempOrigin = origin;
    const tempQuery = originQuery;
    setOrigin(destination);
    setOriginQuery(destQuery);
    setDestination(tempOrigin);
    setDestQuery(tempQuery);
  };

  const handleClear = () => {
    setOrigin(null);
    setDestination(null);
    setOriginQuery("");
    setDestQuery("");
    setActiveField(null);
    clear();
    onClose();
  };

  const handleStartRoute = () => {
    if (origin && destination) {
      onRouteCalculated(origin, destination);
    }
  };

  const activeQuery = activeField === "origin" ? originQuery : destQuery;
  const showResults = activeField && activeQuery.length >= 1 && (results.length > 0 || loading || (hasSearched && !loading));

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute inset-x-0 bottom-0 z-20"
    >
      <div className="mx-4 mb-4 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        
        {/* Header section - 16px padding */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground tracking-tight">Plan your walk</h3>
              <p className="text-xs text-muted-foreground/70 mt-1">Blacksburg · Walking</p>
            </div>
            <button
              onClick={handleClear}
              className="p-2 -mr-2 -mt-1 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Inputs Section */}
        <div className="px-4 pb-4">
          <div className="rounded-xl bg-secondary/30 p-3">
            <div className="flex gap-3">
              {/* Route Line Visual */}
              <div className="flex flex-col items-center py-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <div className="flex-1 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20 my-1" />
                <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-background" />
              </div>

              {/* Inputs */}
              <div className="flex-1 space-y-1.5">
                <div className="relative">
                  <input
                    ref={originInputRef}
                    type="text"
                    value={originQuery}
                    onChange={(e) => handleOriginChange(e.target.value)}
                    onFocus={() => {
                      setActiveField("origin");
                      if (originQuery.length >= 1 && !origin) search(originQuery);
                    }}
                    placeholder="Starting point"
                    className={cn(
                      "w-full h-10 px-3 rounded-lg border text-sm transition-all",
                      "placeholder:text-muted-foreground/50 focus:outline-none",
                      activeField === "origin"
                        ? "border-primary/50 ring-1 ring-primary/20 bg-background"
                        : "border-transparent bg-background/60 hover:bg-background",
                      origin && "text-foreground font-medium"
                    )}
                  />
                  {origin && (
                    <button
                      onClick={() => {
                        setOrigin(null);
                        setOriginQuery("");
                        originInputRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    ref={destInputRef}
                    type="text"
                    value={destQuery}
                    onChange={(e) => handleDestChange(e.target.value)}
                    onFocus={() => {
                      setActiveField("destination");
                      if (destQuery.length >= 1 && !destination) search(destQuery);
                    }}
                    placeholder="Where to?"
                    className={cn(
                      "w-full h-10 px-3 rounded-lg border text-sm transition-all",
                      "placeholder:text-muted-foreground/50 focus:outline-none",
                      activeField === "destination"
                        ? "border-primary/50 ring-1 ring-primary/20 bg-background"
                        : "border-transparent bg-background/60 hover:bg-background",
                      destination && "text-foreground font-medium"
                    )}
                  />
                  {destination && (
                    <button
                      onClick={() => {
                        setDestination(null);
                        setDestQuery("");
                        destInputRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex items-center">
                <button
                  onClick={handleSwapLocations}
                  disabled={!origin && !destination}
                  className="p-2 rounded-full hover:bg-background transition-colors disabled:opacity-30"
                >
                  <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Search Results - inside the inputs section */}
            <AnimatePresence>
              {showResults && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-lg border border-border bg-background overflow-hidden">
                    {loading ? (
                      <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Searching...</span>
                      </div>
                    ) : results.length > 0 ? (
                      <div className="max-h-32 overflow-y-auto">
                        {results.map((place) => (
                          <button
                            key={place.id}
                            onClick={() => handleSelectPlace(place)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-secondary/50 transition-colors text-left"
                          >
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {place.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {place.fullAddress}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-3 py-2.5 text-sm text-muted-foreground">
                        No locations found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Route Summary - separate section */}
        <AnimatePresence>
          {calculatedRoute && origin && destination && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="flex items-center justify-center gap-8 py-3">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground tabular-nums tracking-tight">
                      {formatDistance(calculatedRoute.distance)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mt-0.5">Distance</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground tabular-nums tracking-tight">
                      {formatDuration(calculatedRoute.duration)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mt-0.5">Walking</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action section */}
        <div className="px-4 pb-4 pt-1 border-t border-border/50">
          <Button
            className="w-full h-12 rounded-xl text-sm font-medium mt-3"
            onClick={calculatedRoute ? handleStartRoute : handleStartRoute}
            disabled={!origin || !destination || routeLoading}
          >
            {routeLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Calculating...
              </>
            ) : calculatedRoute ? (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                View route
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Get route
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
