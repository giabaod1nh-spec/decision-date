import { useState, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import SyncedCardStack from "@/components/SyncedCardStack";
import SwipeHeader from "@/components/SwipeHeader";
import RoomLobby from "@/components/RoomLobby";
import SessionSummary from "@/components/SessionSummary";
import { Restaurant } from "@/components/RestaurantCard";
import { useSession } from "@/hooks/useSession";
import { useRoom } from "@/hooks/useRoom";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/use-toast";

type View = "landing" | "lobby" | "swiping" | "summary";

const Index = () => {
  const [view, setView] = useState<View>("landing");
  const [sessionStats, setSessionStats] = useState({ totalSwiped: 0, likesCount: 0 });
  
  const { session } = useSession();
  const { latitude, longitude } = useGeolocation();
  const { toast } = useToast();
  
  const { 
    room, 
    participants, 
    currentParticipant,
    votes,
    matches,
    loading,
    error,
    createRoom, 
    joinRoom, 
    vote,
    leaveRoom 
  } = useRoom(session);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Don't show match modal during swiping - matches shown at end in summary

  const handleCreateRoom = async () => {
    const newRoom = await createRoom(latitude || undefined, longitude || undefined);
    if (newRoom) {
      setView("lobby");
    }
  };

  const handleJoinRoom = async (code: string) => {
    const joinedRoom = await joinRoom(code);
    if (joinedRoom) {
      setView("lobby");
    }
  };

  const handleStartSwiping = () => {
    setSessionStats({ totalSwiped: 0, likesCount: 0 });
    setView("swiping");
  };

  const handleVote = async (restaurant: Restaurant, voteType: 'like' | 'pass') => {
    await vote(restaurant, voteType);
    setSessionStats(prev => ({
      totalSwiped: prev.totalSwiped + 1,
      likesCount: prev.likesCount + (voteType === 'like' ? 1 : 0),
    }));
  };

  // Match modal not used during swiping anymore

  const handleSessionEnd = () => {
    setView("summary");
  };

  const handlePlayAgain = async () => {
    setSessionStats({ totalSwiped: 0, likesCount: 0 });
    setView("lobby");
  };

  const handleGoHome = async () => {
    await leaveRoom();
    setSessionStats({ totalSwiped: 0, likesCount: 0 });
    setView("landing");
  };

  const handleBack = async () => {
    if (view === "swiping") {
      setView("lobby");
    } else if (view === "lobby") {
      await leaveRoom();
      setView("landing");
    } else {
      setView("landing");
    }
  };

  const isHost = room?.host_id === session?.id;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {view === "landing" && (
        <LandingPage 
          onCreateRoom={handleCreateRoom} 
          onJoinRoom={handleJoinRoom} 
        />
      )}

      {view === "lobby" && room && (
        <RoomLobby
          roomCode={room.code}
          participants={participants}
          currentParticipantId={currentParticipant?.id}
          isHost={isHost}
          onStart={handleStartSwiping}
          onBack={handleBack}
        />
      )}

      {view === "swiping" && room && (
        <>
          <SwipeHeader roomCode={room.code} onBack={handleBack} />
          <SyncedCardStack 
            participants={participants}
            currentParticipantId={currentParticipant?.id}
            votes={votes}
            matches={matches}
            onVote={handleVote}
            onSessionEnd={handleSessionEnd}
            roomLocation={{ 
              lat: room.location_lat ? Number(room.location_lat) : null, 
              lng: room.location_lng ? Number(room.location_lng) : null 
            }}
          />
        </>
      )}

      {view === "summary" && (
        <SessionSummary
          votes={votes}
          participants={participants}
          totalSwiped={sessionStats.totalSwiped}
          likesCount={sessionStats.likesCount}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
        />
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default Index;
