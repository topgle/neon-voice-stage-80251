import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Trash2, Music } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSongs } from '@/hooks/useSongs';
import { Checkbox } from '@/components/ui/checkbox';

interface ParticipantData {
  id: string;
  display_name: string;
  avatar_url?: string;
  preferred_songs: string[];
}

interface ParticipantSetupProps {
  participants: ParticipantData[];
  onAddParticipant: (participant: Partial<ParticipantData>) => void;
  onRemoveParticipant: (id: string) => void;
  onUpdateParticipant: (id: string, data: Partial<ParticipantData>) => void;
}

export function ParticipantSetup({
  participants,
  onAddParticipant,
  onRemoveParticipant,
  onUpdateParticipant,
}: ParticipantSetupProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSongsDialog, setShowSongsDialog] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const { songs } = useSongs();

  const handleAdd = () => {
    if (!newName.trim()) return;
    
    onAddParticipant({
      display_name: newName,
      avatar_url: avatarUrl || undefined,
      preferred_songs: [],
    });

    setNewName('');
    setAvatarUrl('');
    setShowAddDialog(false);
  };

  const handleSelectSongs = (participantId: string) => {
    setSelectedParticipant(participantId);
    setShowSongsDialog(true);
  };

  const toggleSong = (songId: string) => {
    if (!selectedParticipant) return;
    
    const participant = participants.find(p => p.id === selectedParticipant);
    if (!participant) return;

    const currentSongs = participant.preferred_songs || [];
    const newSongs = currentSongs.includes(songId)
      ? currentSongs.filter(id => id !== songId)
      : [...currentSongs, songId];

    onUpdateParticipant(selectedParticipant, { preferred_songs: newSongs });
  };

  const currentParticipant = participants.find(p => p.id === selectedParticipant);
  const selectedSongs = currentParticipant?.preferred_songs || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participantes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {participants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum participante adicionado ainda
          </div>
        ) : (
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={participant.avatar_url} />
                    <AvatarFallback>
                      {participant.display_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{participant.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {participant.preferred_songs?.length || 0} músicas preferidas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectSongs(participant.id)}
                  >
                    <Music className="w-4 h-4 mr-1" />
                    Músicas
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveParticipant(participant.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button onClick={() => setShowAddDialog(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Participante
        </Button>

        {/* Add Participant Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Participante</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Digite o nome do participante"
                />
              </div>
              <div>
                <Label htmlFor="avatar">Avatar URL (opcional)</Label>
                <Input
                  id="avatar"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://exemplo.com/avatar.jpg"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddDialog(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleAdd}>
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Select Songs Dialog */}
        <Dialog open={showSongsDialog} onOpenChange={setShowSongsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Músicas Preferidas - {currentParticipant?.display_name}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Checkbox
                      checked={selectedSongs.includes(song.id)}
                      onCheckedChange={() => toggleSong(song.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{song.title}</p>
                      <p className="text-sm text-muted-foreground">{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button onClick={() => setShowSongsDialog(false)} className="w-full">
              Concluir
            </Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
