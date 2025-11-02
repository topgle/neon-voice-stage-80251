import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Music, Trash2, Edit2, Plus, ArrowUpDown, Sparkles } from "lucide-react";
import { usePlaylists } from "@/hooks/usePlaylists";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SongList } from "./SongList";
import { SimilarSongsDialog } from "./SimilarSongsDialog";

interface Playlist {
  id: string;
  name: string;
  description?: string;
}

interface PlaylistManagerProps {
  playlist: Playlist;
  onClose: () => void;
}

export type SortOption = 'popularity' | 'bpm' | 'key' | 'duration' | 'genre' | 'last_played';

export const PlaylistManager = ({ playlist, onClose }: PlaylistManagerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(playlist.name);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [showSimilarDialog, setShowSimilarDialog] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string>("");
  const { updatePlaylist } = usePlaylists();

  const handleSaveEdit = async () => {
    if (editedName.trim() && editedName !== playlist.name) {
      updatePlaylist({ 
        playlistId: playlist.id, 
        name: editedName 
      });
    }
    setIsEditing(false);
  };

  const handleAddSimilar = (songId: string) => {
    setSelectedSongId(songId);
    setShowSimilarDialog(true);
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {isEditing ? (
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="max-w-md"
                    autoFocus
                  />
                ) : (
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                      <Music className="h-6 w-6" />
                    </div>
                    {playlist.name}
                  </CardTitle>
                )}
                
                {isEditing ? (
                  <Button onClick={handleSaveEdit} size="sm">Salvar</Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[180px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularidade</SelectItem>
                    <SelectItem value="bpm">BPM</SelectItem>
                    <SelectItem value="key">Tonalidade</SelectItem>
                    <SelectItem value="duration">Duração</SelectItem>
                    <SelectItem value="genre">Gênero</SelectItem>
                    <SelectItem value="last_played">Tocadas Recentemente</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={onClose}>
                  Voltar
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <SongList 
              playlistId={playlist.id} 
              sortBy={sortBy}
              onAddSimilar={handleAddSimilar}
            />
          </CardContent>
        </Card>
      </div>

      <SimilarSongsDialog
        open={showSimilarDialog}
        onOpenChange={setShowSimilarDialog}
        songId={selectedSongId}
        playlistId={playlist.id}
      />
    </>
  );
};