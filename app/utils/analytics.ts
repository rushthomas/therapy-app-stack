export interface TextAnalysis {
  wordsPerMinute: number;
  topWords: string[];
  speakingTime: number;
}

export function analyzeAudioTranscript(transcript: string, durationInSeconds: number): TextAnalysis {
  const words = transcript.split(/\s+/).filter(word => word.length > 0);
  const wordsPerMinute = (words.length / durationInSeconds) * 60;

  const wordFrequency = new Map<string, number>();
  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'or', 'but']);

  words.forEach(word => {
    const normalized = word.toLowerCase();
    if (!stopWords.has(normalized)) {
      wordFrequency.set(normalized, (wordFrequency.get(normalized) || 0) + 1);
    }
  });

  const topWords = Array.from(wordFrequency.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);

  return {
    wordsPerMinute,
    topWords,
    speakingTime: durationInSeconds
  };
}