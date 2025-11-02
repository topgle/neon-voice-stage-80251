import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Play, SkipForward, Music, Users2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Participant {
  id: string;
  display_name: string;
  avatar_url?: string;
  preferred_songs: string[];
}

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail_url?: string;
}

interface RoundManagerProps {
  sessionId: string;
  participants: Participant[];
  songs: Song[];
  onComplete: () => void;
}

export function RoundManager({
  sessionId,
  participants,
  songs,
  onComplete,
}: RoundManagerProps) {
  const navigate = useNavigate();
  const [currentRound, setCurrentRound] = useState(0);
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const [isAutoMode, setIsAutoMode] = useState(true);

  const totalRounds = Math.max(...participants.map(p => p.preferred_songs?.length || 0));
  const currentParticipant = participants[currentParticipantIndex];
  
  // Get current song for the participant
  const getCurrentSong = () => {
    if (!currentParticipant?.preferred_songs) return null;
    const songId = currentParticipant.preferred_songs[currentRound];
    return songs.find(s => s.id === songId);
  };

  const currentSong = getCurrentSong();

  const handleNext = () => {
    const nextParticipantIndex = currentParticipantIndex + 1;
    
    if (nextParticipantIndex >= participants.length) {
      // Round complete, move to next round
      const nextRound = currentRound + 1;
      if (nextRound >= totalRounds) {
        // All rounds complete
        onComplete();
      } else {
        setCurrentRound(nextRound);
        setCurrentParticipantIndex(0);
      }
    } else {
      setCurrentParticipantIndex(nextParticipantIndex);
    }
  };

  const handleStartPerformance = () => {
    if (!currentSong) return;
    navigate(`/player?song=${currentSong.id}&session=${sessionId}&participant=${currentParticipant.id}`);
  };

  const progress = ((currentRound * participants.length + currentParticipantIndex) / (totalRounds * participants.length)) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do Round</span>
              <span className="font-semibold">
                Round {currentRound + 1} de {totalRounds}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {currentParticipantIndex + 1} de {participants.length} participantes neste round
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Turn */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="w-5 h-5" />
            Vez de Cantar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Participant */}
          <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg">
            <Avatar className="w-16 h-16">
              <AvatarImage src={currentParticipant?.avatar_url} />
              <AvatarFallback className="text-2xl">
                {currentParticipant?.display_name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{currentParticipant?.display_name}</h3>
              <p className="text-muted-foreground">É a sua vez!</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {currentParticipantIndex + 1}º
            </Badge>
          </div>

          {/* Current Song */}
          {currentSong ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                {currentSong.thumbnail_url ? (
                  <img 
                    src={currentSong.thumbnail_url} 
                    alt={currentSong.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-card rounded flex items-center justify-center">
                    <Music className="w-10 h-10 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{currentSong.title}</h4>
                  <p className="text-muted-foreground">{currentSong.artist}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleStartPerformance}
                  className="flex-1"
                  size="lg"
                  variant="neon"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Começar a Cantar
                </Button>
                <Button
                  onClick={handleNext}
                  variant="outline"
                  size="lg"
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Pular
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Este participante não tem músicas preferidas cadastradas para este round
              </p>
              <Button onClick={handleNext}>
                <SkipForward className="w-4 h-4 mr-2" />
                Próximo Participante
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {participants.slice(currentParticipantIndex + 1).map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={participant.avatar_url} />
                  <AvatarFallback>
                    {participant.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{participant.display_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Na fila - Posição {index + 1}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
