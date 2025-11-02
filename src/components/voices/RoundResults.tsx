import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Star, TrendingUp, Music } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Performance {
  id: string;
  participant_id: string;
  song_id: string;
  score: number;
  pitch_accuracy?: number;
  rhythm_accuracy?: number;
  expression_score?: number;
  feedback_text?: string;
  performed_at: string;
}

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
}

interface RoundResultsProps {
  participants: Participant[];
  performances: Performance[];
  songs: Song[];
  onNewRound: () => void;
  onFinishSession: () => void;
}

export function RoundResults({
  participants,
  performances,
  songs,
  onNewRound,
  onFinishSession,
}: RoundResultsProps) {
  // Calculate stats
  const sortedParticipants = [...participants].sort((a, b) => b.total_score - a.total_score);
  const avgScore = participants.reduce((acc, p) => acc + p.total_score, 0) / participants.length;
  
  // Find top performances (highlights)
  const topPerformances = [...performances]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const getParticipant = (id: string) => participants.find(p => p.id === id);
  const getSong = (id: string) => songs.find(s => s.id === id);

  return (
    <div className="space-y-6">
      {/* Podium */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-primary p-6 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
          <h2 className="text-3xl font-bold text-white mb-2">Resultados do Round</h2>
          <p className="text-white/80">Parabéns aos participantes!</p>
        </div>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* 2nd Place */}
            {sortedParticipants[1] && (
              <div className="text-center">
                <div className="relative inline-block mb-3">
                  <Avatar className="w-20 h-20 border-4 border-gray-400">
                    <AvatarImage src={sortedParticipants[1].avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {sortedParticipants[1].display_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                </div>
                <p className="font-semibold">{sortedParticipants[1].display_name}</p>
                <p className="text-2xl font-bold text-primary">{Math.round(sortedParticipants[1].total_score)}</p>
              </div>
            )}

            {/* 1st Place */}
            {sortedParticipants[0] && (
              <div className="text-center -mt-4">
                <div className="relative inline-block mb-3">
                  <Avatar className="w-24 h-24 border-4 border-yellow-400">
                    <AvatarImage src={sortedParticipants[0].avatar_url} />
                    <AvatarFallback className="text-3xl">
                      {sortedParticipants[0].display_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    1
                  </div>
                </div>
                <p className="font-bold text-lg">{sortedParticipants[0].display_name}</p>
                <p className="text-3xl font-bold text-yellow-500">{Math.round(sortedParticipants[0].total_score)}</p>
              </div>
            )}

            {/* 3rd Place */}
            {sortedParticipants[2] && (
              <div className="text-center">
                <div className="relative inline-block mb-3">
                  <Avatar className="w-20 h-20 border-4 border-orange-400">
                    <AvatarImage src={sortedParticipants[2].avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {sortedParticipants[2].display_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                </div>
                <p className="font-semibold">{sortedParticipants[2].display_name}</p>
                <p className="text-2xl font-bold text-primary">{Math.round(sortedParticipants[2].total_score)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="w-5 h-5" />
            Ranking Completo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedParticipants.map((participant, index) => (
              <div
                key={participant.id}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  index === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' :
                  index === 1 ? 'bg-gray-400/10 border border-gray-400/30' :
                  index === 2 ? 'bg-orange-400/10 border border-orange-400/30' :
                  'bg-secondary/50'
                }`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-400 text-white' :
                  'bg-muted'
                }`}>
                  {index + 1}
                </div>
                <Avatar>
                  <AvatarImage src={participant.avatar_url} />
                  <AvatarFallback>
                    {participant.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{participant.display_name}</p>
                  <Progress value={(participant.total_score / sortedParticipants[0].total_score) * 100} className="h-2 mt-1" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{Math.round(participant.total_score)}</p>
                  <p className="text-xs text-muted-foreground">pontos</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{Math.round(avgScore)}</p>
            <p className="text-sm text-muted-foreground">Nota Média</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Music className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{performances.length}</p>
            <p className="text-sm text-muted-foreground">Músicas Cantadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{Math.round(Math.max(...performances.map(p => p.score)))}</p>
            <p className="text-sm text-muted-foreground">Melhor Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Melhores Performances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPerformances.map((performance, index) => {
              const participant = getParticipant(performance.participant_id);
              const song = getSong(performance.song_id);
              if (!participant || !song) return null;

              return (
                <div
                  key={performance.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <Badge variant={index === 0 ? "default" : "secondary"} className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold">
                    {index + 1}
                  </Badge>
                  <Avatar>
                    <AvatarImage src={participant.avatar_url} />
                    <AvatarFallback>
                      {participant.display_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{participant.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {song.title} - {song.artist}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{Math.round(performance.score)}</p>
                    {performance.pitch_accuracy && (
                      <p className="text-xs text-muted-foreground">
                        {Math.round(performance.pitch_accuracy)}% afinação
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1" onClick={onNewRound}>
          Novo Round
        </Button>
        <Button variant="neon" className="flex-1" onClick={onFinishSession}>
          Finalizar Sessão
        </Button>
      </div>
    </div>
  );
}
