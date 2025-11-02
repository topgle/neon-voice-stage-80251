import { useState, useCallback, useRef, useEffect } from 'react';
import { AudioAnalyzer, AudioAnalysisResult, calculatePitchAccuracy } from '@/utils/audioAnalysis';
import { MusicReference, getCurrentLyric, parseLyricsTimed } from '@/utils/musicReference';
import { calculateComponentScores, calculateFinalScore, generateFeedback, ScoreComponents } from '@/utils/scoreCalculator';

export interface ScoringState {
  isRecording: boolean;
  isCalibrating: boolean;
  currentPitch: number;
  currentScore: number;
  currentFeedback: string;
  pitchAccuracy: number;
  components: ScoreComponents | null;
}

export interface PerformanceResult {
  score: number;
  components: ScoreComponents;
  feedback: string;
  pitchAccuracy: number;
  rhythmAccuracy: number;
  expressionScore: number;
}

export function useScoring(musicReference?: MusicReference) {
  const [state, setState] = useState<ScoringState>({
    isRecording: false,
    isCalibrating: false,
    currentPitch: 0,
    currentScore: 0,
    currentFeedback: '',
    pitchAccuracy: 0,
    components: null,
  });

  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const pitchReadingsRef = useRef<number[]>([]);
  const expectedPitchesRef = useRef<number[]>([]);
  const timingReadingsRef = useRef<number[]>([]);
  const expectedTimingsRef = useRef<number[]>([]);
  const volumeReadingsRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);

  const handleAnalysis = useCallback((result: AudioAnalysisResult) => {
    const currentTime = (Date.now() - startTimeRef.current) / 1000;
    currentTimeRef.current = currentTime;

    if (result.isVoice && result.pitch > 0) {
      pitchReadingsRef.current.push(result.pitch);
      volumeReadingsRef.current.push(result.volume);
      timingReadingsRef.current.push(currentTime);

      // Get expected pitch from lyrics if available
      if (musicReference) {
        const currentLyric = getCurrentLyric(musicReference.lyrics, currentTime);
        if (currentLyric?.pitch) {
          expectedPitchesRef.current.push(currentLyric.pitch);
          expectedTimingsRef.current.push(currentLyric.time);
          
          // Calculate real-time pitch accuracy
          const accuracy = calculatePitchAccuracy(result.pitch, currentLyric.pitch);
          
          setState(prev => ({
            ...prev,
            currentPitch: result.pitch,
            pitchAccuracy: accuracy,
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          currentPitch: result.pitch,
        }));
      }

      // Calculate running score
      if (pitchReadingsRef.current.length > 10) {
        const components = calculateComponentScores(
          pitchReadingsRef.current,
          expectedPitchesRef.current,
          timingReadingsRef.current,
          expectedTimingsRef.current,
          volumeReadingsRef.current
        );
        
        const score = calculateFinalScore(components);
        
        setState(prev => ({
          ...prev,
          currentScore: score,
          components,
        }));
      }
    }
  }, [musicReference]);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isCalibrating: true }));

      const analyzer = new AudioAnalyzer();
      await analyzer.initialize();
      analyzerRef.current = analyzer;

      // Reset data
      pitchReadingsRef.current = [];
      expectedPitchesRef.current = [];
      timingReadingsRef.current = [];
      expectedTimingsRef.current = [];
      volumeReadingsRef.current = [];
      startTimeRef.current = Date.now();

      setState(prev => ({ 
        ...prev, 
        isCalibrating: false, 
        isRecording: true,
        currentScore: 0,
        currentPitch: 0,
        pitchAccuracy: 0,
      }));

      analyzer.startAnalysis(handleAnalysis);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({ 
        ...prev, 
        isCalibrating: false,
        currentFeedback: 'Erro ao acessar microfone. Verifique as permissões.',
      }));
      throw error;
    }
  }, [handleAnalysis]);

  const stopRecording = useCallback((): PerformanceResult | null => {
    if (analyzerRef.current) {
      analyzerRef.current.stop();
      analyzerRef.current = null;
    }

    setState(prev => ({ ...prev, isRecording: false }));

    // Calculate final scores
    if (pitchReadingsRef.current.length > 0) {
      const components = calculateComponentScores(
        pitchReadingsRef.current,
        expectedPitchesRef.current,
        timingReadingsRef.current,
        expectedTimingsRef.current,
        volumeReadingsRef.current
      );

      const finalScore = calculateFinalScore(components);
      
      const performanceData = {
        totalNotes: expectedPitchesRef.current.length,
        correctNotes: pitchReadingsRef.current.filter((p, i) => {
          const expected = expectedPitchesRef.current[i];
          if (!expected) return false;
          const cents = Math.abs(1200 * Math.log2(p / expected));
          return cents <= 50;
        }).length,
        averageTimingError: timingReadingsRef.current.length > 0
          ? Math.round(timingReadingsRef.current.reduce((acc, t, i) => 
              acc + Math.abs(t - (expectedTimingsRef.current[i] || 0)), 0
            ) / timingReadingsRef.current.length * 1000)
          : 0,
        maxPitchDeviation: 0,
      };

      const feedback = generateFeedback(finalScore, components, performanceData);

      return {
        score: finalScore,
        components,
        feedback,
        pitchAccuracy: components.pitchAccuracy,
        rhythmAccuracy: components.rhythmAccuracy,
        expressionScore: components.dynamicsControl,
      };
    }

    return null;
  }, []);

  useEffect(() => {
    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.stop();
      }
    };
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
  };
}
