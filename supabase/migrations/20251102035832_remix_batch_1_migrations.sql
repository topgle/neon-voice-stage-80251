
-- Migration: 20251102034456

-- Migration: 20251102033354

-- Migration: 20251102031523

-- Migration: 20251102024459

-- Migration: 20251102024312
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for song sources
CREATE TYPE song_source AS ENUM ('local', 'youtube', 'vimeo', 'external');

-- Create enum for song formats
CREATE TYPE song_format AS ENUM ('mp4', 'mov', 'm4v', 'mp3', 'aac', 'wav', 'webm');

-- Create songs table
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT 'Unknown Artist',
  album TEXT,
  duration FLOAT NOT NULL,
  bpm FLOAT,
  key TEXT,
  file_path TEXT,
  thumbnail_url TEXT,
  format song_format NOT NULL,
  source song_source NOT NULL DEFAULT 'local',
  source_id TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  lyrics_timed JSONB,
  instrumental_track_path TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  downloadable BOOLEAN DEFAULT true,
  fingerprint TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create playlists table
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create playlist_songs junction table
CREATE TABLE public.playlist_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(playlist_id, song_id)
);

-- Create the_voices_sessions table
CREATE TABLE public.the_voices_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'paused', 'finished')),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create participants table
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.the_voices_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  total_score FLOAT DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create performances table
CREATE TABLE public.performances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.the_voices_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  score FLOAT NOT NULL DEFAULT 0,
  pitch_accuracy FLOAT,
  rhythm_accuracy FLOAT,
  expression_score FLOAT,
  feedback_text TEXT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_songs_user_id ON public.songs(user_id);
CREATE INDEX idx_songs_source ON public.songs(source);
CREATE INDEX idx_songs_title ON public.songs(title);
CREATE INDEX idx_songs_artist ON public.songs(artist);
CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX idx_playlist_songs_playlist_id ON public.playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_song_id ON public.playlist_songs(song_id);
CREATE INDEX idx_the_voices_sessions_host_id ON public.the_voices_sessions(host_id);
CREATE INDEX idx_participants_session_id ON public.participants(session_id);
CREATE INDEX idx_performances_session_id ON public.performances(session_id);
CREATE INDEX idx_performances_participant_id ON public.performances(participant_id);

-- Enable Row Level Security
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.the_voices_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for songs
CREATE POLICY "Users can view their own songs"
  ON public.songs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public songs"
  ON public.songs FOR SELECT
  USING (source IN ('youtube', 'vimeo'));

CREATE POLICY "Users can insert their own songs"
  ON public.songs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own songs"
  ON public.songs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own songs"
  ON public.songs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for playlists
CREATE POLICY "Users can view their own playlists"
  ON public.playlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public playlists"
  ON public.playlists FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert their own playlists"
  ON public.playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
  ON public.playlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON public.playlists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for playlist_songs
CREATE POLICY "Users can view songs in their playlists"
  ON public.playlist_songs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND (playlists.user_id = auth.uid() OR playlists.is_public = true)
    )
  );

CREATE POLICY "Users can add songs to their playlists"
  ON public.playlist_songs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove songs from their playlists"
  ON public.playlist_songs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- RLS Policies for the_voices_sessions
CREATE POLICY "Users can view sessions they host or participate in"
  ON public.the_voices_sessions FOR SELECT
  USING (
    auth.uid() = host_id OR
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.session_id = the_voices_sessions.id
      AND participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own sessions"
  ON public.the_voices_sessions FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their sessions"
  ON public.the_voices_sessions FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their sessions"
  ON public.the_voices_sessions FOR DELETE
  USING (auth.uid() = host_id);

-- RLS Policies for participants
CREATE POLICY "Users can view participants in their sessions"
  ON public.participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.the_voices_sessions
      WHERE the_voices_sessions.id = participants.session_id
      AND (the_voices_sessions.host_id = auth.uid() OR participants.user_id = auth.uid())
    )
  );

CREATE POLICY "Session hosts can add participants"
  ON public.participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.the_voices_sessions
      WHERE the_voices_sessions.id = participants.session_id
      AND the_voices_sessions.host_id = auth.uid()
    )
  );

CREATE POLICY "Session hosts can update participants"
  ON public.participants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.the_voices_sessions
      WHERE the_voices_sessions.id = participants.session_id
      AND the_voices_sessions.host_id = auth.uid()
    )
  );

-- RLS Policies for performances
CREATE POLICY "Users can view performances in their sessions"
  ON public.performances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.the_voices_sessions
      WHERE the_voices_sessions.id = performances.session_id
      AND (the_voices_sessions.host_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM public.participants
             WHERE participants.session_id = performances.session_id
             AND participants.user_id = auth.uid()
           ))
    )
  );

CREATE POLICY "Session hosts can insert performances"
  ON public.performances FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.the_voices_sessions
      WHERE the_voices_sessions.id = performances.session_id
      AND the_voices_sessions.host_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_songs_updated_at
  BEFORE UPDATE ON public.songs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_the_voices_sessions_updated_at
  BEFORE UPDATE ON public.the_voices_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update participant total score
CREATE OR REPLACE FUNCTION public.update_participant_total_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.participants
  SET total_score = (
    SELECT COALESCE(SUM(score), 0)
    FROM public.performances
    WHERE participant_id = NEW.participant_id
  )
  WHERE id = NEW.participant_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update participant score after performance
CREATE TRIGGER update_participant_score_after_performance
  AFTER INSERT OR UPDATE ON public.performances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_participant_total_score();


-- Migration: 20251102024836
-- Ajustar RLS policies para acesso público temporário
-- Remover políticas existentes que exigem autenticação

-- Songs: acesso público total
DROP POLICY IF EXISTS "Users can view public songs" ON public.songs;
DROP POLICY IF EXISTS "Users can view their own songs" ON public.songs;
DROP POLICY IF EXISTS "Users can insert their own songs" ON public.songs;
DROP POLICY IF EXISTS "Users can update their own songs" ON public.songs;
DROP POLICY IF EXISTS "Users can delete their own songs" ON public.songs;

CREATE POLICY "Anyone can view songs" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert songs" ON public.songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update songs" ON public.songs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete songs" ON public.songs FOR DELETE USING (true);

-- Playlists: acesso público total
DROP POLICY IF EXISTS "Users can view public playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can view their own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can insert their own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can update their own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can delete their own playlists" ON public.playlists;

CREATE POLICY "Anyone can view playlists" ON public.playlists FOR SELECT USING (true);
CREATE POLICY "Anyone can insert playlists" ON public.playlists FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update playlists" ON public.playlists FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete playlists" ON public.playlists FOR DELETE USING (true);

-- Playlist songs: acesso público total
DROP POLICY IF EXISTS "Users can view songs in their playlists" ON public.playlist_songs;
DROP POLICY IF EXISTS "Users can add songs to their playlists" ON public.playlist_songs;
DROP POLICY IF EXISTS "Users can remove songs from their playlists" ON public.playlist_songs;

CREATE POLICY "Anyone can view playlist songs" ON public.playlist_songs FOR SELECT USING (true);
CREATE POLICY "Anyone can add playlist songs" ON public.playlist_songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update playlist songs" ON public.playlist_songs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete playlist songs" ON public.playlist_songs FOR DELETE USING (true);

-- The Voices Sessions: acesso público total
DROP POLICY IF EXISTS "Users can view sessions they host or participate in" ON public.the_voices_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON public.the_voices_sessions;
DROP POLICY IF EXISTS "Hosts can update their sessions" ON public.the_voices_sessions;
DROP POLICY IF EXISTS "Hosts can delete their sessions" ON public.the_voices_sessions;

CREATE POLICY "Anyone can view sessions" ON public.the_voices_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create sessions" ON public.the_voices_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON public.the_voices_sessions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete sessions" ON public.the_voices_sessions FOR DELETE USING (true);

-- Participants: acesso público total
DROP POLICY IF EXISTS "Users can view participants in their sessions" ON public.participants;
DROP POLICY IF EXISTS "Session hosts can add participants" ON public.participants;
DROP POLICY IF EXISTS "Session hosts can update participants" ON public.participants;

CREATE POLICY "Anyone can view participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Anyone can add participants" ON public.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update participants" ON public.participants FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete participants" ON public.participants FOR DELETE USING (true);

-- Performances: acesso público total
DROP POLICY IF EXISTS "Users can view performances in their sessions" ON public.performances;
DROP POLICY IF EXISTS "Session hosts can insert performances" ON public.performances;

CREATE POLICY "Anyone can view performances" ON public.performances FOR SELECT USING (true);
CREATE POLICY "Anyone can insert performances" ON public.performances FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update performances" ON public.performances FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete performances" ON public.performances FOR DELETE USING (true);

-- Criar storage buckets públicos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('karaoke-songs', 'karaoke-songs', true, 524288000, ARRAY['video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp3', 'audio/wav']),
  ('song-thumbnails', 'song-thumbnails', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies públicas
CREATE POLICY "Anyone can view karaoke songs" ON storage.objects 
FOR SELECT USING (bucket_id = 'karaoke-songs');

CREATE POLICY "Anyone can upload karaoke songs" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'karaoke-songs');

CREATE POLICY "Anyone can update karaoke songs" ON storage.objects 
FOR UPDATE USING (bucket_id = 'karaoke-songs');

CREATE POLICY "Anyone can delete karaoke songs" ON storage.objects 
FOR DELETE USING (bucket_id = 'karaoke-songs');

CREATE POLICY "Anyone can view song thumbnails" ON storage.objects 
FOR SELECT USING (bucket_id = 'song-thumbnails');

CREATE POLICY "Anyone can upload song thumbnails" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'song-thumbnails');

CREATE POLICY "Anyone can update song thumbnails" ON storage.objects 
FOR UPDATE USING (bucket_id = 'song-thumbnails');

CREATE POLICY "Anyone can delete song thumbnails" ON storage.objects 
FOR DELETE USING (bucket_id = 'song-thumbnails');


-- Migration: 20251102031948
-- Create trigger to update participant total score
CREATE OR REPLACE FUNCTION public.update_participant_total_score()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.participants
  SET total_score = (
    SELECT COALESCE(SUM(score), 0)
    FROM public.performances
    WHERE participant_id = NEW.participant_id
  )
  WHERE id = NEW.participant_id;
  RETURN NEW;
END;
$function$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_total_score_trigger ON public.performances;

CREATE TRIGGER update_total_score_trigger
AFTER INSERT OR UPDATE ON public.performances
FOR EACH ROW
EXECUTE FUNCTION public.update_participant_total_score();

-- Migration: 20251102032016
-- Fix search_path for security
CREATE OR REPLACE FUNCTION public.update_participant_total_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.participants
  SET total_score = (
    SELECT COALESCE(SUM(score), 0)
    FROM public.performances
    WHERE participant_id = NEW.participant_id
  )
  WHERE id = NEW.participant_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;


-- Migration: 20251102033521
-- Add popularity tracking and genre to songs table
ALTER TABLE public.songs 
ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_played_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS genre TEXT;

-- Create index for better performance on queries
CREATE INDEX IF NOT EXISTS idx_songs_play_count ON public.songs(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_songs_last_played ON public.songs(last_played_at DESC);
CREATE INDEX IF NOT EXISTS idx_songs_bpm ON public.songs(bpm);
CREATE INDEX IF NOT EXISTS idx_songs_key ON public.songs(key);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON public.songs(genre);

-- Function to increment play count
CREATE OR REPLACE FUNCTION public.increment_play_count(song_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.songs
  SET play_count = COALESCE(play_count, 0) + 1,
      last_played_at = NOW()
  WHERE id = song_uuid;
END;
$$;

-- Migration: 20251102033717
-- Add preferred_songs column to participants table
ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS preferred_songs TEXT[] DEFAULT ARRAY[]::TEXT[];

