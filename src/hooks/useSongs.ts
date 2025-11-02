import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  file_path?: string;
  thumbnail_url?: string;
  lyrics_timed?: any;
  source: 'local' | 'youtube' | 'vimeo';
  source_id?: string;
  tags?: string[];
  format: 'mp4' | 'mov' | 'mp3' | 'cdg' | 'youtube' | 'vimeo';
}

export const useSongs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Song[];
    },
  });

  const uploadSong = useMutation({
    mutationFn: async ({ 
      file, 
      metadata 
    }: { 
      file: File; 
      metadata: Partial<Song>;
    }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `songs/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('karaoke-songs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('karaoke-songs')
        .getPublicUrl(filePath);

      // Insert song record
      const { data, error } = await supabase
        .from('songs')
        .insert([{
          title: metadata.title || 'Untitled',
          artist: metadata.artist || 'Unknown',
          duration: metadata.duration || 0,
          file_path: publicUrl,
          source: 'local',
          format: fileExt as any,
          album: metadata.album,
          thumbnail_url: metadata.thumbnail_url,
          tags: metadata.tags,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      toast({
        title: "Música adicionada!",
        description: "A música foi adicionada à biblioteca.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar música",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSong = useMutation({
    mutationFn: async (songId: string) => {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      toast({
        title: "Música removida",
        description: "A música foi removida da biblioteca.",
      });
    },
  });

  return {
    songs,
    isLoading,
    uploadSong: uploadSong.mutate,
    isUploading: uploadSong.isPending,
    deleteSong: deleteSong.mutate,
  };
};