import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Music, Trash2, Loader2, ListPlus } from "lucide-react";
import { usePlaylists } from "@/hooks/usePlaylists";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlaylistManager } from "@/components/playlists/PlaylistManager";
import { AddSongsDialog } from "@/components/playlists/AddSongsDialog";

const Playlists = () => {
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [addSongsDialogOpen, setAddSongsDialogOpen] = useState(false);
  const [addSongsPlaylistId, setAddSongsPlaylistId] = useState("");
  
  const { playlists, isLoading, createPlaylist, deletePlaylist } = usePlaylists();

  if (selectedPlaylist) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-20">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <PlaylistManager 
            playlist={selectedPlaylist} 
            onClose={() => setSelectedPlaylist(null)}
          />
        </div>
      </div>
    );
  }

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    createPlaylist({
      name: newPlaylistName,
      description: newPlaylistDescription || undefined,
    }, {
      onSuccess: () => {
        setNewPlaylistName("");
        setNewPlaylistDescription("");
        setDialogOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Minhas Playlists
              </h1>
              <p className="text-muted-foreground">
                Organize suas músicas favoritas
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="neon" size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Nova Playlist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Playlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="playlist-name">Nome da Playlist</Label>
                    <Input
                      id="playlist-name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="Ex: Rock Clássico"
                    />
                  </div>
                  <div>
                    <Label htmlFor="playlist-description">Descrição (opcional)</Label>
                    <Textarea
                      id="playlist-description"
                      value={newPlaylistDescription}
                      onChange={(e) => setNewPlaylistDescription(e.target.value)}
                      placeholder="Descreva sua playlist..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleCreatePlaylist} className="w-full">
                    Criar Playlist
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {playlists.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg text-muted-foreground">
                  Você ainda não tem playlists
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie sua primeira playlist para começar
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {playlists.map((playlist) => (
                <Card key={playlist.id} className="group hover:scale-105 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                          <Music className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold">{playlist.name}</p>
                          {playlist.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {playlist.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deletePlaylist(playlist.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setSelectedPlaylist(playlist)}
                      >
                        Gerenciar
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="flex-1"
                        onClick={() => {
                          setAddSongsPlaylistId(playlist.id);
                          setAddSongsDialogOpen(true);
                        }}
                      >
                        <ListPlus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <AddSongsDialog
        open={addSongsDialogOpen}
        onOpenChange={setAddSongsDialogOpen}
        playlistId={addSongsPlaylistId}
      />
    </div>
  );
};

export default Playlists;
