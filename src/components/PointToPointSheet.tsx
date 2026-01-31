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
  
  const { results, loading, search, clear } = useDebouncedSearch({ debounceMs: 250, minLength: 1 });

  // Focus origin input when sheet opens
  useEffect(() => {
    if (isOpen && originInputRef.current) {
      setTimeout(() => originInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-calculate when both locations are set
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
      // Auto-focus destination if empty
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

  const showResults = activeField && (results.length > 0 || loading);

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
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Plan your walk</h3>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Input Section */}
        <div className="p-4">
          <div className="flex gap-3">
            {/* Route Line Visual */}
            <div className="flex flex-col items-center py-3">
              <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-primary/20" />
              <div className="flex-1 w-0.5 bg-gradient-to-b from-primary to-primary/30 my-1.5" />
              <div className="w-3 h-3 rounded-full border-2 border-primary bg-background" />
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-2">
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
                    "w-full h-11 px-3 rounded-lg border bg-secondary/50 text-sm transition-all",
                    "placeholder:text-muted-foreground focus:outline-none",
                    activeField === "origin"
                      ? "border-primary ring-2 ring-primary/20 bg-background"
                      : "border-transparent hover:border-border",
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
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
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
                    "w-full h-11 px-3 rounded-lg border bg-secondary/50 text-sm transition-all",
                    "placeholder:text-muted-foreground focus:outline-none",
                    activeField === "destination"
                      ? "border-primary ring-2 ring-primary/20 bg-background"
                      : "border-transparent hover:border-border",
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
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex items-center">
              <button
                onClick={handleSwapLocations}
                disabled={!origin && !destination}
                className="p-2 rounded-full hover:bg-secondary transition-colors disabled:opacity-30"
              >
                <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Search Results */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-lg border border-border bg-background overflow-hidden">
                  {loading ? (
                    <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <div className="max-h-36 overflow-y-auto">
                      {results.map((place) => (
                        <button
                          key={place.id}
                          onClick={() => handleSelectPlace(place)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/70 transition-colors text-left"
                        >
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                          </div>
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
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Route Summary */}
          <AnimatePresence>
            {calculatedRoute && origin && destination && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-3 flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
              >
                <div className="flex-1 flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">
                      {formatDistance(calculatedRoute.distance)}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">
                      {formatDuration(calculatedRoute.duration)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  via walking
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Button */}
        <div className="px-4 pb-4">
          <Button
            className="w-full h-12 rounded-xl text-sm font-medium"
            onClick={handleStartRoute}
            disabled={!origin || !destination || routeLoading}
          >
            {routeLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Calculating...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                {calculatedRoute ? "Start Navigation" : "Get Route"}
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
