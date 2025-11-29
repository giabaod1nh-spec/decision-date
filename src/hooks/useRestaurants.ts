import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/components/RestaurantCard';

interface UseRestaurantsReturn {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  fetchRestaurants: (lat: number, long: number) => Promise<void>;
  retry: () => void;
}

export const useRestaurants = (): UseRestaurantsReturn => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCoords, setLastCoords] = useState<{ lat: number; long: number } | null>(null);

  const fetchRestaurants = useCallback(async (lat: number, long: number) => {
    setLoading(true);
    setError(null);
    setLastCoords({ lat, long });

    try {
      console.log('Fetching restaurants for:', lat, long);
      
      const { data, error: fnError } = await supabase.functions.invoke('nearby-restaurants', {
        body: { lat, long },
      });

      if (fnError) {
        console.error('Function error:', fnError);
        throw new Error(fnError.message || 'Failed to fetch restaurants');
      }

      if (!data?.restaurants || data.restaurants.length === 0) {
        setError('No restaurants found within 2km');
        setRestaurants([]);
      } else {
        setRestaurants(data.restaurants);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch restaurants');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    if (lastCoords) {
      fetchRestaurants(lastCoords.lat, lastCoords.long);
    }
  }, [lastCoords, fetchRestaurants]);

  return { restaurants, loading, error, fetchRestaurants, retry };
};
