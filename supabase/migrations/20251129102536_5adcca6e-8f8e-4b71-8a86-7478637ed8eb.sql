-- Create rooms table for decision sessions
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  location_lat DECIMAL,
  location_lng DECIMAL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '2 hours')
);

-- Create room participants table
CREATE TABLE public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_session_id UUID NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  avatar_emoji VARCHAR(10) DEFAULT '🍽️',
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(room_id, user_session_id)
);

-- Create votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.room_participants(id) ON DELETE CASCADE,
  restaurant_id VARCHAR(255) NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  restaurant_image TEXT,
  restaurant_rating DECIMAL,
  vote_type VARCHAR(10) NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  restaurant_id VARCHAR(255) NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  restaurant_data JSONB,
  match_count INTEGER DEFAULT 0,
  matched_at TIMESTAMPTZ DEFAULT now()
);

-- Create global restaurant rankings for leaderboard
CREATE TABLE public.restaurant_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id VARCHAR(255) UNIQUE NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  restaurant_image TEXT,
  restaurant_data JSONB,
  total_likes INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_rankings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms (public read for joining, anyone can create)
CREATE POLICY "Anyone can create rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view rooms by code" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Host can update their rooms" ON public.rooms FOR UPDATE USING (true);

-- RLS Policies for room_participants
CREATE POLICY "Anyone can join rooms" ON public.room_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Participants can view room members" ON public.room_participants FOR SELECT USING (true);
CREATE POLICY "Participants can update their status" ON public.room_participants FOR UPDATE USING (true);

-- RLS Policies for votes
CREATE POLICY "Participants can vote" ON public.votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Participants can view votes in their room" ON public.votes FOR SELECT USING (true);

-- RLS Policies for matches
CREATE POLICY "Anyone can create matches" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);

-- RLS Policies for restaurant_rankings (public leaderboard)
CREATE POLICY "Anyone can view rankings" ON public.restaurant_rankings FOR SELECT USING (true);
CREATE POLICY "System can update rankings" ON public.restaurant_rankings FOR INSERT WITH CHECK (true);
CREATE POLICY "System can modify rankings" ON public.restaurant_rankings FOR UPDATE USING (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;

-- Create indexes for performance
CREATE INDEX idx_rooms_code ON public.rooms(code);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_participants_room ON public.room_participants(room_id);
CREATE INDEX idx_votes_room ON public.votes(room_id);
CREATE INDEX idx_votes_restaurant ON public.votes(restaurant_id);
CREATE INDEX idx_matches_room ON public.matches(room_id);
CREATE INDEX idx_rankings_score ON public.restaurant_rankings(total_matches DESC, total_likes DESC);