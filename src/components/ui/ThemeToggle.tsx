import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}

const ThemeToggle = ({ isDark, onToggle, className }: ThemeToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium transition-all hover:bg-secondary",
        className
      )}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Day</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Night</span>
        </>
      )}
    </button>
  );
};

export { ThemeToggle };
