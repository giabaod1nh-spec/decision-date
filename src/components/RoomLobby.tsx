import { useState } from 'react';
import { Copy, Check, Users, Play, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Participant } from '@/hooks/useRoom';
import { useToast } from '@/hooks/use-toast';

interface RoomLobbyProps {
  roomCode: string;
  participants: Participant[];
  currentParticipantId?: string;
  isHost: boolean;
  onStart: () => void;
  onBack: () => void;
}

const RoomLobby = ({ 
  roomCode, 
  participants, 
  currentParticipantId,
  isHost,
  onStart,
  onBack
}: RoomLobbyProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const activeParticipants = participants.filter(p => p.is_active);

  const copyCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast({
      title: "Room code copied!",
      description: "Share this code with your friends",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const canStart = activeParticipants.length >= 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-purple rounded-full blur-[100px] opacity-30" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-pink rounded-full blur-[100px] opacity-30" />

      <div className="relative z-10 w-full max-w-md">
        {/* Room Code Display */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Decision Room</h1>
          </div>
          
          <button 
            onClick={copyCode}
            className="group gradient-border p-1 cursor-pointer"
          >
            <div className="bg-card rounded-lg px-8 py-4 flex items-center gap-3">
              <span className="text-3xl font-bold tracking-[0.3em] gradient-text">
                {roomCode}
              </span>
              {copied ? (
                <Check className="w-5 h-5 text-success" />
              ) : (
                <Copy className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
          </button>
          
          <p className="text-sm text-muted-foreground mt-3">
            Share this code with friends to join
          </p>
        </div>

        {/* Participants List */}
        <div className="bg-card rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Waiting Room ({activeParticipants.length})
          </h2>
          
          <div className="space-y-3">
            {activeParticipants.map((participant) => (
              <div 
                key={participant.id}
                className={`
                  flex items-center gap-3 p-3 rounded-xl
                  ${participant.id === currentParticipantId 
                    ? 'bg-primary/10 border border-primary/30' 
                    : 'bg-secondary'
                  }
                `}
              >
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-xl">
                  {participant.avatar_emoji}
                </div>
                <div className="flex-1">
                  <span className="font-medium">
                    {participant.nickname}
                  </span>
                  {participant.id === currentParticipantId && (
                    <span className="text-xs text-primary ml-2">(You)</span>
                  )}
                </div>
                {participant.user_session_id === participants[0]?.user_session_id && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                    Host
                  </span>
                )}
              </div>
            ))}
          </div>

          {activeParticipants.length === 1 && (
            <div className="mt-4 text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Waiting for others to join...
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onStart}
            disabled={!canStart}
            className="w-full btn-gradient h-14 text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            {isHost ? 'Start Swiping' : 'Ready to Start'}
          </Button>
          
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full h-12"
          >
            Leave Room
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomLobby;
