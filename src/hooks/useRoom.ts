import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from './useSession';
import { Restaurant } from '@/components/RestaurantCard';

export interface Room {
  id: string;
  code: string;
  host_id: string;
  location_lat: number | null;
  location_lng: number | null;
  status: string;
  created_at: string;
}

export interface Participant {
  id: string;
  room_id: string;
  user_session_id: string;
  nickname: string;
  avatar_emoji: string;
  is_active: boolean;
  joined_at: string;
}

export interface Vote {
  id: string;
  room_id: string;
  participant_id: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_image: string | null;
  vote_type: 'like' | 'pass';
  voted_at: string;
}

export interface Match {
  id: string;
  room_id: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_data: Restaurant | null;
  match_count: number;
  matched_at: string;
}

const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useRoom = (session: UserSession | null) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new room
  const createRoom = useCallback(async (lat?: number, lng?: number) => {
    if (!session) return null;
    setLoading(true);
    setError(null);

    try {
      const code = generateRoomCode();
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code,
          host_id: session.id,
          location_lat: lat || null,
          location_lng: lng || null,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Join as participant
      const { data: participantData, error: participantError } = await supabase
        .from('room_participants')
        .insert({
          room_id: roomData.id,
          user_session_id: session.id,
          nickname: session.nickname,
          avatar_emoji: session.avatar,
        })
        .select()
        .single();

      if (participantError) throw participantError;

      setRoom(roomData);
      setCurrentParticipant(participantData);
      setParticipants([participantData]);
      return roomData;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Join an existing room
  const joinRoom = useCallback(async (code: string) => {
    if (!session) return null;
    setLoading(true);
    setError(null);

    try {
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select()
        .eq('code', code.toUpperCase())
        .eq('status', 'active')
        .single();

      if (roomError) throw new Error('Room not found or expired');

      // Check if already a participant
      const { data: existingParticipant } = await supabase
        .from('room_participants')
        .select()
        .eq('room_id', roomData.id)
        .eq('user_session_id', session.id)
        .single();

      let participantData;
      if (existingParticipant) {
        // Reactivate
        const { data, error } = await supabase
          .from('room_participants')
          .update({ is_active: true })
          .eq('id', existingParticipant.id)
          .select()
          .single();
        if (error) throw error;
        participantData = data;
      } else {
        // Join as new participant
        const { data, error } = await supabase
          .from('room_participants')
          .insert({
            room_id: roomData.id,
            user_session_id: session.id,
            nickname: session.nickname,
            avatar_emoji: session.avatar,
          })
          .select()
          .single();
        if (error) throw error;
        participantData = data;
      }

      setRoom(roomData);
      setCurrentParticipant(participantData);
      return roomData;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Vote on a restaurant
  const vote = useCallback(async (restaurant: Restaurant, voteType: 'like' | 'pass') => {
    if (!room || !currentParticipant) return;

    try {
      await supabase.from('votes').insert({
        room_id: room.id,
        participant_id: currentParticipant.id,
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        restaurant_image: restaurant.image,
        restaurant_rating: restaurant.rating,
        vote_type: voteType,
      });

      // Update global rankings
      if (voteType === 'like') {
        const { data: existing } = await supabase
          .from('restaurant_rankings')
          .select()
          .eq('restaurant_id', restaurant.id)
          .single();

        if (existing) {
          await supabase
            .from('restaurant_rankings')
            .update({ 
              total_likes: (existing.total_likes || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('restaurant_id', restaurant.id);
        } else {
          await supabase.from('restaurant_rankings').insert({
            restaurant_id: restaurant.id,
            restaurant_name: restaurant.name,
            restaurant_image: restaurant.image,
            restaurant_data: restaurant as any,
            total_likes: 1,
            total_views: 1,
          });
        }
      }
    } catch (err) {
      console.error('Vote error:', err);
    }
  }, [room, currentParticipant]);

  // Check for matches
  const checkForMatch = useCallback(async (restaurantId: string, restaurant: Restaurant) => {
    if (!room) return null;

    const activeParticipants = participants.filter(p => p.is_active);
    const restaurantVotes = votes.filter(
      v => v.restaurant_id === restaurantId && v.vote_type === 'like'
    );

    // Check if all active participants have liked this restaurant
    const allLiked = activeParticipants.every(p =>
      restaurantVotes.some(v => v.participant_id === p.id)
    );

    if (allLiked && activeParticipants.length > 1) {
      // It's a match!
      const { data: matchData } = await supabase
        .from('matches')
        .insert({
          room_id: room.id,
          restaurant_id: restaurantId,
          restaurant_name: restaurant.name,
          restaurant_data: restaurant as any,
          match_count: activeParticipants.length,
        })
        .select()
        .single();

      // Update global rankings for match
      const { data: existing } = await supabase
        .from('restaurant_rankings')
        .select()
        .eq('restaurant_id', restaurantId)
        .single();

      if (existing) {
        await supabase
          .from('restaurant_rankings')
          .update({ 
            total_matches: (existing.total_matches || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('restaurant_id', restaurantId);
      }

      return matchData;
    }

    return null;
  }, [room, participants, votes]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!room) return;

    // Fetch initial participants
    const fetchParticipants = async () => {
      const { data } = await supabase
        .from('room_participants')
        .select()
        .eq('room_id', room.id);
      if (data) setParticipants(data);
    };

    // Fetch initial votes
    const fetchVotes = async () => {
      const { data } = await supabase
        .from('votes')
        .select()
        .eq('room_id', room.id);
      if (data) setVotes(data as Vote[]);
    };

    // Fetch initial matches
    const fetchMatches = async () => {
      const { data } = await supabase
        .from('matches')
        .select()
        .eq('room_id', room.id);
      if (data) {
        setMatches(data.map(m => ({
          ...m,
          restaurant_data: m.restaurant_data as unknown as Restaurant | null,
        })));
      }
    };

    fetchParticipants();
    fetchVotes();
    fetchMatches();

    // Subscribe to participants
    const participantsChannel = supabase
      .channel(`room_participants_${room.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'room_participants',
        filter: `room_id=eq.${room.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setParticipants(prev => [...prev, payload.new as Participant]);
        } else if (payload.eventType === 'UPDATE') {
          setParticipants(prev => 
            prev.map(p => p.id === payload.new.id ? payload.new as Participant : p)
          );
        }
      })
      .subscribe();

    // Subscribe to votes
    const votesChannel = supabase
      .channel(`votes_${room.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'votes',
        filter: `room_id=eq.${room.id}`,
      }, (payload) => {
        setVotes(prev => [...prev, payload.new as Vote]);
      })
      .subscribe();

    // Subscribe to matches
    const matchesChannel = supabase
      .channel(`matches_${room.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'matches',
        filter: `room_id=eq.${room.id}`,
      }, (payload) => {
        setMatches(prev => [...prev, payload.new as Match]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(matchesChannel);
    };
  }, [room]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (currentParticipant) {
      await supabase
        .from('room_participants')
        .update({ is_active: false })
        .eq('id', currentParticipant.id);
    }
    setRoom(null);
    setCurrentParticipant(null);
    setParticipants([]);
    setVotes([]);
    setMatches([]);
  }, [currentParticipant]);

  return {
    room,
    participants,
    currentParticipant,
    votes,
    matches,
    loading,
    error,
    createRoom,
    joinRoom,
    vote,
    checkForMatch,
    leaveRoom,
  };
};
