import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  thumbnail_url?: string;
  created_at: string;
  user_id: string;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  position: number;
  added_at: string;
}

export const usePlaylists = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Playlist[];
    },
  });

  const createPlaylist = useMutation({
    mutationFn: async ({ 
      name, 
      description,
      isPublic = false,
    }: { 
      name: string; 
      description?: string;
      isPublic?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('playlists')
        .insert([{
          name,
          description,
          is_public: isPublic,
          user_id: 'public-user',
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast({
        title: "Playlist criada!",
        description: "Nova playlist adicionada com sucesso.",
      });
    },
  });

  const deletePlaylist = useMutation({
    mutationFn: async (playlistId: string) => {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast({
        title: "Playlist removida",
        description: "A playlist foi removida com sucesso.",
      });
    },
  });

  const updatePlaylist = useMutation({
    mutationFn: async ({ 
      playlistId, 
      name, 
      description 
    }: { 
      playlistId: string; 
      name?: string; 
      description?: string;
    }) => {
      const { error } = await supabase
        .from('playlists')
        .update({ name, description })
        .eq('id', playlistId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast({
        title: "Playlist atualizada",
        description: "As alterações foram salvas.",
      });
    },
  });

  const addSongToPlaylist = useMutation({
    mutationFn: async ({ 
      playlistId, 
      songId 
    }: { 
      playlistId: string; 
      songId: string;
    }) => {
      // Get current max position
      const { data: songs } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = songs && songs.length > 0 ? songs[0].position + 1 : 0;

      const { error } = await supabase
        .from('playlist_songs')
        .insert([{
          playlist_id: playlistId,
          song_id: songId,
          position: nextPosition,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-songs'] });
      toast({
        title: "Música adicionada!",
        description: "A música foi adicionada à playlist.",
      });
    },
  });

  const getPlaylistSongs = async (playlistId: string) => {
    const { data, error } = await supabase
      .from('playlist_songs')
      .select(`
        *,
        songs (*)
      `)
      .eq('playlist_id', playlistId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    return data;
  };

  return {
    playlists,
    isLoading,
    createPlaylist: createPlaylist.mutate,
    updatePlaylist: updatePlaylist.mutate,
    deletePlaylist: deletePlaylist.mutate,
    addSongToPlaylist: addSongToPlaylist.mutate,
    getPlaylistSongs,
  };
};