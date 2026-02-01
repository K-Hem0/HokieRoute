import { useState, useCallback, useRef, useEffect } from "react";
import { Phone, Loader2, Volume2, X, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { reverseGeocode } from "@/lib/reverse-geocode";

// Emergency numbers - location aware
// NOTE: VT Police number per product requirement
const EMERGENCY_NUMBERS = {
  VT_POLICE: { number: "540-739-9854", label: "VT Police", description: "Virginia Tech Campus Police" },
  BLACKSBURG_POLICE: { number: "540-961-1150", label: "Blacksburg Police", description: "Town of Blacksburg Police" },
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// VT Campus bounding box (approximate)
const VT_CAMPUS_BOUNDS = {
  north: 37.235,
  south: 37.218,
  east: -80.405,
  west: -80.430,
};

interface SOSButtonProps {
  className?: string;
  userLocation?: [number, number] | null; // [lng, lat] from parent
  userAddress?: string; // Pre-fetched OSRM address from useCurrentLocation
  addressLoading?: boolean; // Loading state for address
}

export const SOSButton = ({ className, userLocation, userAddress, addressLoading }: SOSButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [freshAddress, setFreshAddress] = useState<string | null>(null);
  const [isLoadingFreshAddress, setIsLoadingFreshAddress] = useState(false);
  const [isOnCampus, setIsOnCampus] = useState(false);
  const [lastFix, setLastFix] = useState<{
    lng: number;
    lat: number;
    accuracy: number | null;
    timestamp: number;
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check if user is on VT campus
  const checkIfOnCampus = useCallback((lng: number, lat: number): boolean => {
    return (
      lat >= VT_CAMPUS_BOUNDS.south &&
      lat <= VT_CAMPUS_BOUNDS.north &&
      lng >= VT_CAMPUS_BOUNDS.west &&
      lng <= VT_CAMPUS_BOUNDS.east
    );
  }, []);

  // Fetch fresh GPS fix when dialog opens (emergency scenario needs most accurate location)
  useEffect(() => {
    if (!isOpen) return;

    // Reset state on each open
    setIsLoadingFreshAddress(true);
    setFreshAddress(null);
    setLastFix(null);
    setIsOnCampus(false);

    const fallbackToParentLocation = () => {
      if (!userLocation) {
        setIsLoadingFreshAddress(false);
        return;
      }

      // Use parent's location data
      const [lng, lat] = userLocation;
      console.log("[SOS] Using parent location:", { lat, lng });
      setLastFix({ lng, lat, accuracy: null, timestamp: Date.now() });
      setIsOnCampus(checkIfOnCampus(lng, lat));
      setIsLoadingFreshAddress(false);
    };

    // Always try for a fresh fix first (emergency scenario)
    if (!navigator.geolocation) {
      fallbackToParentLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;
        console.log("[SOS] Fresh GPS fix:", { lng, lat, accuracy: position.coords.accuracy });

        setLastFix({
          lng,
          lat,
          accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
          timestamp: position.timestamp,
        });
        setIsOnCampus(checkIfOnCampus(lng, lat));

        // Only fetch fresh address if coordinates differ significantly from parent
        if (userLocation) {
          const [parentLng, parentLat] = userLocation;
          const distance = Math.abs(lng - parentLng) + Math.abs(lat - parentLat);
          if (distance < 0.0001) {
            // Close enough, use parent address
            setIsLoadingFreshAddress(false);
            return;
          }
        }
        
        // Fetch fresh address for significantly different location
        const result = await reverseGeocode(lat, lng);
        setFreshAddress(result.label);
        setIsLoadingFreshAddress(false);
      },
      (error) => {
        console.log("[SOS] GPS error:", error.message);
        // If we can't get a fresh fix, use the parent location
        fallbackToParentLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Force fresh position (no cache)
      }
    );
  }, [isOpen, userLocation, checkIfOnCampus]);

  const generateEmergencyVoice = useCallback(async () => {
    setIsGeneratingVoice(true);
    
    // CRITICAL: Create Audio element IMMEDIATELY in user gesture context
    // This must happen BEFORE any async operations to maintain browser permission
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }
    
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;
    
    // Set up event handlers on the pre-created element
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      if (audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(audio.src);
      }
    };
    audio.onerror = () => {
      setIsPlaying(false);
      toast.error("Failed to play audio");
    };
    
    try {
      let locationInfo = "Location unavailable.";
      
      const fix = lastFix
        ? [lastFix.lng, lastFix.lat] as const
        : userLocation
          ? [userLocation[0], userLocation[1]] as const
          : null;

      if (fix) {
        const [lng, lat] = fix;
        // Use fresh address, parent address, or fetch new one
        const address = freshAddress || userAddress || (await reverseGeocode(lat, lng)).label;
        locationInfo = `The caller is located near ${address}.`;
      }
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/elevenlabs-sos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            message: `This is an emergency SOS call from HokieRoute app. The caller needs immediate assistance and is requesting help. ${locationInfo} Please respond immediately. I repeat, this is an SOS emergency call from HokieRoute. ${locationInfo}`
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate voice message');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Set source on pre-existing element and play
      // This works because the Audio element was created in user gesture context
      audio.src = audioUrl;
      await audio.play();
      toast.success("Emergency voice message playing");
      
    } catch (error) {
      console.error('Error generating emergency voice:', error);
      toast.error("Could not generate voice message");
    } finally {
      setIsGeneratingVoice(false);
    }
  }, [userLocation, lastFix, freshAddress, userAddress]);

  const handleCall = useCallback((number: string, label: string) => {
    // CRITICAL: Start generating voice FIRST (in user gesture context)
    // Then open the dialer - use window.open to avoid navigating away
    generateEmergencyVoice();
    
    toast.info(`Calling ${label}... Put phone on speaker for voice alert.`);
    
    // Use window.open with _self to trigger dialer without fully navigating away
    // On mobile, this opens the phone app but keeps our page in background
    setTimeout(() => {
      window.open(`tel:${number.replace(/-/g, '')}`, '_self');
    }, 100);
  }, [generateEmergencyVoice]);

  const handleSOSPress = useCallback(() => {
    setIsOpen(true);
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  // Determine loading and address states
  const isLoadingAddress = isLoadingFreshAddress || addressLoading;
  const currentAddress = freshAddress || userAddress || null;

  // Get recommended emergency contact based on location
  // Default to VT Police during loading (per product requirement)
  const primaryContact = isLoadingAddress ? EMERGENCY_NUMBERS.VT_POLICE : (isOnCampus ? EMERGENCY_NUMBERS.VT_POLICE : EMERGENCY_NUMBERS.BLACKSBURG_POLICE);

  return (
    <>
      {/* SOS FAB Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className={className}
      >
        <Button
          size="icon"
          className="h-11 w-11 sm:h-12 sm:w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground transition-transform"
          onClick={handleSOSPress}
        >
          <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </motion.div>

      {/* SOS Dialog - Full screen on mobile, centered card on desktop */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="
            fixed inset-0 z-[100] flex flex-col
            w-full h-full max-w-full max-h-full
            translate-x-0 translate-y-0 left-0 top-0
            rounded-none border-0
            pt-[max(16px,env(safe-area-inset-top))]
            pb-[max(16px,env(safe-area-inset-bottom))]
            px-[max(16px,env(safe-area-inset-left))]
            pr-[max(16px,env(safe-area-inset-right))]
            sm:inset-auto sm:left-1/2 sm:top-1/2 
            sm:-translate-x-1/2 sm:-translate-y-1/2
            sm:max-w-md sm:max-h-[85vh] sm:h-auto
            sm:rounded-lg sm:border
            sm:pt-6 sm:pb-6 sm:px-6
            data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:slide-in-from-bottom-[48%]
          "
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Close button - pinned top-right inside safe area */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-[max(16px,env(safe-area-inset-right))] top-[max(16px,env(safe-area-inset-top))] sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
            <div className="flex flex-col justify-center min-h-full py-4 sm:py-0">
              <DialogHeader className="mb-4 sm:mb-6">
                <DialogTitle className="text-center text-destructive text-xl">
                  🆘 Emergency SOS
                </DialogTitle>
                <DialogDescription className="text-center">
                  Need immediate help? Call emergency services.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 sm:space-y-4">
                {/* Current Location Display */}
                <div className="rounded-lg bg-secondary/50 p-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Your location</p>
                      {isLoadingAddress ? (
                        <p className="text-sm text-foreground flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Detecting...
                        </p>
                      ) : currentAddress ? (
                        <p className="text-sm text-foreground truncate">{currentAddress}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Location unavailable</p>
                      )}
                      {isOnCampus && (
                        <div className="flex items-center gap-1 mt-1">
                          <Shield className="h-3 w-3 text-primary" />
                          <span className="text-xs text-primary font-medium">On VT Campus</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Call Button - Location aware */}
                <Button
                  className="w-full h-12 sm:h-14 text-base sm:text-lg bg-destructive hover:bg-destructive/90"
                  onClick={() => handleCall(primaryContact.number, primaryContact.label)}
                >
                  <Phone className="h-5 w-5 mr-3" />
                  {primaryContact.label}: {primaryContact.number}
                </Button>
                <p className="text-xs text-center text-muted-foreground -mt-1 sm:-mt-2">
                  {primaryContact.description}
                </p>

                <div className="border-t border-border pt-3 sm:pt-4">
                  {/* Generate Voice Message */}
                  <Button
                    variant="secondary"
                    className="w-full h-10 sm:h-12"
                    onClick={generateEmergencyVoice}
                    disabled={isGeneratingVoice || isPlaying}
                  >
                    {isGeneratingVoice ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating voice message...
                      </>
                    ) : isPlaying ? (
                      <>
                        <Volume2 className="h-4 w-4 mr-2 animate-pulse" />
                        Playing emergency message...
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 mr-2" />
                        Play Emergency Voice Alert
                      </>
                    )}
                  </Button>

                  {/* Stop Audio */}
                  <AnimatePresence>
                    {isPlaying && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2"
                      >
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={stopAudio}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Stop Audio
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-xs text-muted-foreground text-center pt-3">
                    Voice alert includes your current location for first responders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
