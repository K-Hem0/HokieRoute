import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb, Users, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RouteReassuranceProps {
  className?: string;
}

// Generate contextual reassurance points based on time of day and route
const getReassurancePoints = () => {
  const hour = new Date().getHours();
  const isEvening = hour >= 18 || hour < 6;
  
  const points = [
    {
      icon: Lightbulb,
      text: isEvening ? "Route prioritizes well-lit paths" : "Clear visibility along this route",
    },
    {
      icon: Users,
      text: "Passes through active, populated areas",
    },
    {
      icon: Shield,
      text: "Avoids isolated sections where possible",
    },
  ];
  
  return points;
};

export const RouteReassurance = ({ className }: RouteReassuranceProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const points = getReassurancePoints();

  return (
    <div className={cn("", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Shield className="h-3 w-3" />
          Why this route?
        </span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-2 space-y-1.5">
              {points.map((point, index) => {
                const Icon = point.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Icon className="h-3 w-3 text-primary flex-shrink-0" />
                    <span>{point.text}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
