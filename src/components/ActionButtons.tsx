import { X, Heart, RotateCcw } from "lucide-react";

interface ActionButtonsProps {
  onSwipe: (direction: "left" | "right") => void;
}

const ActionButtons = ({ onSwipe }: ActionButtonsProps) => {
  return (
    <div className="flex items-center justify-center gap-6 py-6 px-4">
      {/* Pass button */}
      <button
        onClick={() => onSwipe("left")}
        className="action-btn-pass"
        aria-label="Pass"
      >
        <X className="w-7 h-7" strokeWidth={3} />
      </button>

      {/* Undo button (decorative for now) */}
      <button
        className="action-btn bg-secondary/50 text-muted-foreground border border-border w-12 h-12"
        aria-label="Undo"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* Like button */}
      <button
        onClick={() => onSwipe("right")}
        className="action-btn-like"
        aria-label="Like"
      >
        <Heart className="w-7 h-7" strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default ActionButtons;
