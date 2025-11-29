import { Trophy, Heart, TrendingUp, Home, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Vote, Participant } from '@/hooks/useRoom';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useMemo } from 'react';

interface CalculatedMatch {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_image: string | null;
  likeCount: number;
}

interface SessionSummaryProps {
  votes: Vote[];
  participants: Participant[];
  totalSwiped: number;
  likesCount: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

const SessionSummary = ({ 
  votes,
  participants,
  totalSwiped, 
  likesCount, 
  onPlayAgain, 
  onGoHome 
}: SessionSummaryProps) => {
  const { rankings, loading } = useLeaderboard();

  // Calculate matches: restaurants that all active participants liked
  const matches = useMemo(() => {
    const activeParticipants = participants.filter(p => p.is_active);
    if (activeParticipants.length === 0) return [];

    // Group votes by restaurant
    const votesByRestaurant = votes.reduce((acc, vote) => {
      if (!acc[vote.restaurant_id]) {
        acc[vote.restaurant_id] = {
          name: vote.restaurant_name,
          image: vote.restaurant_image,
          likes: [] as string[],
        };
      }
      if (vote.vote_type === 'like') {
        acc[vote.restaurant_id].likes.push(vote.participant_id);
      }
      return acc;
    }, {} as Record<string, { name: string; image: string | null; likes: string[] }>);

    // Find restaurants where all participants liked
    const matchedRestaurants: CalculatedMatch[] = [];
    for (const [restaurantId, data] of Object.entries(votesByRestaurant)) {
      const allLiked = activeParticipants.every(p => 
        data.likes.includes(p.id)
      );
      if (allLiked) {
        matchedRestaurants.push({
          restaurant_id: restaurantId,
          restaurant_name: data.name,
          restaurant_image: data.image,
          likeCount: data.likes.length,
        });
      }
    }

    return matchedRestaurants;
  }, [votes, participants]);

  return (
    <div className="min-h-screen flex flex-col bg-background px-4 py-6 overflow-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
          <Trophy className="w-10 h-10 text-foreground" />
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Session Complete!</h1>
        <p className="text-muted-foreground">Here's how you did</p>
      </div>

      {/* Your Stats */}
      <div className="bg-card rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Your Stats</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{totalSwiped}</div>
            <div className="text-xs text-muted-foreground">Restaurants</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success">{likesCount}</div>
            <div className="text-xs text-muted-foreground">Likes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">{matches.length}</div>
            <div className="text-xs text-muted-foreground">Matches</div>
          </div>
        </div>
      </div>

      {/* Your Matches */}
      {matches.length > 0 && (
        <div className="bg-card rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent" />
            Group Matches
          </h2>
          <div className="space-y-3">
            {matches.map((match) => (
              <div key={match.restaurant_id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {match.restaurant_image ? (
                    <img
                      src={match.restaurant_image}
                      alt={match.restaurant_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{match.restaurant_name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Everyone liked this!
                  </p>
                </div>
                <div className="text-2xl">🎉</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {matches.length === 0 && (
        <div className="bg-card rounded-2xl p-6 mb-6 text-center">
          <div className="text-4xl mb-2">😅</div>
          <h2 className="text-lg font-semibold mb-2">No Matches Yet</h2>
          <p className="text-sm text-muted-foreground">
            No restaurants where everyone agreed. Try again with different choices!
          </p>
        </div>
      )}

      {/* Global Leaderboard */}
      <div className="bg-card rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Global Leaderboard
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rankings.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No rankings yet</p>
        ) : (
          <div className="space-y-2">
            {rankings.slice(0, 5).map((restaurant, index) => (
              <div
                key={restaurant.id}
                className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl"
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : ''}
                  ${index === 1 ? 'bg-gray-400/20 text-gray-400' : ''}
                  ${index === 2 ? 'bg-amber-600/20 text-amber-600' : ''}
                  ${index > 2 ? 'bg-muted text-muted-foreground' : ''}
                `}>
                  {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                </div>
                
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {restaurant.restaurant_image ? (
                    <img
                      src={restaurant.restaurant_image}
                      alt={restaurant.restaurant_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">🍽️</div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{restaurant.restaurant_name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{restaurant.total_matches} matches</span>
                    <span>•</span>
                    <span>{restaurant.total_likes} likes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3 mt-auto">
        <Button onClick={onPlayAgain} className="w-full btn-gradient h-14 text-lg">
          <RotateCcw className="w-5 h-5 mr-2" />
          Play Again
        </Button>
        <Button onClick={onGoHome} variant="outline" className="w-full h-12">
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default SessionSummary;
