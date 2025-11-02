import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSongs } from "@/hooks/useSongs";
import { Music, Trash2, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const MusicLibraryManager = () => {
  const { songs, isLoading, deleteSong } = useSongs();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (songId: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir "${title}"?`)) {
      deleteSong(songId);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Biblioteca de Músicas
        </CardTitle>
        <CardDescription>
          Gerencie todas as músicas cadastradas no sistema ({songs.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, artista ou álbum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "Nenhuma música encontrada" : "Nenhuma música cadastrada"}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Artista</TableHead>
                  <TableHead>Álbum</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSongs.map((song) => (
                  <TableRow key={song.id}>
                    <TableCell className="font-medium">{song.title}</TableCell>
                    <TableCell>{song.artist}</TableCell>
                    <TableCell>{song.album || "-"}</TableCell>
                    <TableCell>{formatDuration(song.duration)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        {song.source === 'local' ? 'Local' : 
                         song.source === 'youtube' ? 'YouTube' : 'Vimeo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(song.id, song.title)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
