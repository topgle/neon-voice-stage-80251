import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlaylists } from "@/hooks/usePlaylists";
import { toast } from "sonner";
import type { SortOption } from "./PlaylistManager";

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  bpm?: number;
  key?: string;
  genre?: string;
  play_count?: number;
  last_played_at?: string;
}

interface PlaylistSong {
  id: string;
  song_id: string;
  position: number;
  songs: Song;
}

interface SongListProps {
  playlistId: string;
  sortBy: SortOption;
  onAddSimilar: (songId: string) => void;
}

export const SongList = ({ playlistId, sortBy, onAddSimilar }: SongListProps) => {
  const { getPlaylistSongs } = usePlaylists();

  const { data: playlistSongs = [], isLoading, refetch } = useQuery({
    queryKey: ['playlist-songs', playlistId, sortBy],
    queryFn: async () => {
      const data = await getPlaylistSongs(playlistId) as PlaylistSong[];
      
      // Sort based on selected option
      return [...data].sort((a, b) => {
        const songA = a.songs;
        const songB = b.songs;
        
        switch (sortBy) {
          case 'popularity':
            return (songB.play_count || 0) - (songA.play_count || 0);
          case 'bpm':
            return (songB.bpm || 0) - (songA.bpm || 0);
          case 'key':
            return (songA.key || '').localeCompare(songB.key || '');
          case 'duration':
            return songB.duration - songA.duration;
          case 'genre':
            return (songA.genre || '').localeCompare(songB.genre || '');
          case 'last_played':
            const dateA = songA.last_played_at ? new Date(songA.last_played_at).getTime() : 0;
            const dateB = songB.last_played_at ? new Date(songB.last_played_at).getTime() : 0;
            return dateB - dateA;
          default:
            return a.position - b.position;
        }
      });
    },
  });

  const handleRemoveSong = async (playlistSongId: string) => {
    try {
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('id', playlistSongId);

      if (error) throw error;
      
      toast.success("Música removida da playlist");
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (playlistSongs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma música nesta playlist ainda
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {playlistSongs.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
        >
          <div className="flex-1">
            <p className="font-medium">{item.songs.title}</p>
            <div className="flex gap-3 text-sm text-muted-foreground">
              <span>{item.songs.artist}</span>
              {item.songs.duration && <span>• {formatDuration(item.songs.duration)}</span>}
              {item.songs.bpm && <span>• {Math.round(item.songs.bpm)} BPM</span>}
              {item.songs.key && <span>• {item.songs.key}</span>}
              {item.songs.genre && <span>• {item.songs.genre}</span>}
              {item.songs.play_count && item.songs.play_count > 0 && (
                <span>• 🎵 {item.songs.play_count}x</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddSimilar(item.song_id)}
              title="Adicionar 5 músicas similares"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Similar
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveSong(item.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};