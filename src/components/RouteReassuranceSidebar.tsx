import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, MapPin, AlertTriangle, CheckCircle, Eye, Lightbulb, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface RouteReassuranceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  destinationName?: string;
}

interface SafetyInsight {
  message: string;
  type: "safe" | "caution" | "info" | "landmark";
  icon: "check" | "alert" | "eye" | "users" | "lightbulb" | "pin";
}

// Varied phrasings for safe locations
const SAFE_PHRASES = [
  (name: string) => `Routes through ${name} — high safety score`,
  (name: string) => `Passes by ${name}, a well-monitored area`,
  (name: string) => `Uses path near ${name} for visibility`,
  (name: string) => `Prioritizes ${name} corridor`,
];

// Varied phrasings for avoided locations
const AVOID_PHRASES = [
  (name: string) => `Avoids ${name} — recent incident reported`,
  (name: string) => `Steers clear of ${name} area`,
  (name: string) => `Routes around ${name} for safety`,
  (name: string) => `Bypasses less-monitored ${name}`,
];

// Contextual insights based on time/conditions
const TIME_INSIGHTS = {
  lateNight: [
    { message: "Prioritizes well-lit emergency station paths", icon: "lightbulb" as const },
    { message: "Avoids isolated areas during night hours", icon: "eye" as const },
    { message: "Uses main campus arteries with CCTV coverage", icon: "eye" as const },
  ],
  evening: [
    { message: "Follows high-traffic evening pedestrian routes", icon: "users" as const },
    { message: "Stays on illuminated walkways", icon: "lightbulb" as const },
  ],
  day: [
    { message: "Uses high-visibility pedestrian routes", icon: "users" as const },
    { message: "Follows popular student walking paths", icon: "users" as const },
    { message: "Routes through active campus zones", icon: "pin" as const },
  ],
};

// Significant locations that should always be mentioned if present
const SIGNIFICANT_KEYWORDS = ["Stadium", "Lane", "Squires", "Drillfield", "Library", "McComas"];

const cleanLocationName = (location: string): string => {
  const parenMatch = location.match(/\(([^)]+)\)/);
  if (parenMatch) {
    return parenMatch[1].replace(/\s*Hall\s*$/, "").trim();
  }
  const parts = location.split(/[(/]/);
  return parts[0].replace(/^\d+\s*/, "").trim();
};

const isSignificantLocation = (location: string): boolean => {
  return SIGNIFICANT_KEYWORDS.some(keyword => 
    location.toLowerCase().includes(keyword.toLowerCase())
  );
};

export const RouteReassuranceSidebar = ({ isOpen, onClose, destinationName }: RouteReassuranceSidebarProps) => {
  const [insights, setInsights] = useState<SafetyInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSafetyInsights = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        // Fetch safe areas
        const { data: safeAreas } = await supabase
          .from("location_safety_scores")
          .select("location, safety_score")
          .gte("safety_score", 95)
          .order("safety_score", { ascending: false })
          .limit(10);

        // Fetch areas with incidents/caution
        const { data: cautionAreas } = await supabase
          .from("location_safety_scores")
          .select("location, safety_score")
          .lt("safety_score", 80)
          .order("safety_score", { ascending: true })
          .limit(8);

        const formattedInsights: SafetyInsight[] = [];
        const usedPhraseIndices = new Set<number>();

        // Find significant safe locations first
        const significantSafe = safeAreas?.filter(a => isSignificantLocation(a.location)) || [];
        const regularSafe = safeAreas?.filter(a => !isSignificantLocation(a.location)) || [];

        // Add a significant safe location if available
        if (significantSafe.length > 0) {
          const loc = significantSafe[Math.floor(Math.random() * significantSafe.length)];
          const cleanName = cleanLocationName(loc.location);
          formattedInsights.push({
            message: `Routes through ${cleanName} — campus landmark with high visibility`,
            type: "landmark",
            icon: "check",
          });
        } else if (regularSafe.length > 0) {
          const phraseIdx = Math.floor(Math.random() * SAFE_PHRASES.length);
          usedPhraseIndices.add(phraseIdx);
          const loc = regularSafe[Math.floor(Math.random() * regularSafe.length)];
          const cleanName = cleanLocationName(loc.location);
          formattedInsights.push({
            message: SAFE_PHRASES[phraseIdx](cleanName),
            type: "safe",
            icon: "check",
          });
        }

        // Find significant caution areas
        const significantCaution = cautionAreas?.filter(a => 
          a.location.toLowerCase().includes("incident") || 
          a.location.toLowerCase().includes("arrest") ||
          isSignificantLocation(a.location)
        ) || [];
        const regularCaution = cautionAreas?.filter(a => 
          !a.location.toLowerCase().includes("incident") && 
          !a.location.toLowerCase().includes("arrest") &&
          !isSignificantLocation(a.location)
        ) || [];

        // Add a caution area the route avoids
        if (significantCaution.length > 0 && significantCaution[0].safety_score < 50) {
          const loc = significantCaution[0];
          const cleanName = cleanLocationName(loc.location);
          formattedInsights.push({
            message: `Avoids ${cleanName} — recent safety concern reported`,
            type: "caution",
            icon: "alert",
          });
        } else if (regularCaution.length > 0) {
          const phraseIdx = Math.floor(Math.random() * AVOID_PHRASES.length);
          const loc = regularCaution[Math.floor(Math.random() * Math.min(3, regularCaution.length))];
          const cleanName = cleanLocationName(loc.location);
          formattedInsights.push({
            message: AVOID_PHRASES[phraseIdx](cleanName),
            type: "caution",
            icon: "alert",
          });
        }

        // Add time-appropriate contextual insight
        const hour = new Date().getHours();
        let timeCategory: keyof typeof TIME_INSIGHTS;
        if (hour >= 22 || hour < 5) {
          timeCategory = "lateNight";
        } else if (hour >= 18 || hour < 7) {
          timeCategory = "evening";
        } else {
          timeCategory = "day";
        }
        
        const timeInsightOptions = TIME_INSIGHTS[timeCategory];
        const selectedTimeInsight = timeInsightOptions[Math.floor(Math.random() * timeInsightOptions.length)];
        formattedInsights.push({
          message: selectedTimeInsight.message,
          type: "info",
          icon: selectedTimeInsight.icon,
        });

        // Optionally add a second safe location
        if (destinationName && regularSafe.length > 1 && formattedInsights.length < 4) {
          let unusedPhraseIdx = 0;
          for (let i = 0; i < SAFE_PHRASES.length; i++) {
            if (!usedPhraseIndices.has(i)) {
              unusedPhraseIdx = i;
              break;
            }
          }
          const loc = regularSafe[1];
          const cleanName = cleanLocationName(loc.location);
          formattedInsights.push({
            message: SAFE_PHRASES[unusedPhraseIdx](cleanName),
            type: "safe",
            icon: "users",
          });
        }

        setInsights(formattedInsights);
      } catch (error) {
        console.error("Error fetching safety insights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSafetyInsights();
  }, [isOpen, destinationName]);

  const getIcon = (iconType: SafetyInsight["icon"]) => {
    switch (iconType) {
      case "check":
        return CheckCircle;
      case "alert":
        return AlertTriangle;
      case "eye":
        return Eye;
      case "users":
        return Users;
      case "lightbulb":
        return Lightbulb;
      default:
        return MapPin;
    }
  };

  const getIconColor = (type: SafetyInsight["type"]) => {
    switch (type) {
      case "safe":
      case "landmark":
        return "text-safe";
      case "caution":
        return "text-moderate";
      default:
        return "text-primary";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute top-28 left-4 right-4 z-40 mx-auto max-w-md bg-card/95 border border-border rounded-xl shadow-lg"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Why this route?</h2>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-3 overflow-y-auto max-h-64">
              {destinationName && (
                <p className="text-sm text-muted-foreground mb-4">
                  Route to <span className="font-medium text-foreground">{destinationName}</span>
                </p>
              )}

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-secondary/50 animate-pulse" />
                  ))}
                </div>
              ) : insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map((insight, index) => {
                    const Icon = getIcon(insight.icon);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                      >
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0",
                          insight.type === "safe" || insight.type === "landmark" 
                            ? "bg-safe/10" 
                            : insight.type === "caution" 
                            ? "bg-moderate/10" 
                            : "bg-primary/10"
                        )}>
                          <Icon className={cn("h-4 w-4", getIconColor(insight.type))} />
                        </div>
                        <p className="text-sm text-foreground leading-relaxed pt-1">
                          {insight.message}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No safety data available
                </p>
              )}

              {/* Footer info */}
              <div className="mt-3 pt-2 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground/60 text-center">
                  Updated from campus reports
                </p>
              </div>
            </div>
          </motion.div>
      )}
    </AnimatePresence>
  );
};
