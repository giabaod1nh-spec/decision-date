import { Participant, Vote } from '@/hooks/useRoom';

interface VoteProgressProps {
  participants: Participant[];
  votes: Vote[];
  currentRestaurantId?: string;
}

const VoteProgress = ({ participants, votes, currentRestaurantId }: VoteProgressProps) => {
  const activeParticipants = participants.filter(p => p.is_active);
  
  const votesForCurrent = currentRestaurantId 
    ? votes.filter(v => v.restaurant_id === currentRestaurantId)
    : [];
  
  const likesCount = votesForCurrent.filter(v => v.vote_type === 'like').length;
  const passCount = votesForCurrent.filter(v => v.vote_type === 'pass').length;
  const totalVoted = votesForCurrent.length;
  const totalParticipants = activeParticipants.length;
  
  const progress = totalParticipants > 0 ? (totalVoted / totalParticipants) * 100 : 0;

  if (totalParticipants <= 1) return null;

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-2">
      {/* Progress bar */}
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-2">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Vote stats */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{totalVoted}/{totalParticipants} voted</span>
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success" />
            {likesCount} likes
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            {passCount} pass
          </span>
        </div>
      </div>

      {/* All voted indicator */}
      {totalVoted === totalParticipants && totalParticipants > 1 && (
        <div className="mt-2 text-center">
          {likesCount === totalParticipants ? (
            <span className="text-success font-semibold animate-pulse">
              🎉 Everyone liked this!
            </span>
          ) : (
            <span className="text-muted-foreground">
              Moving to next...
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default VoteProgress;
