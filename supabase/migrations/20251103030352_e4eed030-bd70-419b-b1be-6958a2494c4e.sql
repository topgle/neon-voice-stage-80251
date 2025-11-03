-- Enable proper RLS policies for all tables
-- First, drop all existing overly permissive policies

-- Drop participants policies
DROP POLICY IF EXISTS "Anyone can view participants" ON public.participants;
DROP POLICY IF EXISTS "Anyone can add participants" ON public.participants;
DROP POLICY IF EXISTS "Anyone can update participants" ON public.participants;
DROP POLICY IF EXISTS "Anyone can delete participants" ON public.participants;

-- Drop performances policies
DROP POLICY IF EXISTS "Anyone can view performances" ON public.performances;
DROP POLICY IF EXISTS "Anyone can insert performances" ON public.performances;
DROP POLICY IF EXISTS "Anyone can update performances" ON public.performances;
DROP POLICY IF EXISTS "Anyone can delete performances" ON public.performances;

-- Drop songs policies
DROP POLICY IF EXISTS "Anyone can view songs" ON public.songs;
DROP POLICY IF EXISTS "Anyone can insert songs" ON public.songs;
DROP POLICY IF EXISTS "Anyone can update songs" ON public.songs;
DROP POLICY IF EXISTS "Anyone can delete songs" ON public.songs;

-- Drop playlists policies
DROP POLICY IF EXISTS "Anyone can view playlists" ON public.playlists;
DROP POLICY IF EXISTS "Anyone can insert playlists" ON public.playlists;
DROP POLICY IF EXISTS "Anyone can update playlists" ON public.playlists;
DROP POLICY IF EXISTS "Anyone can delete playlists" ON public.playlists;

-- Drop playlist_songs policies
DROP POLICY IF EXISTS "Anyone can view playlist songs" ON public.playlist_songs;
DROP POLICY IF EXISTS "Anyone can add playlist songs" ON public.playlist_songs;
DROP POLICY IF EXISTS "Anyone can update playlist songs" ON public.playlist_songs;
DROP POLICY IF EXISTS "Anyone can delete playlist songs" ON public.playlist_songs;

-- Drop sessions policies
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.the_voices_sessions;
DROP POLICY IF EXISTS "Anyone can create sessions" ON public.the_voices_sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.the_voices_sessions;
DROP POLICY IF EXISTS "Anyone can delete sessions" ON public.the_voices_sessions;

-- Create proper RLS policies for the_voices_sessions
CREATE POLICY "Anyone can view sessions"
ON public.the_voices_sessions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create sessions"
ON public.the_voices_sessions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND host_id = auth.uid());

CREATE POLICY "Hosts can update own sessions"
ON public.the_voices_sessions FOR UPDATE
USING (host_id = auth.uid());

CREATE POLICY "Hosts can delete own sessions"
ON public.the_voices_sessions FOR DELETE
USING (host_id = auth.uid());

-- Create proper RLS policies for participants
CREATE POLICY "Users can view session participants"
ON public.participants FOR SELECT
USING (
  session_id IN (
    SELECT id FROM the_voices_sessions WHERE host_id = auth.uid()
  )
  OR user_id = auth.uid()
  OR session_id IN (
    SELECT session_id FROM participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can add participants"
ON public.participants FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (user_id = auth.uid() OR user_id IS NULL)
);

CREATE POLICY "Session hosts and self can update participants"
ON public.participants FOR UPDATE
USING (
  user_id = auth.uid()
  OR session_id IN (
    SELECT id FROM the_voices_sessions WHERE host_id = auth.uid()
  )
);

CREATE POLICY "Session hosts can delete participants"
ON public.participants FOR DELETE
USING (
  session_id IN (
    SELECT id FROM the_voices_sessions WHERE host_id = auth.uid()
  )
);

-- Create proper RLS policies for performances
CREATE POLICY "Users can view own performances and session performances"
ON public.performances FOR SELECT
USING (
  participant_id IN (
    SELECT id FROM participants WHERE user_id = auth.uid()
  )
  OR session_id IN (
    SELECT id FROM the_voices_sessions WHERE host_id = auth.uid()
  )
  OR session_id IN (
    SELECT session_id FROM participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create performances"
ON public.performances FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    participant_id IN (
      SELECT id FROM participants WHERE user_id = auth.uid()
    )
    OR session_id IN (
      SELECT id FROM the_voices_sessions WHERE host_id = auth.uid()
    )
  )
);

CREATE POLICY "Session hosts can update performances"
ON public.performances FOR UPDATE
USING (
  session_id IN (
    SELECT id FROM the_voices_sessions WHERE host_id = auth.uid()
  )
);

CREATE POLICY "Session hosts can delete performances"
ON public.performances FOR DELETE
USING (
  session_id IN (
    SELECT id FROM the_voices_sessions WHERE host_id = auth.uid()
  )
);

-- Create proper RLS policies for songs
-- Keep read access public for karaoke catalog
CREATE POLICY "Anyone can view songs"
ON public.songs FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add songs"
ON public.songs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own songs"
ON public.songs FOR UPDATE
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete own songs"
ON public.songs FOR DELETE
USING (user_id = auth.uid() OR user_id IS NULL);

-- Create proper RLS policies for playlists
CREATE POLICY "Users can view public playlists or own playlists"
ON public.playlists FOR SELECT
USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Authenticated users can create playlists"
ON public.playlists FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update own playlists"
ON public.playlists FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own playlists"
ON public.playlists FOR DELETE
USING (user_id = auth.uid());

-- Create proper RLS policies for playlist_songs
CREATE POLICY "Users can view songs in accessible playlists"
ON public.playlist_songs FOR SELECT
USING (
  playlist_id IN (
    SELECT id FROM playlists WHERE is_public = true OR user_id = auth.uid()
  )
);

CREATE POLICY "Playlist owners can manage playlist songs"
ON public.playlist_songs FOR INSERT
WITH CHECK (
  playlist_id IN (
    SELECT id FROM playlists WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Playlist owners can update playlist songs"
ON public.playlist_songs FOR UPDATE
USING (
  playlist_id IN (
    SELECT id FROM playlists WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Playlist owners can delete playlist songs"
ON public.playlist_songs FOR DELETE
USING (
  playlist_id IN (
    SELECT id FROM playlists WHERE user_id = auth.uid()
  )
);