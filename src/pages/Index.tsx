import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import CardStack from "@/components/CardStack";
import SwipeHeader from "@/components/SwipeHeader";
import MatchModal from "@/components/MatchModal";
import { Restaurant } from "@/components/RestaurantCard";

const Index = () => {
  const [view, setView] = useState<"landing" | "swiping">("landing");
  const [roomCode, setRoomCode] = useState("");
  const [matchedRestaurant, setMatchedRestaurant] = useState<Restaurant | null>(null);
  const [showMatch, setShowMatch] = useState(false);

  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    setRoomCode(code);
    setView("swiping");
  };

  const handleJoinRoom = (code: string) => {
    setRoomCode(code);
    setView("swiping");
  };

  const handleMatch = (restaurant: Restaurant) => {
    setMatchedRestaurant(restaurant);
    setShowMatch(true);
  };

  const handleCloseMatch = () => {
    setShowMatch(false);
    setMatchedRestaurant(null);
  };

  const handleBack = () => {
    setView("landing");
    setRoomCode("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {view === "landing" ? (
        <LandingPage onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
      ) : (
        <>
          <SwipeHeader roomCode={roomCode} onBack={handleBack} />
          <CardStack onMatch={handleMatch} />
        </>
      )}

      <MatchModal
        restaurant={matchedRestaurant}
        isOpen={showMatch}
        onClose={handleCloseMatch}
      />
    </div>
  );
};

export default Index;
