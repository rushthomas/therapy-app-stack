import natural from 'natural';
const tokenizer = new natural.WordTokenizer();

export class AnalyticsService {
  analyzeText(text: string) {
    const words = tokenizer.tokenize(text);
    const wordsPerMinute = this.calculateWordsPerMinute(words.length, text);
    const topTopics = this.extractTopics(text);
    const sentiment = this.analyzeSentiment(text);

    return {
      wordsPerMinute,
      topTopics,
      sentiment
    };
  }

  private calculateWordsPerMinute(wordCount: number, duration: number): number {
    return (wordCount / duration) * 60;
  }

  private extractTopics(text: string): string[] {
    // Simple keyword extraction
    const words = tokenizer.tokenize(text.toLowerCase());
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on']);
    const wordFreq = {};
    
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private analyzeSentiment(text: string): number {
    const analyzer = new natural.SentimentAnalyzer();
    return analyzer.getSentiment(tokenizer.tokenize(text));
  }
}