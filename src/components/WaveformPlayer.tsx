import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface WaveformPlayerProps {
  audioUrl: string;
  onTimeUpdate?: (time: number) => void;
  isRecording?: boolean;
}

export const WaveformPlayer = ({ audioUrl, onTimeUpdate, isRecording }: WaveformPlayerProps) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!waveformRef.current) return;

    // Initialize WaveSurfer
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'hsl(var(--muted-foreground))',
      progressColor: 'hsl(var(--primary))',
      cursorColor: 'hsl(var(--accent))',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 2,
      height: 80,
      barGap: 2,
      normalize: true,
      backend: 'WebAudio',
    });

    wavesurferRef.current = wavesurfer;

    // Load audio
    wavesurfer.load(audioUrl);

    // Event listeners
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
      wavesurfer.setVolume(volume / 100);
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    
    wavesurfer.on('audioprocess', () => {
      const time = wavesurfer.getCurrentTime();
      setCurrentTime(time);
      onTimeUpdate?.(time);
    });

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl]);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(isMuted ? 0 : volume / 100);
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    wavesurferRef.current?.playPause();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (isMuted) setIsMuted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Waveform */}
        <div 
          ref={waveformRef} 
          className="rounded-lg overflow-hidden bg-muted/20"
          style={{ opacity: isRecording ? 0.5 : 1 }}
        />

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlayPause}
            disabled={isRecording}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <div className="flex-1 text-sm text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>

          <div className="w-24">
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
