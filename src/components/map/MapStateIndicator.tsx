import { MapState } from "@/hooks/useMapState";
import { motion } from "framer-motion";
import { Compass, Route, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapStateIndicatorProps {
  state: MapState;
}

const stateConfig = {
  explore: {
    label: "Explore",
    icon: Compass,
    color: "bg-secondary text-secondary-foreground",
  },
  planning: {
    label: "Planning",
    icon: Route,
    color: "bg-primary/20 text-primary",
  },
  navigation: {
    label: "Navigating",
    icon: Navigation,
    color: "bg-primary text-primary-foreground",
  },
};

export function MapStateIndicator({ state }: MapStateIndicatorProps) {
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <motion.div
      key={state}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm",
        config.color
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </motion.div>
  );
}
