import { Flame, FlameKindling } from "lucide-react";
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
      variant="outline"
      size="icon"
      onClick={onToggle}
      disabled={loading}
      className={cn(
        "h-10 w-10 rounded-full shadow-lg border-2 transition-all duration-200",
        "bg-background/95 backdrop-blur-sm",
        enabled
          ? "border-destructive text-destructive hover:bg-destructive/10"
          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/50"
      )}
      title={enabled ? "Hide safety heatmap" : "Show safety heatmap"}
    >
      {enabled ? (
        <Flame className="h-5 w-5" />
      ) : (
        <FlameKindling className="h-5 w-5" />
      )}
    </Button>
  );
}
