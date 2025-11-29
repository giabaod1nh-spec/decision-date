import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, long } = await req.json();
    
    console.log(`Fetching restaurants near: ${lat}, ${long}`);
    
    if (!lat || !long) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const serpApiKey = Deno.env.get('SERPAPI_KEY');
    if (!serpApiKey) {
      console.error('SERPAPI_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search for restaurants using SerpAPI Google Maps
    const searchQuery = 'restaurants';
    const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(searchQuery)}&ll=@${lat},${long},14z&api_key=${serpApiKey}`;
    
    console.log('Calling SerpAPI...');
    console.log('API Key length:', serpApiKey.length, 'First 4 chars:', serpApiKey.substring(0, 4));
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('SerpAPI error:', response.status, response.statusText);
      console.error('SerpAPI error body:', errorBody);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch restaurants', details: errorBody }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`Found ${data.local_results?.length || 0} restaurants`);

    // Map the results to our format
    const restaurants = (data.local_results || []).slice(0, 10).map((place: any) => ({
      id: place.place_id || place.data_id || String(Math.random()),
      name: place.title || 'Unknown Restaurant',
      rating: place.rating || 4.0,
      image: place.thumbnail || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80`,
      cuisine: place.type || 'Restaurant',
      distance: place.distance || 'Nearby',
      latitude: place.gps_coordinates?.latitude,
      longitude: place.gps_coordinates?.longitude,
      placeId: place.place_id,
      address: place.address,
    }));

    return new Response(
      JSON.stringify({ restaurants }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
