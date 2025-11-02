import { PitchDetector } from 'pitchy';

export interface AudioAnalysisResult {
  pitch: number; // Hz
  clarity: number; // 0-1
  volume: number; // 0-1
  isVoice: boolean;
}

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private pitchDetector: PitchDetector<Float32Array> | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private rafId: number | null = null;
  private onAnalysis: ((result: AudioAnalysisResult) => void) | null = null;

  async initialize(): Promise<void> {
    try {
      this.audioContext = new AudioContext({ sampleRate: 44100 });
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      const bufferLength = this.analyser.fftSize;
      this.pitchDetector = PitchDetector.forFloat32Array(bufferLength);
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        } 
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.source.connect(this.analyser);
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      throw new Error('Não foi possível acessar o microfone');
    }
  }

  startAnalysis(callback: (result: AudioAnalysisResult) => void): void {
    this.onAnalysis = callback;
    this.analyze();
  }

  private analyze = (): void => {
    if (!this.analyser || !this.pitchDetector || !this.audioContext) return;

    const bufferLength = this.analyser.fftSize;
    const buffer = new Float32Array(bufferLength);
    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    
    this.analyser.getFloatTimeDomainData(buffer);
    this.analyser.getByteFrequencyData(frequencyData);

    // Pitch detection
    const [pitch, clarity] = this.pitchDetector.findPitch(buffer, this.audioContext.sampleRate);

    // Volume calculation (RMS)
    const rms = Math.sqrt(buffer.reduce((sum, val) => sum + val * val, 0) / buffer.length);
    const volume = Math.min(1, rms * 10);

    // Simple voice activity detection based on volume and clarity
    const isVoice = volume > 0.01 && clarity > 0.9 && pitch > 80 && pitch < 1000;

    const result: AudioAnalysisResult = {
      pitch: isVoice ? pitch : 0,
      clarity: isVoice ? clarity : 0,
      volume,
      isVoice,
    };

    if (this.onAnalysis) {
      this.onAnalysis(result);
    }

    this.rafId = requestAnimationFrame(this.analyze);
  };

  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.onAnalysis = null;
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }
}

// Utility functions
export function pitchToNote(frequency: number): { note: string; octave: number; cents: number } {
  if (frequency <= 0) return { note: '', octave: 0, cents: 0 };
  
  const A4 = 440;
  const C0 = A4 * Math.pow(2, -4.75);
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  const h = Math.round(12 * Math.log2(frequency / C0));
  const octave = Math.floor(h / 12);
  const n = h % 12;
  const cents = Math.floor(1200 * Math.log2(frequency / (C0 * Math.pow(2, h / 12))));
  
  return {
    note: noteNames[n],
    octave,
    cents,
  };
}

export function calculatePitchAccuracy(detectedPitch: number, expectedPitch: number, toleranceCents = 50): number {
  if (detectedPitch === 0 || expectedPitch === 0) return 0;
  
  const cents = 1200 * Math.log2(detectedPitch / expectedPitch);
  const deviation = Math.abs(cents);
  
  if (deviation <= toleranceCents) {
    return 100 - (deviation / toleranceCents) * 100;
  }
  
  return 0;
}
