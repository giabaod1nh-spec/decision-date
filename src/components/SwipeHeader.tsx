import { ArrowLeft, Users } from "lucide-react";

interface SwipeHeaderProps {
  roomCode: string;
  onBack: () => void;
}

const SwipeHeader = ({ roomCode, onBack }: SwipeHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-4 py-4 border-b border-border/50">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground transition-colors hover:bg-muted"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
        <Users className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm tracking-wide">{roomCode}</span>
      </div>

      <div className="w-10 h-10" /> {/* Spacer for alignment */}
    </header>
  );
};

export default SwipeHeader;
