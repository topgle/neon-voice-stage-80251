import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, SkipBack, SkipForward, Volume2, Mic, Loader2, Trophy, Music2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSongs } from "@/hooks/useSongs";
import { useScoring } from "@/hooks/useScoring";
import { parseLyricsTimed } from "@/utils/musicReference";
import { ScoringDisplay } from "@/components/ScoringDisplay";
import { MicCalibration } from "@/components/MicCalibration";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheVoices } from "@/hooks/useTheVoices";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Mode = 'watch' | 'practice' | 'compete';

const PlayerWithScoring = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const songId = searchParams.get('song');
  const sessionId = searchParams.get('session');
  const { songs } = useSongs();
  const { addPerformance } = useTheVoices(sessionId || undefined);
  
  const [mode, setMode] = useState<Mode>('watch');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [showCalibration, setShowCalibration] = useState(false);
  const [showCompeteDialog, setShowCompeteDialog] = useState(false);
  const [participantName, setParticipantName] = useState('');
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasIncrementedPlayCount = useRef(false);
  const song = songs.find(s => s.id === songId);

  const musicReference = song ? {
    lyrics: parseLyricsTimed(song.lyrics_timed),
    bpm: 120,
    duration: song.duration,
  } : undefined;

  const { state: scoringState, startRecording, stopRecording } = useScoring(musicReference);

  // Increment play count when song starts playing
  useEffect(() => {
    if (isPlaying && song && !hasIncrementedPlayCount.current) {
      hasIncrementedPlayCount.current = true;
      supabase.rpc('increment_play_count', { song_uuid: song.id });
    }
  }, [isPlaying, song]);

  useEffect(() => {
    if (!songId || !song) {
      navigate('/');
    }
  }, [songId, song, navigate]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && song) {
      const current = videoRef.current.currentTime;
      const duration = song.duration;
      setCurrentTime(current);
      setProgress((current / duration) * 100);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current && song) {
      const newTime = (value[0] / 100) * song.duration;
      videoRef.current.currentTime = newTime;
      setProgress(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startPracticeMode = () => {
    setMode('practice');
    setShowCalibration(true);
  };

  const startCompeteMode = () => {
    if (!sessionId) {
      toast.error("Você precisa estar em uma sessão do The Voices para competir");
      return;
    }
    setShowCompeteDialog(true);
  };

  const handleStartCompete = async () => {
    if (!participantName.trim()) {
      toast.error("Digite seu nome");
      return;
    }
    setShowCompeteDialog(false);
    setMode('compete');
    setShowCalibration(true);
  };

  const handleCalibrationComplete = async () => {
    setShowCalibration(false);
    try {
      await startRecording();
      toast.success("Gravação iniciada! Cante com a música.");
    } catch (error) {
      toast.error("Erro ao iniciar gravação");
      setMode('watch');
    }
  };

  const handleStopScoring = async () => {
    const result = stopRecording();
    
    if (result && mode === 'compete' && sessionId && participantName) {
      // Save performance to database
      addPerformance({
        sessionId,
        participantId: participantName, // In real app, this would be actual participant ID
        songId: song!.id,
        score: result.score,
        pitchAccuracy: result.pitchAccuracy,
        rhythmAccuracy: result.rhythmAccuracy,
        expressionScore: result.expressionScore,
        feedbackText: result.feedback,
      });
    }

    setFinalResult(result);
    setShowResults(true);
    setMode('watch');
  };

  if (!song) {
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
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Player */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Video Player Area */}
                <div className="relative aspect-video bg-gradient-card flex items-center justify-center">
                  {song.source === 'local' && song.file_path ? (
                    <video
                      ref={videoRef}
                      src={song.file_path}
                      className="w-full h-full"
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={() => {
                        setIsPlaying(false);
                        if (mode !== 'watch') {
                          handleStopScoring();
                        }
                      }}
                    />
                  ) : song.source === 'youtube' && song.source_id ? (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${song.source_id}?autoplay=${isPlaying ? 1 : 0}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Mic className="h-24 w-24 text-primary animate-pulse" />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-lg font-bold text-white">{song.title}</p>
                      <p className="text-sm text-white/80">{song.artist}</p>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="p-6 space-y-6">
                  {/* Mode Selection */}
                  {mode === 'watch' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={startPracticeMode}
                      >
                        <Music2 className="w-4 h-4 mr-2" />
                        Modo Prática
                      </Button>
                      <Button 
                        variant="neon" 
                        className="flex-1"
                        onClick={startCompeteMode}
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Competir
                      </Button>
                    </div>
                  )}

                  {mode !== 'watch' && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-semibold">
                          {mode === 'practice' ? 'Modo Prática' : 'Modo Competição'}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleStopScoring}
                      >
                        Finalizar
                      </Button>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Slider
                      value={[progress]}
                      onValueChange={handleSeek}
                      max={100}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(song.duration)}</span>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button variant="glass" size="icon">
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="neon"
                      size="lg"
                      className="h-16 w-16"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8" />
                      ) : (
                        <Play className="h-8 w-8 ml-1" />
                      )}
                    </Button>
                    <Button variant="glass" size="icon">
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-4">
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                    <Slider
                      value={[volume]}
                      onValueChange={(value) => setVolume(value[0])}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {volume}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scoring Display Sidebar */}
          <div className="lg:col-span-1">
            {mode !== 'watch' ? (
              <ScoringDisplay
                currentPitch={scoringState.currentPitch}
                currentScore={scoringState.currentScore}
                pitchAccuracy={scoringState.pitchAccuracy}
                isRecording={scoringState.isRecording}
                feedback={scoringState.currentFeedback}
              />
            ) : (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Informações</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Artista</p>
                    <p className="font-semibold">{song.artist}</p>
                  </div>
                  {song.album && (
                    <div>
                      <p className="text-muted-foreground">Álbum</p>
                      <p className="font-semibold">{song.album}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Duração</p>
                    <p className="font-semibold">{formatTime(song.duration)}</p>
                  </div>
                  {song.tags && song.tags.length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {song.tags.map((tag, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-primary/10 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Calibration Dialog */}
      <Dialog open={showCalibration} onOpenChange={setShowCalibration}>
        <DialogContent className="max-w-md">
          <MicCalibration
            onComplete={handleCalibrationComplete}
            onCancel={() => {
              setShowCalibration(false);
              setMode('watch');
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Compete Dialog */}
      <Dialog open={showCompeteDialog} onOpenChange={setShowCompeteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entrar na Competição</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Seu Nome</Label>
              <Input
                id="name"
                placeholder="Digite seu nome"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCompeteDialog(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleStartCompete}>
                Começar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              Resultado da Performance
            </DialogTitle>
          </DialogHeader>
          {finalResult && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">
                  {finalResult.score}
                </div>
                <p className="text-muted-foreground">Pontuação Final</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Afinação</span>
                  <span className="font-semibold">{Math.round(finalResult.pitchAccuracy)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Ritmo</span>
                  <span className="font-semibold">{Math.round(finalResult.rhythmAccuracy)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Expressão</span>
                  <span className="font-semibold">{Math.round(finalResult.expressionScore)}%</span>
                </div>
              </div>

              <Card className="p-4 bg-secondary/50">
                <p className="text-sm whitespace-pre-line">{finalResult.feedback}</p>
              </Card>

              <Button className="w-full" onClick={() => setShowResults(false)}>
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerWithScoring;
