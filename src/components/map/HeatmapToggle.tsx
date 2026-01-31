import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeatmapToggleProps {
  enabled: boolean;
  onToggle: () => void;
  loading?: boolean;
}

export function HeatmapToggle({ enabled, onToggle, loading }: HeatmapToggleProps) {
  return (
    <Button
      variant={enabled ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      disabled={loading}
      className={cn(
        "gap-2 shadow-lg transition-all duration-200",
        "bg-background/95 backdrop-blur-sm hover:bg-background",
        enabled && "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
    >
      <Flame className="h-4 w-4" />
      <span className="text-xs font-medium">
        {enabled ? "Heatmap On" : "Heatmap"}
      </span>
    </Button>
  );
}
