import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}

const ThemeToggle = ({ isDark, onToggle, className }: ThemeToggleProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggle}
            className={cn(
              "flex items-center justify-center control-btn rounded-full border border-border bg-card transition-all hover:bg-secondary",
              isDark && "bg-card/90 border-primary/30",
              className
            )}
            aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
          >
            {isDark ? (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            ) : (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[180px]">
          <p className="font-medium text-xs">
            {isDark ? "Night Mode" : "Day Mode"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {isDark 
              ? "Optimized for low-light navigation" 
              : "Optimized for planning & exploration"
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export { ThemeToggle };
