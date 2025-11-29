import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import RestaurantCard, { Restaurant } from "./RestaurantCard";
import ActionButtons from "./ActionButtons";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRestaurants } from "@/hooks/useRestaurants";
import { Loader2, MapPin, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface CardStackProps {
  onMatch: (restaurant: Restaurant) => void;
}

const CardStack = ({ onMatch }: CardStackProps) => {
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();
  const { restaurants: fetchedRestaurants, loading: restaurantsLoading, error: restaurantsError, fetchRestaurants, retry } = useRestaurants();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [likedRestaurants, setLikedRestaurants] = useState<string[]>([]);

  // Fetch restaurants when location is available
  useEffect(() => {
    if (latitude && longitude) {
      fetchRestaurants(latitude, longitude);
    }
  }, [latitude, longitude, fetchRestaurants]);

  // Update local state when fetched restaurants change
  useEffect(() => {
    if (fetchedRestaurants.length > 0) {
      setRestaurants(fetchedRestaurants);
    }
  }, [fetchedRestaurants]);

  const handleSwipe = (direction: "left" | "right") => {
    if (restaurants.length === 0) return;

    const currentRestaurant = restaurants[0];

    if (direction === "right") {
      const newLiked = [...likedRestaurants, currentRestaurant.id];
      setLikedRestaurants(newLiked);
      
      // 40% chance of match for demo
      if (Math.random() > 0.6) {
        setTimeout(() => {
          onMatch(currentRestaurant);
        }, 300);
      }
    }

    setRestaurants((prev) => prev.slice(1));
  };

  // Location loading state
  if (geoLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 mb-6 rounded-full gradient-primary flex items-center justify-center animate-pulse">
          <MapPin className="w-10 h-10 text-white" />
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
  if (geoError) {
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
          <Loader2 className="w-10 h-10 text-white animate-spin" />
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

  // Restaurants error or empty state
  if (restaurantsError || restaurants.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 mb-6 rounded-full gradient-primary flex items-center justify-center opacity-50">
          <span className="text-4xl">🍽️</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {restaurantsError || "No more restaurants!"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {restaurantsError ? "Try searching a different area" : "Check back later for more options"}
        </p>
        <Button onClick={retry} className="gradient-primary text-white">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Card container */}
      <div className="flex-1 relative px-4 py-4">
        <div className="relative w-full h-full max-w-sm mx-auto" style={{ aspectRatio: "3/4" }}>
          <AnimatePresence>
            {restaurants
              .slice(0, 3)
              .reverse()
              .map((restaurant, index) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onSwipe={handleSwipe}
                  isTop={index === restaurants.slice(0, 3).length - 1}
                />
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Action buttons */}
      <ActionButtons onSwipe={handleSwipe} />
    </div>
  );
};

export default CardStack;
