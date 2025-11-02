import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Swords, Music, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Participant {
  id: string;
  display_name: string;
  avatar_url?: string;
  total_score: number;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail_url?: string;
}

interface DuelModeProps {
  sessionId: string;
  participants: Participant[];
  songs: Song[];
  performances: any[];
}

export function DuelMode({ sessionId, participants, songs, performances }: DuelModeProps) {
  const navigate = useNavigate();
  const [participant1, setParticipant1] = useState<string>('');
  const [participant2, setParticipant2] = useState<string>('');
  const [selectedSong, setSelectedSong] = useState<string>('');

  const p1 = participants.find(p => p.id === participant1);
  const p2 = participants.find(p => p.id === participant2);
  const song = songs.find(s => s.id === selectedSong);

  const canStartDuel = participant1 && participant2 && selectedSong && participant1 !== participant2;

  // Get previous duels between these participants
  const previousDuels = performances.filter(p => 
    (p.participant_id === participant1 || p.participant_id === participant2) &&
    p.song_id === selectedSong
  );

  const handleStartDuel = () => {
    if (!canStartDuel) return;
    // Navigate first participant
    navigate(`/player?song=${selectedSong}&session=${sessionId}&participant=${participant1}&duel=true`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="bg-gradient-to-r from-red-500/20 to-blue-500/20 p-6 text-center">
          <Swords className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl font-bold mb-2">Modo Duelo</h2>
          <p className="text-muted-foreground">
            Dois participantes, mesma música, quem canta melhor?
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurar Duelo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Participant Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Participante 1</label>
              <Select value={participant1} onValueChange={setParticipant1}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((p) => (
                    <SelectItem key={p.id} value={p.id} disabled={p.id === participant2}>
                      {p.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Participante 2</label>
              <Select value={participant2} onValueChange={setParticipant2}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((p) => (
                    <SelectItem key={p.id} value={p.id} disabled={p.id === participant1}>
                      {p.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duel Preview */}
          {p1 && p2 && (
            <div className="flex items-center justify-center gap-8 p-6 bg-secondary/50 rounded-lg">
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-2 border-4 border-red-500">
                  <AvatarImage src={p1.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {p1.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="font-bold">{p1.display_name}</p>
                <Badge variant="secondary">{Math.round(p1.total_score)} pts</Badge>
              </div>

              <Swords className="w-12 h-12 text-primary" />

              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-2 border-4 border-blue-500">
                  <AvatarImage src={p2.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {p2.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="font-bold">{p2.display_name}</p>
                <Badge variant="secondary">{Math.round(p2.total_score)} pts</Badge>
              </div>
            </div>
          )}

          {/* Song Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Música do Duelo</label>
            <Select value={selectedSong} onValueChange={setSelectedSong}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a música..." />
              </SelectTrigger>
              <SelectContent>
                {songs.map((song) => (
                  <SelectItem key={song.id} value={song.id}>
                    {song.title} - {song.artist}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Song Display */}
          {song && (
            <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg">
              {song.thumbnail_url ? (
                <img 
                  src={song.thumbnail_url} 
                  alt={song.title}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-card rounded flex items-center justify-center">
                  <Music className="w-8 h-8 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-bold">{song.title}</h4>
                <p className="text-sm text-muted-foreground">{song.artist}</p>
              </div>
            </div>
          )}

          {/* Start Duel */}
          <Button 
            onClick={handleStartDuel}
            disabled={!canStartDuel}
            className="w-full"
            size="lg"
            variant="neon"
          >
            <Play className="w-5 h-5 mr-2" />
            Iniciar Duelo
          </Button>

          {!canStartDuel && (
            <p className="text-sm text-center text-muted-foreground">
              Selecione dois participantes diferentes e uma música para começar
            </p>
          )}
        </CardContent>
      </Card>

      {/* Previous Duels */}
      {previousDuels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Duelos Anteriores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {previousDuels.map((perf) => {
                const participant = participants.find(p => p.id === perf.participant_id);
                if (!participant) return null;
                
                return (
                  <div
                    key={perf.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={participant.avatar_url} />
                        <AvatarFallback>
                          {participant.display_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{participant.display_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{Math.round(perf.score)}</p>
                      <p className="text-xs text-muted-foreground">pontos</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
