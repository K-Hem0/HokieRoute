import * as React from "react";
import { Search, MapPin, Loader2, X, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlaceResult } from "@/hooks/usePlaceSearch";
import { motion, AnimatePresence } from "framer-motion";

interface PlaceSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  results: PlaceResult[];
  loading: boolean;
  onSelectPlace: (place: PlaceResult) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
  hasSearched?: boolean;
}

const PlaceSearchInput = ({
  value,
  onChange,
  results,
  loading,
  onSelectPlace,
  onClear,
  placeholder = "Search buildings, places...",
  className,
  hasSearched = false,
}: PlaceSearchInputProps) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const showResults = isFocused && value.length >= 1 && (results.length > 0 || loading || (hasSearched && !loading));

  return (
    <div className={cn("relative mx-auto max-w-md", className)}>
      <div
        className={cn(
          "flex h-11 sm:h-12 items-center gap-2 sm:gap-3 rounded-full border border-border bg-card px-3 sm:px-4 shadow-lg transition-all",
          isFocused && "border-primary ring-2 ring-primary/20"
        )}
      >
        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/50 focus:outline-none min-w-0"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />}
        {value && !loading && (
          <button
            onClick={onClear}
            className="p-1.5 sm:p-2 -mr-1 hover:bg-secondary rounded-full transition-colors touch-target flex items-center justify-center"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-card shadow-xl overflow-hidden z-[60]"
          >
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-64 overflow-y-auto scrollbar-hide">
                {results.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => onSelectPlace(place)}
                    className="w-full flex items-start gap-3 p-3 sm:p-3 hover:bg-secondary active:bg-secondary/80 transition-colors text-left touch-target"
                  >
                    <div className="flex-shrink-0 w-8 h-8 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate tracking-tight">
                        {place.name}
                      </p>
                      <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                        {place.fullAddress}
                      </p>
                    </div>
                    <Navigation className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No locations found for "{value}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { PlaceSearchInput };
