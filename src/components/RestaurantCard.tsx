import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Star, MapPin, Heart, X } from "lucide-react";

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  distance: string;
  cuisine: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
}

const RestaurantCard = ({ restaurant, onSwipe, isTop }: RestaurantCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      exit={{
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
      whileDrag={{ scale: 1.02 }}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden glass-card">
        {/* Image */}
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {/* Like indicator */}
        <motion.div
          className="absolute top-8 left-8 px-4 py-2 rounded-lg border-4 border-success bg-success/20 rotate-[-20deg]"
          style={{ opacity: likeOpacity }}
        >
          <span className="text-2xl font-bold text-success">LIKE</span>
        </motion.div>

        {/* Pass indicator */}
        <motion.div
          className="absolute top-8 right-8 px-4 py-2 rounded-lg border-4 border-destructive bg-destructive/20 rotate-[20deg]"
          style={{ opacity: passOpacity }}
        >
          <span className="text-2xl font-bold text-destructive">NOPE</span>
        </motion.div>

        {/* Restaurant info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-3 py-1 rounded-full bg-secondary/80 backdrop-blur-sm">
              {restaurant.cuisine}
            </span>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground">
            {restaurant.name}
          </h2>

          <div className="flex items-center gap-4">
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(restaurant.rating)
                      ? "text-gradient-orange fill-gradient-orange"
                      : "text-muted"
                  }`}
                />
              ))}
              <span className="ml-1 text-foreground font-semibold">
                {restaurant.rating}
              </span>
            </div>

            {/* Distance */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{restaurant.distance}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantCard;
