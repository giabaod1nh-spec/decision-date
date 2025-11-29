import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { MapPin, Star, PartyPopper, Navigation } from "lucide-react";
import { Restaurant } from "./RestaurantCard";

interface MatchModalProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
}

const openGoogleMapsDirections = (restaurant: Restaurant) => {
  // Build the destination - combine name and address for best results
  let destination = restaurant.name;
  
  if (restaurant.address) {
    destination = `${restaurant.name}, ${restaurant.address}`;
  }
  
  // Build URL parameters
  const params = new URLSearchParams({
    api: '1',
    travelmode: 'driving',
    destination: destination,
  });
  
  // Add place_id if available (most accurate)
  if (restaurant.placeId) {
    params.set('destination_place_id', restaurant.placeId);
  }
  
  // If we have coordinates, use them as destination for precision
  if (restaurant.latitude && restaurant.longitude) {
    params.set('destination', `${restaurant.latitude},${restaurant.longitude}`);
  }
  
  const mapsUrl = `https://www.google.com/maps/dir/?${params.toString()}`;
  window.open(mapsUrl, '_blank');
};

const MatchModal = ({ restaurant, isOpen, onClose }: MatchModalProps) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#a855f7", "#ec4899", "#f97316"],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#a855f7", "#ec4899", "#f97316"],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!restaurant) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-full max-w-sm glass-card rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 text-center gradient-primary">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-background/20 flex items-center justify-center"
              >
                <PartyPopper className="w-8 h-8 text-foreground" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-extrabold text-foreground"
              >
                It's a Match!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-foreground/80 mt-2"
              >
                Everyone agreed on this one!
              </motion.p>
            </div>

            {/* Restaurant info */}
            <div className="p-6 space-y-4">
              <div className="relative h-40 rounded-2xl overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="px-2 py-1 text-xs rounded-full bg-secondary/80 text-foreground">
                    {restaurant.cuisine}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-gradient-orange">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{restaurant.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.distance}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={onClose}
                  className="flex-1 btn-secondary"
                >
                  Keep Swiping
                </button>
                <button
                  onClick={() => {
                    openGoogleMapsDirections(restaurant);
                    onClose();
                  }}
                  className="flex-1 btn-gradient flex items-center justify-center gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  Let's Go!
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchModal;
