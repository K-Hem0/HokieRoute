import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, HardHat, AlertTriangle, MoreHorizontal, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReportCategory = "broken-light" | "construction" | "unsafe-area" | "other" | null;

const categories = [
  { id: "broken-light" as const, label: "Broken light", icon: Lightbulb },
  { id: "construction" as const, label: "Construction", icon: HardHat },
  { id: "unsafe-area" as const, label: "Unsafe area", icon: AlertTriangle },
  { id: "other" as const, label: "Other", icon: MoreHorizontal },
];

export const ReportModal = ({ isOpen, onClose }: ReportModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>(null);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }
    
    toast.success("Report submitted", {
      description: "Thank you for helping keep our community safe.",
    });
    
    // Reset state
    setSelectedCategory(null);
    setNote("");
    onClose();
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setNote("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Report an Issue</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pin Drop Section (Mocked) */}
          <div className="relative aspect-[16/9] rounded-xl border border-border bg-background overflow-hidden">
            {/* Mock map grid */}
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                {[...Array(10)].map((_, i) => (
                  <g key={i}>
                    <line
                      x1={i * 10}
                      y1="0"
                      x2={i * 10}
                      y2="60"
                      stroke="currentColor"
                      strokeWidth="0.3"
                      className="text-muted-foreground"
                    />
                    <line
                      x1="0"
                      y1={i * 6}
                      x2="100"
                      y2={i * 6}
                      stroke="currentColor"
                      strokeWidth="0.3"
                      className="text-muted-foreground"
                    />
                  </g>
                ))}
              </svg>
            </div>
            
            {/* Center pin */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <MapPin className="h-8 w-8 text-caution fill-caution/20" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-caution/30 rounded-full blur-sm" />
              </div>
            </div>
            
            {/* Instruction */}
            <div className="absolute bottom-2 inset-x-0 text-center">
              <span className="text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded">
                Tap to adjust pin location
              </span>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              What's the issue?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                    selectedCategory === category.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <category.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Additional details (optional)
            </label>
            <Textarea
              placeholder="Describe the issue..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none bg-background border-border"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
