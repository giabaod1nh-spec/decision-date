import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RankedRestaurant {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_image: string | null;
  total_likes: number;
  total_matches: number;
  total_views: number;
}

export type LeaderboardFilter = 'matches' | 'likes' | 'trending';

export const useLeaderboard = () => {
  const [rankings, setRankings] = useState<RankedRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<LeaderboardFilter>('matches');

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('restaurant_rankings')
        .select('*')
        .limit(20);

      if (filter === 'matches') {
        query = query.order('total_matches', { ascending: false });
      } else if (filter === 'likes') {
        query = query.order('total_likes', { ascending: false });
      } else {
        // Trending - recent activity weighted
        query = query.order('updated_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setRankings(data || []);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return { rankings, loading, filter, setFilter, refresh: fetchRankings };
};
