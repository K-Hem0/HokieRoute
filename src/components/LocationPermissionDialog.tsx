import { useState, useEffect } from "react";
import { MapPin, Shield, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

const STORAGE_KEY = "hokieroute-location-prompted";

interface LocationPermissionDialogProps {
  onAllow: () => void;
  onDeny: () => void;
}

export const LocationPermissionDialog = ({
  onAllow,
  onDeny,
}: LocationPermissionDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if we've already prompted the user
    const hasPrompted = localStorage.getItem(STORAGE_KEY);
    
    if (!hasPrompted) {
      // Small delay to let the map load first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
    onAllow();
  };

  const handleDeny = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
    onDeny();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDeny()}>
      <DialogContent className="sm:max-w-md w-[calc(100%-32px)] mx-auto p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent px-5 sm:px-6 pt-6 pb-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-safe border-2 border-background"
              >
                <Shield className="h-3.5 w-3.5 text-safe-foreground" />
              </motion.div>
            </div>
          </motion.div>

          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-foreground">
              Enable location for safer routes
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              HokieRoute uses your location to provide personalized safety insights and navigation.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Benefits list */}
        <div className="px-5 sm:px-6 py-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
              <Navigation className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Turn-by-turn navigation</p>
              <p className="text-xs text-muted-foreground">Get directions from your current location</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-safe/10 flex-shrink-0">
              <Shield className="h-4 w-4 text-safe" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Real-time safety alerts</p>
              <p className="text-xs text-muted-foreground">Be notified about nearby hazards on your route</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 sm:px-6 pb-6 pt-2 space-y-2">
          <Button
            className="w-full h-12 rounded-xl text-sm font-medium"
            onClick={handleAllow}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Allow location access
          </Button>
          <Button
            variant="ghost"
            className="w-full h-10 text-sm text-muted-foreground"
            onClick={handleDeny}
          >
            Maybe later
          </Button>
          <p className="text-[10px] text-center text-muted-foreground/60 pt-1">
            Your location is only used while using the app and is never stored.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
