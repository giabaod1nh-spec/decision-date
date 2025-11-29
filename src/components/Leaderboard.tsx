import { Trophy, Heart, TrendingUp, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useLeaderboard, LeaderboardFilter } from '@/hooks/useLeaderboard';

interface LeaderboardProps {
  onBack: () => void;
}

const Leaderboard = ({ onBack }: LeaderboardProps) => {
  const { rankings, loading, filter, setFilter } = useLeaderboard();

  const filters: { key: LeaderboardFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'matches', label: 'Most Matched', icon: <Trophy className="w-4 h-4" /> },
    { key: 'likes', label: 'Most Liked', icon: <Heart className="w-4 h-4" /> },
    { key: 'trending', label: 'Trending', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border/50">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold gradient-text">Leaderboard</h1>
      </header>

      {/* Filters */}
      <div className="flex gap-2 px-4 py-4 overflow-x-auto">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-2 whitespace-nowrap ${
              filter === f.key ? 'gradient-primary' : ''
            }`}
          >
            {f.icon}
            {f.label}
          </Button>
        ))}
      </div>

      {/* Rankings List */}
      <div className="flex-1 px-4 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No rankings yet</p>
            <p className="text-sm text-muted-foreground">Start swiping to see restaurants here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rankings.map((restaurant, index) => (
              <div
                key={restaurant.id}
                className={`
                  flex items-center gap-4 p-4 rounded-2xl bg-card
                  ${index < 3 ? 'border border-primary/30' : ''}
                `}
              >
                {/* Rank Badge */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                  ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : ''}
                  ${index === 1 ? 'bg-gray-400/20 text-gray-400' : ''}
                  ${index === 2 ? 'bg-amber-600/20 text-amber-600' : ''}
                  ${index > 2 ? 'bg-secondary text-muted-foreground' : ''}
                `}>
                  {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                </div>

                {/* Restaurant Image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                  {restaurant.restaurant_image ? (
                    <img
                      src={restaurant.restaurant_image}
                      alt={restaurant.restaurant_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🍽️
                    </div>
                  )}
                </div>

                {/* Restaurant Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {restaurant.restaurant_name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-primary" />
                      {restaurant.total_matches} matches
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-accent" />
                      {restaurant.total_likes} likes
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
