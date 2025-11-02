export interface TimedLyric {
  time: number; // seconds
  text: string;
  pitch?: number; // expected pitch in Hz (optional)
  duration?: number; // duration in seconds
}

export interface MusicReference {
  lyrics: TimedLyric[];
  bpm: number;
  duration: number;
}

export function parseLyricsTimed(lyricsData: any): TimedLyric[] {
  if (!lyricsData || !Array.isArray(lyricsData)) {
    return [];
  }

  return lyricsData.map((item: any) => ({
    time: item.time || 0,
    text: item.text || '',
    pitch: item.pitch,
    duration: item.duration,
  }));
}

export function getCurrentLyric(lyrics: TimedLyric[], currentTime: number): TimedLyric | null {
  if (lyrics.length === 0) return null;

  // Find the lyric that should be active at currentTime
  let activeLyric: TimedLyric | null = null;
  
  for (let i = 0; i < lyrics.length; i++) {
    const lyric = lyrics[i];
    const nextLyric = lyrics[i + 1];
    
    if (currentTime >= lyric.time) {
      if (!nextLyric || currentTime < nextLyric.time) {
        activeLyric = lyric;
        break;
      }
    }
  }

  return activeLyric;
}

export function getUpcomingLyrics(lyrics: TimedLyric[], currentTime: number, lookahead = 5): TimedLyric[] {
  return lyrics.filter(lyric => 
    lyric.time > currentTime && lyric.time <= currentTime + lookahead
  );
}

// Simple DTW (Dynamic Time Warping) for rhythm alignment
export function calculateTimingAccuracy(
  detectedTimings: number[],
  expectedTimings: number[],
  toleranceMs = 200
): number {
  if (detectedTimings.length === 0 || expectedTimings.length === 0) return 0;

  let totalAccuracy = 0;
  let count = 0;

  // Match each detected timing to closest expected timing
  for (const detected of detectedTimings) {
    let minDiff = Infinity;
    
    for (const expected of expectedTimings) {
      const diff = Math.abs(detected - expected) * 1000; // to ms
      if (diff < minDiff) {
        minDiff = diff;
      }
    }

    if (minDiff <= toleranceMs) {
      const accuracy = 100 - (minDiff / toleranceMs) * 100;
      totalAccuracy += accuracy;
      count++;
    }
  }

  return count > 0 ? totalAccuracy / count : 0;
}

// Generate expected pitch from note name
export function noteNameToPitch(note: string, octave: number): number {
  const noteNames: { [key: string]: number } = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };

  const A4 = 440;
  const n = noteNames[note];
  if (n === undefined) return 0;

  const steps = (octave - 4) * 12 + (n - 9); // A4 is reference
  return A4 * Math.pow(2, steps / 12);
}
