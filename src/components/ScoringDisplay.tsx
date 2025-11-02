import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Mic, Music, Clock, Sparkles } from 'lucide-react';
import { pitchToNote } from '@/utils/audioAnalysis';

interface ScoringDisplayProps {
  currentPitch: number;
  currentScore: number;
  pitchAccuracy: number;
  isRecording: boolean;
  feedback?: string;
}

export function ScoringDisplay({
  currentPitch,
  currentScore,
  pitchAccuracy,
  isRecording,
  feedback = '',
}: ScoringDisplayProps) {
  const [realtimeFeedback, setRealtimeFeedback] = useState<string>('');
  const [feedbackColor, setFeedbackColor] = useState<string>('text-muted-foreground');

  useEffect(() => {
    if (!isRecording) return;

    if (pitchAccuracy >= 80) {
      setRealtimeFeedback('Ótimo! 🎵');
      setFeedbackColor('text-green-500');
    } else if (pitchAccuracy >= 60) {
      setRealtimeFeedback('Bom! 👍');
      setFeedbackColor('text-blue-500');
    } else if (pitchAccuracy >= 40) {
      setRealtimeFeedback('Continue! 💪');
      setFeedbackColor('text-yellow-500');
    } else if (currentPitch > 0) {
      setRealtimeFeedback('Afinação! 🎼');
      setFeedbackColor('text-orange-500');
    } else {
      setRealtimeFeedback('Cante! 🎤');
      setFeedbackColor('text-muted-foreground');
    }
  }, [pitchAccuracy, currentPitch, isRecording]);

  const noteInfo = currentPitch > 0 ? pitchToNote(currentPitch) : null;

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-background to-secondary/10 border-primary/20">
      {/* Real-time Feedback */}
      <div className="text-center">
        <p className={`text-2xl font-bold transition-all duration-300 ${feedbackColor}`}>
          {realtimeFeedback}
        </p>
      </div>

      {/* Score Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold">Pontuação</span>
          </div>
          <span className="text-3xl font-bold text-primary">{currentScore}</span>
        </div>
        <Progress value={currentScore} className="h-3" />
      </div>

      {/* Pitch Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Nota Atual</span>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            {noteInfo ? (
              <p className="text-2xl font-bold">
                {noteInfo.note}{noteInfo.octave}
                {noteInfo.cents !== 0 && (
                  <span className="text-sm ml-1 text-muted-foreground">
                    {noteInfo.cents > 0 ? '+' : ''}{noteInfo.cents}¢
                  </span>
                )}
              </p>
            ) : (
              <p className="text-muted-foreground">--</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Afinação</span>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold">{Math.round(pitchAccuracy)}%</p>
          </div>
        </div>
      </div>

      {/* Pitch Accuracy Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Precisão da Afinação</span>
          <span className={`font-semibold ${
            pitchAccuracy >= 80 ? 'text-green-500' :
            pitchAccuracy >= 60 ? 'text-blue-500' :
            pitchAccuracy >= 40 ? 'text-yellow-500' :
            'text-orange-500'
          }`}>
            {pitchAccuracy >= 80 ? 'Excelente' :
             pitchAccuracy >= 60 ? 'Bom' :
             pitchAccuracy >= 40 ? 'Regular' :
             'Continue praticando'}
          </span>
        </div>
        <Progress 
          value={pitchAccuracy} 
          className="h-2"
        />
      </div>

      {/* Frequency Display */}
      {currentPitch > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {Math.round(currentPitch)} Hz
        </div>
      )}

      {/* Status Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          isRecording 
            ? 'bg-red-500 animate-pulse' 
            : 'bg-muted-foreground'
        }`} />
        <span className="text-sm font-medium">
          {isRecording ? 'Gravando...' : 'Pausado'}
        </span>
      </div>

      {feedback && (
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          {feedback}
        </div>
      )}
    </Card>
  );
}
