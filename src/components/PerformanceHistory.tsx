import { Card } from '@/components/ui/card';
import { Trophy, TrendingUp, Music, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Performance {
  id: string;
  score: number;
  pitch_accuracy: number;
  rhythm_accuracy: number;
  performed_at: string;
  song_title?: string;
}

interface PerformanceHistoryProps {
  performances: Performance[];
}

export function PerformanceHistory({ performances }: PerformanceHistoryProps) {
  if (performances.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          Nenhuma performance registrada ainda
        </p>
      </Card>
    );
  }

  const bestScore = Math.max(...performances.map(p => p.score));
  const avgScore = performances.reduce((acc, p) => acc + p.score, 0) / performances.length;
  const recentPerformances = performances.slice(0, 5);

  // Calculate trend (last 5 vs previous 5)
  const recent5 = performances.slice(0, 5);
  const previous5 = performances.slice(5, 10);
  const recentAvg = recent5.reduce((acc, p) => acc + p.score, 0) / recent5.length;
  const previousAvg = previous5.length > 0 
    ? previous5.reduce((acc, p) => acc + p.score, 0) / previous5.length 
    : 0;
  const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Melhor Score</p>
              <p className="text-2xl font-bold">{Math.round(bestScore)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Music className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média Geral</p>
              <p className="text-2xl font-bold">{Math.round(avgScore)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${
              trend >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
            } flex items-center justify-center`}>
              <TrendingUp className={`w-6 h-6 ${
                trend >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'
              }`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tendência</p>
              <p className={`text-2xl font-bold ${
                trend >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {trend >= 0 ? '+' : ''}{Math.round(trend)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Performances */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Performances Recentes</h3>
        <div className="space-y-3">
          {recentPerformances.map((performance, index) => (
            <div 
              key={performance.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  performance.score >= 80 ? 'bg-green-500/20 text-green-500' :
                  performance.score >= 60 ? 'bg-blue-500/20 text-blue-500' :
                  performance.score >= 40 ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-orange-500/20 text-orange-500'
                }`}>
                  {Math.round(performance.score)}
                </div>
                <div>
                  <p className="font-medium">{performance.song_title || 'Música'}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {format(new Date(performance.performed_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Afinação</p>
                <p className="font-semibold">{Math.round(performance.pitch_accuracy)}%</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
