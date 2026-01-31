import { cn } from "@/lib/utils";
import { Footprints, Bike } from "lucide-react";

type Mode = 'walk' | 'cycle';

interface ModeToggleProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const ModeToggle = ({ mode, onChange }: ModeToggleProps) => {
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1">
      <button
        onClick={() => onChange('walk')}
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
          mode === 'walk'
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Footprints className="h-4 w-4" />
        Walk
      </button>
      <button
        onClick={() => onChange('cycle')}
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
          mode === 'cycle'
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Bike className="h-4 w-4" />
        Cycle
      </button>
    </div>
  );
};

export { ModeToggle };
export type { Mode };
