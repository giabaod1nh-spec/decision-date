import { useState, useCallback } from 'react';
import { Restaurant } from '@/components/RestaurantCard';

// Use local backend server instead of Supabase
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
      
      const response = await fetch(`${API_URL}/api/nearby-restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, long }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch restaurants');
      }

      const data = await response.json();

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
