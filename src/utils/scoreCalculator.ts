export interface ScoreComponents {
  pitchAccuracy: number;      // 0-100
  rhythmAccuracy: number;     // 0-100
  phraseMatching: number;     // 0-100
  dynamicsControl: number;    // 0-100
  presenceClarity: number;    // 0-100
}

export interface DetailedScore extends ScoreComponents {
  finalScore: number;
  feedback: string;
  performanceData: {
    totalNotes: number;
    correctNotes: number;
    averageTimingError: number;
    maxPitchDeviation: number;
  };
}

export function calculateFinalScore(components: ScoreComponents): number {
  const weighted = 
    components.pitchAccuracy * 0.5 +
    components.rhythmAccuracy * 0.2 +
    components.phraseMatching * 0.1 +
    components.dynamicsControl * 0.1 +
    components.presenceClarity * 0.1;
  
  return Math.round(Math.max(0, Math.min(100, weighted)));
}

export function generateFeedback(score: number, components: ScoreComponents, performanceData: any): string {
  let baseFeedback = '';
  let specificSuggestions: string[] = [];

  // Base feedback by score range
  if (score >= 93) {
    baseFeedback = '🎉 Performance PERFEITA! Você é uma estrela!';
  } else if (score >= 80) {
    baseFeedback = '⭐ Excelente performance! Muito bem!';
    if (components.pitchAccuracy < 90) {
      specificSuggestions.push('Trabalhe um pouco mais a afinação');
    }
  } else if (score >= 60) {
    baseFeedback = '👍 Boa performance! Continue praticando.';
    if (components.pitchAccuracy < 70) {
      specificSuggestions.push('Pratique a afinação das notas');
    }
    if (components.rhythmAccuracy < 70) {
      specificSuggestions.push('Trabalhe o timing e ritmo');
    }
  } else if (score >= 40) {
    baseFeedback = '💪 Bom esforço! Você está no caminho certo.';
    specificSuggestions.push('Continue praticando regularmente');
    if (components.pitchAccuracy < 50) {
      specificSuggestions.push('Foque em afinar melhor as notas');
    }
  } else if (score >= 20) {
    baseFeedback = '🎵 Continue tentando! A prática leva à perfeição.';
    specificSuggestions.push('Ouça a música várias vezes antes de cantar');
    specificSuggestions.push('Pratique em partes menores');
  } else {
    baseFeedback = '🌟 Todo mundo começa de algum lugar! Não desista!';
    specificSuggestions.push('Comece com músicas mais simples');
    specificSuggestions.push('Pratique ouvindo e repetindo pequenos trechos');
  }

  // Add specific metrics
  const pitchPercent = Math.round(components.pitchAccuracy);
  const timingInfo = performanceData.averageTimingError 
    ? `timing com média de ${performanceData.averageTimingError}ms de diferença` 
    : '';

  let feedback = `${baseFeedback}\n\n`;
  feedback += `📊 Pontuação: ${score}/100\n`;
  feedback += `🎵 Afinação: ${pitchPercent}%\n`;
  feedback += `⏱️ Ritmo: ${Math.round(components.rhythmAccuracy)}%\n`;
  
  if (timingInfo) {
    feedback += `⏰ ${timingInfo}\n`;
  }

  if (specificSuggestions.length > 0) {
    feedback += `\n💡 Dicas:\n${specificSuggestions.map(s => `• ${s}`).join('\n')}`;
  }

  return feedback;
}

export function calculateComponentScores(
  pitchReadings: number[],
  expectedPitches: number[],
  timingReadings: number[],
  expectedTimings: number[],
  volumeReadings: number[]
): ScoreComponents {
  // Pitch Accuracy
  let pitchMatches = 0;
  let pitchTotal = 0;
  
  for (let i = 0; i < Math.min(pitchReadings.length, expectedPitches.length); i++) {
    if (pitchReadings[i] > 0 && expectedPitches[i] > 0) {
      const cents = Math.abs(1200 * Math.log2(pitchReadings[i] / expectedPitches[i]));
      if (cents <= 50) { // within 50 cents
        pitchMatches += (1 - cents / 50) * 100;
      }
      pitchTotal++;
    }
  }
  
  const pitchAccuracy = pitchTotal > 0 ? pitchMatches / pitchTotal : 0;

  // Rhythm Accuracy
  let timingMatches = 0;
  let timingTotal = 0;
  
  for (let i = 0; i < Math.min(timingReadings.length, expectedTimings.length); i++) {
    const diffMs = Math.abs(timingReadings[i] - expectedTimings[i]) * 1000;
    if (diffMs <= 200) { // within 200ms
      timingMatches += (1 - diffMs / 200) * 100;
    }
    timingTotal++;
  }
  
  const rhythmAccuracy = timingTotal > 0 ? timingMatches / timingTotal : 0;

  // Phrase Matching (simplified - based on timing consistency)
  const phraseMatching = rhythmAccuracy * 0.8; // simplified

  // Dynamics Control (volume consistency)
  const avgVolume = volumeReadings.reduce((a, b) => a + b, 0) / volumeReadings.length || 0;
  const volumeVariance = volumeReadings.reduce((acc, v) => acc + Math.pow(v - avgVolume, 2), 0) / volumeReadings.length;
  const dynamicsControl = Math.max(0, 100 - volumeVariance * 200);

  // Presence/Clarity (based on average volume and pitch detection confidence)
  const presenceClarity = avgVolume > 0.1 ? Math.min(100, avgVolume * 200) : 0;

  return {
    pitchAccuracy: Math.max(0, Math.min(100, pitchAccuracy)),
    rhythmAccuracy: Math.max(0, Math.min(100, rhythmAccuracy)),
    phraseMatching: Math.max(0, Math.min(100, phraseMatching)),
    dynamicsControl: Math.max(0, Math.min(100, dynamicsControl)),
    presenceClarity: Math.max(0, Math.min(100, presenceClarity)),
  };
}
