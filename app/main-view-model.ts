import { Observable } from '@nativescript/core';
import { AudioService } from './services/audio.service';
import { AuthService } from './services/auth.service';
import { TherapySession } from './models/session.model';
import { analyzeAudioTranscript } from './utils/analytics';

export class MainViewModel extends Observable {
  private audioService: AudioService;
  private authService: AuthService;
  private currentSession: TherapySession | null = null;
  
  isRecording: boolean = false;
  recordingStatus: string = 'Ready to record';
  previousSessions: TherapySession[] = [];
  isAuthenticated: boolean = false;

  constructor() {
    super();
    this.audioService = new AudioService();
    this.authService = new AuthService();
    this.initializeAuthentication();
  }

  private async initializeAuthentication() {
    const canAuthenticate = await this.authService.isAuthenticationAvailable();
    if (canAuthenticate) {
      this.isAuthenticated = await this.authService.authenticateUser();
      this.notifyPropertyChange('isAuthenticated', this.isAuthenticated);
    } else {
      this.recordingStatus = 'Biometric authentication not available';
      this.notifyPropertyChange('recordingStatus', this.recordingStatus);
    }
  }

  async toggleRecording() {
    if (!this.isAuthenticated) {
      this.recordingStatus = 'Please authenticate first';
      this.notifyPropertyChange('recordingStatus', this.recordingStatus);
      return;
    }

    if (!this.isRecording) {
      await this.startNewSession();
    } else {
      await this.stopCurrentSession();
    }
  }

  private async startNewSession() {
    try {
      const filePath = await this.audioService.startRecording();
      this.currentSession = new TherapySession(Date.now().toString());
      
      this.isRecording = true;
      this.recordingStatus = 'Recording in progress...';
      this.notifyPropertyChange('isRecording', true);
      this.notifyPropertyChange('recordingStatus', this.recordingStatus);
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.recordingStatus = 'Failed to start recording';
      this.notifyPropertyChange('recordingStatus', this.recordingStatus);
    }
  }

  private async stopCurrentSession() {
    try {
      const { filePath, duration } = await this.audioService.stopRecording();
      
      if (this.currentSession) {
        const { encryptedPath, key } = await this.audioService.encryptAndSaveAudio(filePath);
        this.currentSession.encryptedAudioPath = encryptedPath;
        this.currentSession.encryptionKey = key;
        
        const placeholderTranscript = "This is a placeholder transcript for demonstration purposes.";
        const analysis = analyzeAudioTranscript(placeholderTranscript, duration);
        
        this.currentSession.setMetrics({
          duration,
          ...analysis
        });
        
        this.previousSessions.unshift(this.currentSession);
        this.notifyPropertyChange('previousSessions', this.previousSessions);
      }

      this.isRecording = false;
      this.recordingStatus = 'Session saved and encrypted';
      this.notifyPropertyChange('isRecording', false);
      this.notifyPropertyChange('recordingStatus', this.recordingStatus);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.recordingStatus = 'Failed to stop recording';
      this.notifyPropertyChange('recordingStatus', this.recordingStatus);
    }
  }
}