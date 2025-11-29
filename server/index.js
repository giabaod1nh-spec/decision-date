const express = require('express');
const cors = require('cors');
const path = require('path');

// Load .env from project root (parent directory)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Nearby restaurants endpoint
app.post('/api/nearby-restaurants', async (req, res) => {
  try {
    const { lat, long } = req.body;

    console.log(`Fetching restaurants near: ${lat}, ${long}`);

    if (!lat || !long) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const serpApiKey = process.env.SERPAPI_KEY;
    if (!serpApiKey) {
      console.error('SERPAPI_KEY not configured');
      return res.status(500).json({ error: 'API key not configured. Add SERPAPI_KEY to your .env file' });
    }

    // Search for restaurants using SerpAPI Google Maps
    const searchQuery = 'restaurants';
    const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(searchQuery)}&ll=@${lat},${long},14z&api_key=${serpApiKey}`;

    console.log('Calling SerpAPI...');
    const response = await fetch(url);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('SerpAPI error:', response.status, response.statusText);
      console.error('SerpAPI error body:', errorBody);
      return res.status(500).json({ error: 'Failed to fetch restaurants', details: errorBody });
    }

    const data = await response.json();
    console.log(`Found ${data.local_results?.length || 0} restaurants`);

    // Map the results to our format
    const restaurants = (data.local_results || []).slice(0, 10).map((place) => {
      // Log first restaurant to debug data structure
      if (place === data.local_results[0]) {
        console.log('Sample restaurant data:', JSON.stringify(place, null, 2));
      }
      
      return {
        id: place.place_id || place.data_id || String(Math.random()),
        name: place.title || 'Unknown Restaurant',
        rating: place.rating || 4.0,
        image: place.thumbnail || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80`,
        cuisine: place.type || 'Restaurant',
        distance: place.distance || 'Nearby',
        latitude: place.gps_coordinates?.latitude || place.latitude,
        longitude: place.gps_coordinates?.longitude || place.longitude,
        placeId: place.place_id || place.data_id,
        address: place.address || place.formatted_address || '',
      };
    });

    return res.json({ restaurants });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
  console.log(`📍 Nearby restaurants API: POST http://localhost:${PORT}/api/nearby-restaurants`);
});

