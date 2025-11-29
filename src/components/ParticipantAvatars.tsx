import { Participant, Vote } from '@/hooks/useRoom';

interface ParticipantAvatarsProps {
  participants: Participant[];
  currentParticipantId?: string;
  votes: Vote[];
  currentRestaurantId?: string;
}

const ParticipantAvatars = ({ 
  participants, 
  currentParticipantId, 
  votes, 
  currentRestaurantId 
}: ParticipantAvatarsProps) => {
  const activeParticipants = participants.filter(p => p.is_active);

  const hasVoted = (participantId: string) => {
    if (!currentRestaurantId) return false;
    return votes.some(
      v => v.participant_id === participantId && v.restaurant_id === currentRestaurantId
    );
  };

  const getVoteType = (participantId: string) => {
    if (!currentRestaurantId) return null;
    const vote = votes.find(
      v => v.participant_id === participantId && v.restaurant_id === currentRestaurantId
    );
    return vote?.vote_type || null;
  };

  return (
    <div className="flex items-center gap-2">
      {activeParticipants.map((participant) => {
        const voted = hasVoted(participant.id);
        const voteType = getVoteType(participant.id);
        const isCurrentUser = participant.id === currentParticipantId;

        return (
          <div
            key={participant.id}
            className={`relative group ${isCurrentUser ? 'order-first' : ''}`}
          >
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg
                transition-all duration-300
                ${isCurrentUser 
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                  : ''
                }
                ${voted 
                  ? voteType === 'like' 
                    ? 'bg-success/20 ring-2 ring-success' 
                    : 'bg-destructive/20 ring-2 ring-destructive'
                  : 'bg-secondary'
                }
              `}
            >
              {participant.avatar_emoji}
            </div>
            
            {/* Voting indicator */}
            {voted && (
              <div className={`
                absolute -bottom-1 -right-1 w-4 h-4 rounded-full
                flex items-center justify-center text-[10px]
                ${voteType === 'like' ? 'bg-success' : 'bg-destructive'}
              `}>
                {voteType === 'like' ? '✓' : '✗'}
              </div>
            )}

            {/* Tooltip */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="text-xs bg-popover text-popover-foreground px-2 py-1 rounded whitespace-nowrap">
                {participant.nickname}
                {isCurrentUser && ' (You)'}
              </span>
            </div>
          </div>
        );
      })}

      {/* Participant count badge */}
      <div className="ml-2 px-2 py-1 bg-secondary rounded-full text-xs text-muted-foreground">
        {activeParticipants.length} {activeParticipants.length === 1 ? 'person' : 'people'}
      </div>
    </div>
  );
};

export default ParticipantAvatars;
