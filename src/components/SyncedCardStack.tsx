import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import RestaurantCard, { Restaurant } from "./RestaurantCard";
import ActionButtons from "./ActionButtons";
import ParticipantAvatars from "./ParticipantAvatars";
import VoteProgress from "./VoteProgress";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRestaurants } from "@/hooks/useRestaurants";
import { Participant, Vote, Match } from "@/hooks/useRoom";
import { Loader2, MapPin, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface SyncedCardStackProps {
  participants: Participant[];
  currentParticipantId?: string;
  votes: Vote[];
  matches: Match[];
  onVote: (restaurant: Restaurant, voteType: 'like' | 'pass') => void;
  onMatch: (restaurant: Restaurant) => void;
  roomLocation?: { lat: number | null; lng: number | null };
}

const SyncedCardStack = ({ 
  participants, 
  currentParticipantId,
  votes,
  matches,
  onVote,
  onMatch,
  roomLocation
}: SyncedCardStackProps) => {
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();
  const { restaurants: fetchedRestaurants, loading: restaurantsLoading, error: restaurantsError, fetchRestaurants, retry } = useRestaurants();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use room location if available, otherwise use user's location
  const effectiveLat = roomLocation?.lat || latitude;
  const effectiveLng = roomLocation?.lng || longitude;

  // Fetch restaurants when location is available
  useEffect(() => {
    if (effectiveLat && effectiveLng) {
      fetchRestaurants(effectiveLat, effectiveLng);
    }
  }, [effectiveLat, effectiveLng, fetchRestaurants]);

  // Update local state when fetched restaurants change
  useEffect(() => {
    if (fetchedRestaurants.length > 0) {
      setRestaurants(fetchedRestaurants);
    }
  }, [fetchedRestaurants]);

  // Check if current user has voted on current restaurant
  const currentRestaurant = restaurants[currentIndex];
  const hasVotedOnCurrent = currentRestaurant && votes.some(
    v => v.participant_id === currentParticipantId && v.restaurant_id === currentRestaurant.id
  );

  // Auto-advance when all participants have voted
  const activeParticipants = participants.filter(p => p.is_active);
  const votesOnCurrent = currentRestaurant 
    ? votes.filter(v => v.restaurant_id === currentRestaurant.id)
    : [];
  
  useEffect(() => {
    if (!currentRestaurant) return;
    
    const allVoted = activeParticipants.length > 0 && 
      activeParticipants.every(p => 
        votesOnCurrent.some(v => v.participant_id === p.id)
      );

    if (allVoted) {
      // Check for match (all liked)
      const allLiked = votesOnCurrent.every(v => v.vote_type === 'like');
      
      if (allLiked && activeParticipants.length > 1) {
        // It's a match!
        setTimeout(() => {
          onMatch(currentRestaurant);
        }, 500);
      }

      // Move to next restaurant after a delay
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, allLiked && activeParticipants.length > 1 ? 2000 : 1000);
    }
  }, [votesOnCurrent.length, activeParticipants.length, currentRestaurant]);

  const handleSwipe = useCallback((direction: "left" | "right") => {
    if (!currentRestaurant || hasVotedOnCurrent) return;

    const voteType = direction === "right" ? "like" : "pass";
    onVote(currentRestaurant, voteType);

    // If single player, move immediately
    if (activeParticipants.length <= 1) {
      if (direction === "right" && Math.random() > 0.6) {
        setTimeout(() => onMatch(currentRestaurant), 300);
      }
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentRestaurant, hasVotedOnCurrent, onVote, onMatch, activeParticipants.length]);

  // Location loading state
  if (geoLoading && !roomLocation?.lat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 mb-6 rounded-full gradient-primary flex items-center justify-center animate-pulse">
          <MapPin className="w-10 h-10 text-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Finding your location...
        </h2>
        <p className="text-muted-foreground">
          Please allow location access
        </p>
      </div>
    );
  }

  // Location error state
  if (geoError && !roomLocation?.lat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
          <MapPin className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Location Required
        </h2>
        <p className="text-muted-foreground mb-4">
          {geoError}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Restaurants loading state
  if (restaurantsLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 mb-6 rounded-full gradient-primary flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-foreground animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Scanning nearby area...
        </h2>
        <p className="text-muted-foreground">
          Finding the best restaurants for you
        </p>
      </div>
    );
  }

  // No more restaurants
  if (restaurantsError || currentIndex >= restaurants.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 mb-6 rounded-full gradient-primary flex items-center justify-center opacity-50">
          <span className="text-4xl">🍽️</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {restaurantsError || "No more restaurants!"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {matches.length > 0 
            ? `You found ${matches.length} match${matches.length > 1 ? 'es' : ''}!` 
            : "Check back later for more options"
          }
        </p>
        <Button onClick={retry} className="gradient-primary text-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const displayRestaurants = restaurants.slice(currentIndex, currentIndex + 3);

  return (
    <div className="flex-1 flex flex-col">
      {/* Participants bar */}
      <div className="px-4 py-3 border-b border-border/50">
        <ParticipantAvatars 
          participants={participants}
          currentParticipantId={currentParticipantId}
          votes={votes}
          currentRestaurantId={currentRestaurant?.id}
        />
      </div>

      {/* Vote progress */}
      <VoteProgress 
        participants={participants}
        votes={votes}
        currentRestaurantId={currentRestaurant?.id}
      />

      {/* Card container */}
      <div className="flex-1 relative px-4 py-4">
        <div className="relative w-full h-full max-w-sm mx-auto" style={{ aspectRatio: "3/4" }}>
          <AnimatePresence>
            {displayRestaurants
              .reverse()
              .map((restaurant, index) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onSwipe={handleSwipe}
                  isTop={index === displayRestaurants.length - 1 && !hasVotedOnCurrent}
                />
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Action buttons - disabled if already voted */}
      <div className={hasVotedOnCurrent ? 'opacity-50 pointer-events-none' : ''}>
        <ActionButtons onSwipe={handleSwipe} />
      </div>

      {hasVotedOnCurrent && (
        <p className="text-center text-sm text-muted-foreground pb-4">
          Waiting for others to vote...
        </p>
      )}
    </div>
  );
};

export default SyncedCardStack;
