import { useState, useCallback, useRef } from "react";
import { Phone, Loader2, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const SAFETY_NUMBER = "540-739-9854";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface SOSButtonProps {
  className?: string;
}

export const SOSButton = ({ className }: SOSButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get location when dialog opens
  const getLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCurrentLocation(position),
        (error) => console.error("Location error:", error),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const formatLocationMessage = useCallback((position: GeolocationPosition | null) => {
    if (!position) {
      return "Location unavailable.";
    }
    const lat = position.coords.latitude.toFixed(6);
    const lng = position.coords.longitude.toFixed(6);
    const accuracy = Math.round(position.coords.accuracy);
    return `The caller's GPS coordinates are: Latitude ${lat}, Longitude ${lng}, with accuracy of approximately ${accuracy} meters.`;
  }, []);

  const generateEmergencyVoice = useCallback(async () => {
    setIsGeneratingVoice(true);
    
    try {
      const locationInfo = formatLocationMessage(currentLocation);
      
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
            message: `This is an emergency SOS call from SafeRoute app. The caller needs immediate assistance and is requesting help. ${locationInfo} Please respond immediately. I repeat, this is an SOS emergency call. ${locationInfo}`
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
  }, [currentLocation, formatLocationMessage]);

  const handleCall = useCallback(() => {
    // Open phone dialer with the safety number
    window.location.href = `tel:${SAFETY_NUMBER.replace(/-/g, '')}`;
    toast.info(`Calling ${SAFETY_NUMBER}...`);
  }, []);

  const handleSOSPress = useCallback(() => {
    getLocation(); // Get location when opening SOS dialog
    setIsOpen(true);
  }, [getLocation]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

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
          className="h-14 w-14 rounded-full shadow-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-pulse"
          onClick={handleSOSPress}
        >
          <Phone className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* SOS Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-destructive text-xl">
              🆘 Emergency SOS
            </DialogTitle>
            <DialogDescription className="text-center">
              Need immediate help? Use the options below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Call Button */}
            <Button
              className="w-full h-14 text-lg bg-destructive hover:bg-destructive/90"
              onClick={handleCall}
            >
              <Phone className="h-5 w-5 mr-3" />
              Call Safety Line: {SAFETY_NUMBER}
            </Button>

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

            <p className="text-xs text-muted-foreground text-center pt-2">
              The voice message will be generated using AI to alert nearby people or play during a call.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
