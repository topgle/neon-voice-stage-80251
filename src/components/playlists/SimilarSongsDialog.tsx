import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePlaylists } from "@/hooks/usePlaylists";

interface SimilarSongsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songId: string;
  playlistId: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
  genre?: string;
  fingerprint?: string;
}

export const SimilarSongsDialog = ({ 
  open, 
  onOpenChange, 
  songId, 
  playlistId 
}: SimilarSongsDialogProps) => {
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const { addSongToPlaylist } = usePlaylists();

  const { data: similarSongs = [], isLoading } = useQuery({
    queryKey: ['similar-songs', songId],
    queryFn: async () => {
      if (!songId) return [];
      
      // Get the reference song
      const { data: refSong, error: refError } = await supabase
        .from('songs')
        .select('*')
        .eq('id', songId)
        .single();

      if (refError || !refSong) return [];

      // Find similar songs based on metadata
      let query = supabase
        .from('songs')
        .select('*')
        .neq('id', songId)
        .limit(10);

      // Prioritize by matching criteria
      if (refSong.genre) {
        query = query.eq('genre', refSong.genre);
      }

      const { data: songs } = await query;
      if (!songs) return [];

      // Score similarity based on multiple factors
      const scored = songs.map((song: Song) => {
        let score = 0;
        
        // Genre match (highest weight)
        if (song.genre === refSong.genre) score += 50;
        
        // BPM similarity (within 10 BPM)
        if (song.bpm && refSong.bpm) {
          const bpmDiff = Math.abs(song.bpm - refSong.bpm);
          if (bpmDiff <= 10) score += 30 - (bpmDiff * 2);
        }
        
        // Key match
        if (song.key === refSong.key) score += 20;
        
        // Fingerprint similarity (basic check)
        if (song.fingerprint && refSong.fingerprint) {
          // Simple comparison - in production, use proper audio fingerprinting
          const fp1 = song.fingerprint.substring(0, 20);
          const fp2 = refSong.fingerprint.substring(0, 20);
          let matches = 0;
          for (let i = 0; i < 20; i++) {
            if (fp1[i] === fp2[i]) matches++;
          }
          score += matches;
        }

        return { ...song, similarityScore: score };
      });

      // Sort by score and return top 5
      return scored
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 5);
    },
    enabled: open && !!songId,
  });

  const handleAddSong = async (song: Song) => {
    setAddingIds(prev => new Set(prev).add(song.id));
    
    try {
      addSongToPlaylist({ playlistId, songId: song.id });
      toast.success(`${song.title} adicionada à playlist`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAddingIds(prev => {
        const next = new Set(prev);
        next.delete(song.id);
        return next;
      });
    }
  };

  const handleAddAll = async () => {
    for (const song of similarSongs) {
      await handleAddSong(song);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Músicas Similares</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {similarSongs.map((song: any) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <p className="font-medium">{song.title}</p>
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      <span>{song.artist}</span>
                      {song.bpm && <span>• {Math.round(song.bpm)} BPM</span>}
                      {song.key && <span>• {song.key}</span>}
                      {song.genre && <span>• {song.genre}</span>}
                      <span className="text-primary">
                        • {Math.round(song.similarityScore)}% similar
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleAddSong(song)}
                    disabled={addingIds.has(song.id)}
                  >
                    {addingIds.has(song.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>

            {similarSongs.length > 0 && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Fechar
                </Button>
                <Button onClick={handleAddAll} variant="neon">
                  Adicionar Todas
                </Button>
              </div>
            )}

            {similarSongs.length === 0 && !isLoading && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma música similar encontrada
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};