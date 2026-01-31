import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface PillInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const PillInput = React.forwardRef<HTMLInputElement, PillInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-12 items-center gap-3 rounded-full border border-border bg-card px-4 shadow-lg transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          className
        )}
      >
        {icon || <Search className="h-5 w-5 text-muted-foreground" />}
        <input
          ref={ref}
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          {...props}
        />
      </div>
    );
  }
);
PillInput.displayName = "PillInput";

export { PillInput };
