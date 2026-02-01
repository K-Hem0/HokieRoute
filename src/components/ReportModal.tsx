import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, HardHat, AlertTriangle, MoreHorizontal } from "lucide-react";
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
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Report an Issue</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What's the issue?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                    selectedCategory === category.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <category.icon className="h-5 w-5" />
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
              className="resize-none bg-background border-border text-sm"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
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
