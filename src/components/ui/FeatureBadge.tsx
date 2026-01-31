import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureBadgeProps {
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "verified" | "safety";
}

export const FeatureBadge = ({ label, icon: Icon, variant = "default" }: FeatureBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        variant === "default" && "bg-muted text-muted-foreground",
        variant === "verified" && "bg-primary/10 text-primary",
        variant === "safety" && "bg-safe/10 text-safe"
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </span>
  );
};
