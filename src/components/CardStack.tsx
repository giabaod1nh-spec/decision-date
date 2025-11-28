import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import RestaurantCard, { Restaurant } from "./RestaurantCard";
import ActionButtons from "./ActionButtons";

const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "Sakura Sushi",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
    rating: 4.8,
    distance: "0.3km",
    cuisine: "Japanese",
  },
  {
    id: "2",
    name: "Bella Italia",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    rating: 4.5,
    distance: "0.5km",
    cuisine: "Italian",
  },
  {
    id: "3",
    name: "El Mariachi",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
    rating: 4.6,
    distance: "0.8km",
    cuisine: "Mexican",
  },
  {
    id: "4",
    name: "Golden Dragon",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80",
    rating: 4.4,
    distance: "1.2km",
    cuisine: "Chinese",
  },
  {
    id: "5",
    name: "Le Petit Bistro",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    rating: 4.9,
    distance: "1.5km",
    cuisine: "French",
  },
];

interface CardStackProps {
  onMatch: (restaurant: Restaurant) => void;
}

const CardStack = ({ onMatch }: CardStackProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(MOCK_RESTAURANTS);
  const [likedRestaurants, setLikedRestaurants] = useState<string[]>([]);

  const handleSwipe = (direction: "left" | "right") => {
    if (restaurants.length === 0) return;

    const currentRestaurant = restaurants[0];

    if (direction === "right") {
      // Simulate match on every other like for demo purposes
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

  if (restaurants.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 mb-6 rounded-full gradient-primary flex items-center justify-center opacity-50">
          <span className="text-4xl">🍽️</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          No more restaurants!
        </h2>
        <p className="text-muted-foreground">
          Check back later for more options
        </p>
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
