import { cn } from "@/lib/utils";
import { SafetyLevel, getSafetyColor, getSafetyLabel } from "@/lib/mock-data";
import { Shield, AlertTriangle, AlertCircle } from "lucide-react";

interface SafetyBadgeProps {
  level: SafetyLevel;
  size?: "sm" | "md";
  showIcon?: boolean;
}

const SafetyBadge = ({ level, size = "sm", showIcon = true }: SafetyBadgeProps) => {
  const Icon = level === 'safe' ? Shield : level === 'moderate' ? AlertTriangle : AlertCircle;
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        getSafetyColor(level),
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      {showIcon && <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />}
      {getSafetyLabel(level)}
    </span>
  );
};

export { SafetyBadge };
