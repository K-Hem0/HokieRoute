import { useState, useCallback, useRef, useEffect } from "react";
import { Phone, Loader2, Volume2, X, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
}

export const SOSButton = ({ className, userLocation }: SOSButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
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

  // Reverse geocode coordinates to get street address
  const reverseGeocode = useCallback(async (lng: number, lat: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { 'User-Agent': 'SafeRouteApp/1.0' } }
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      const addr = data.address;
      
      // Build a concise address string
      const parts: string[] = [];
      if (addr.house_number && addr.road) {
        parts.push(`${addr.house_number} ${addr.road}`);
      } else if (addr.road) {
        parts.push(addr.road);
      } else if (addr.building) {
        parts.push(addr.building);
      }
      
      if (addr.city || addr.town || addr.village) {
        parts.push(addr.city || addr.town || addr.village);
      }
      
      return parts.length > 0 ? parts.join(', ') : data.display_name?.split(',').slice(0, 2).join(',') || 'Unknown location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }, []);

  // Fetch fresh location and address when dialog opens
  useEffect(() => {
    if (!isOpen) return;
    
    // Reset state on each open
    setIsLoadingAddress(true);
    setCurrentAddress(null);
    setLastFix(null);
    setIsOnCampus(false);
    
    // Always request fresh location when SOS dialog opens (emergency situation)
    // We do NOT use any passed userLocation - we always get a fresh fix for emergencies
    if (!navigator.geolocation) {
      setCurrentAddress(null);
      setIsLoadingAddress(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;
        console.log('[SOS] Fresh GPS fix:', { lng, lat, accuracy: position.coords.accuracy });
        
        setLastFix({
          lng,
          lat,
          accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
          timestamp: position.timestamp,
        });
        setIsOnCampus(checkIfOnCampus(lng, lat));
        
        const address = await reverseGeocode(lng, lat);
        setCurrentAddress(address);
        setIsLoadingAddress(false);
      },
      (error) => {
        console.log('[SOS] GPS error:', error.message);
        // No fallback to userLocation - show "Location unavailable" for emergencies
        // This is intentional: we don't want stale/wrong locations in emergency situations
        setCurrentAddress(null);
        setIsLoadingAddress(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // CRITICAL: Force fresh position for emergencies - no cache
      }
    );
  }, [isOpen, reverseGeocode, checkIfOnCampus]);

  const generateEmergencyVoice = useCallback(async () => {
    setIsGeneratingVoice(true);
    
    try {
      let locationInfo = "Location unavailable.";
      
      const fix = lastFix
        ? [lastFix.lng, lastFix.lat] as const
        : userLocation
          ? [userLocation[0], userLocation[1]] as const
          : null;

      if (fix) {
        const [lng, lat] = fix;
        const address = currentAddress || await reverseGeocode(lng, lat);
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
      
      // Create and play audio
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        toast.error("Failed to play audio");
      };
      
      await audio.play();
      toast.success("Emergency voice message playing");
      
    } catch (error) {
      console.error('Error generating emergency voice:', error);
      toast.error("Could not generate voice message");
    } finally {
      setIsGeneratingVoice(false);
    }
  }, [userLocation, lastFix, currentAddress, reverseGeocode]);

  const handleCall = useCallback((number: string, label: string) => {
    // Open phone dialer with the number
    window.location.href = `tel:${number.replace(/-/g, '')}`;
    toast.info(`Calling ${label}...`);
  }, []);

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

  // Get recommended emergency contact based on location
  const primaryContact = isOnCampus ? EMERGENCY_NUMBERS.VT_POLICE : EMERGENCY_NUMBERS.BLACKSBURG_POLICE;

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

      {/* SOS Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md mx-4 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-destructive text-xl">
              🆘 Emergency SOS
            </DialogTitle>
            <DialogDescription className="text-center">
              Need immediate help? Call emergency services.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
              className="w-full h-14 text-lg bg-destructive hover:bg-destructive/90"
              onClick={() => handleCall(primaryContact.number, primaryContact.label)}
            >
              <Phone className="h-5 w-5 mr-3" />
              {primaryContact.label}: {primaryContact.number}
            </Button>
            <p className="text-xs text-center text-muted-foreground -mt-2">
              {primaryContact.description}
            </p>


            <div className="border-t border-border pt-4">
              {/* Generate Voice Message */}
              <Button
                variant="secondary"
                className="w-full h-12"
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
        </DialogContent>
      </Dialog>
    </>
  );
};
