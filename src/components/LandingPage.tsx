import { useState } from "react";
import { Utensils, Users, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
}

const LandingPage = ({ onCreateRoom, onJoinRoom }: LandingPageProps) => {
  const [roomCode, setRoomCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);

  const handleJoin = () => {
    if (roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-purple rounded-full blur-[100px] opacity-30" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-pink rounded-full blur-[100px] opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-orange rounded-full blur-[150px] opacity-20" />

      {/* Logo & Title */}
      <div className="relative z-10 text-center mb-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center animate-float">
          <Utensils className="w-10 h-10 text-foreground" />
        </div>
        <h1 className="text-4xl font-extrabold mb-3 gradient-text">
          DiningDecider
        </h1>
        <p className="text-muted-foreground text-lg max-w-xs mx-auto">
          Swipe together, eat together. Find the perfect restaurant with friends.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 w-full max-w-sm space-y-4">
        <button
          onClick={onCreateRoom}
          className="w-full btn-gradient flex items-center justify-center gap-3 animate-pulse-glow"
        >
          <Users className="w-5 h-5" />
          Create Decision Room
        </button>

        {!showJoinInput ? (
          <button
            onClick={() => setShowJoinInput(true)}
            className="w-full btn-secondary"
          >
            Join Room
          </button>
        ) : (
          <div className="space-y-3 animate-slide-up">
            <div className="gradient-border">
              <input
                type="text"
                placeholder="Enter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-6 py-4 bg-card rounded-lg text-center text-xl font-semibold tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none"
                maxLength={6}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinInput(false)}
                className="flex-1 btn-secondary text-base py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={!roomCode.trim()}
                className="flex-1 btn-gradient text-base py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <p className="absolute bottom-8 text-sm text-muted-foreground">
        Swipe right to like, left to pass
      </p>
    </div>
  );
};

export default LandingPage;
