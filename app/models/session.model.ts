import { Observable } from '@nativescript/core';

export interface SessionMetrics {
  duration: number;
  wordsPerMinute: number;
  topWords: string[];
  speakingTime: number;
}

export class TherapySession extends Observable {
  id: string;
  date: Date;
  encryptedAudioPath: string;
  encryptionKey: string;
  metrics: SessionMetrics;

  constructor(id: string) {
    super();
    this.id = id;
    this.date = new Date();
    this.metrics = {
      duration: 0,
      wordsPerMinute: 0,
      topWords: [],
      speakingTime: 0
    };
  }

  setMetrics(metrics: SessionMetrics) {
    this.metrics = metrics;
    this.notifyPropertyChange('metrics', metrics);
  }
}