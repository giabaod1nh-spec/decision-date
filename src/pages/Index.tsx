import { useState, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import SyncedCardStack from "@/components/SyncedCardStack";
import SwipeHeader from "@/components/SwipeHeader";
import MatchModal from "@/components/MatchModal";
import RoomLobby from "@/components/RoomLobby";
import Leaderboard from "@/components/Leaderboard";
import { Restaurant } from "@/components/RestaurantCard";
import { useSession } from "@/hooks/useSession";
import { useRoom } from "@/hooks/useRoom";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type View = "landing" | "lobby" | "swiping" | "leaderboard";

const Index = () => {
  const [view, setView] = useState<View>("landing");
  const [matchedRestaurant, setMatchedRestaurant] = useState<Restaurant | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  
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

  // Watch for new matches from realtime
  useEffect(() => {
    if (matches.length > 0) {
      const latestMatch = matches[matches.length - 1];
      if (latestMatch.restaurant_data && !showMatch) {
        setMatchedRestaurant(latestMatch.restaurant_data);
        setShowMatch(true);
      }
    }
  }, [matches]);

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
    setView("swiping");
  };

  const handleVote = async (restaurant: Restaurant, voteType: 'like' | 'pass') => {
    await vote(restaurant, voteType);
  };

  const handleMatch = (restaurant: Restaurant) => {
    setMatchedRestaurant(restaurant);
    setShowMatch(true);
  };

  const handleCloseMatch = () => {
    setShowMatch(false);
    setMatchedRestaurant(null);
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
        <>
          <LandingPage 
            onCreateRoom={handleCreateRoom} 
            onJoinRoom={handleJoinRoom} 
          />
          {/* Leaderboard button */}
          <button
            onClick={() => setView("leaderboard")}
            className="fixed bottom-20 right-4 w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Trophy className="w-6 h-6 text-foreground" />
          </button>
        </>
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
            onMatch={handleMatch}
            roomLocation={{ 
              lat: room.location_lat ? Number(room.location_lat) : null, 
              lng: room.location_lng ? Number(room.location_lng) : null 
            }}
          />
        </>
      )}

      {view === "leaderboard" && (
        <Leaderboard onBack={() => setView("landing")} />
      )}

      <MatchModal
        restaurant={matchedRestaurant}
        isOpen={showMatch}
        onClose={handleCloseMatch}
      />

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
