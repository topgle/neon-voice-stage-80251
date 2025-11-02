import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search } from "lucide-react";
import { useSongs } from "@/hooks/useSongs";
import { usePlaylists } from "@/hooks/usePlaylists";
import { toast } from "sonner";

interface AddSongsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlistId: string;
}

export const AddSongsDialog = ({ open, onOpenChange, playlistId }: AddSongsDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const { songs, isLoading } = useSongs();
  const { addSongToPlaylist } = usePlaylists();

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSong = async (songId: string, songTitle: string) => {
    setAddingIds(prev => new Set(prev).add(songId));
    
    try {
      addSongToPlaylist({ playlistId, songId });
      toast.success(`${songTitle} adicionada à playlist`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAddingIds(prev => {
        const next = new Set(prev);
        next.delete(songId);
        return next;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Músicas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar músicas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleAddSong(song.id, song.title)}
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

              {filteredSongs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma música encontrada
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};