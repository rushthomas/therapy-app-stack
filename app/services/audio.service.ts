import { Audio } from '@nativescript/audio';
import { File, knownFolders } from '@nativescript/core';
import { encryptData, generateEncryptionKey, storeSecurely } from '../utils/encryption';

export class AudioService {
  private recorder: Audio;
  private recordingStartTime: Date | null = null;

  constructor() {
    this.recorder = new Audio();
  }

  async startRecording(): Promise<string> {
    const sessionId = Date.now().toString();
    const fileName = `session_${sessionId}.aac`;
    const folderPath = knownFolders.documents().path;
    const filePath = `${folderPath}/${fileName}`;
    
    try {
      await this.recorder.startRecording({
        filename: filePath,
        format: Audio.AudioFormat.AAC,
        sampleRate: 44100,
        channels: 1,
        encoder: Audio.AudioEncoder.AAC,
        bitRate: 128000
      });
      this.recordingStartTime = new Date();
      return filePath;
    } catch (error) {
      console.error('Recording failed:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<{ filePath: string; duration: number }> {
    try {
      await this.recorder.stopRecording();
      const duration = this.recordingStartTime ? 
        (new Date().getTime() - this.recordingStartTime.getTime()) / 1000 : 0;
      
      return {
        filePath: this.recorder.filename,
        duration
      };
    } catch (error) {
      console.error('Stop recording failed:', error);
      throw error;
    }
  }

  async encryptAndSaveAudio(filePath: string): Promise<{ encryptedPath: string; key: string }> {
    try {
      const audioFile = File.fromPath(filePath);
      const audioData = audioFile.readSync();
      
      const key = await generateEncryptionKey();
      const encrypted = await encryptData(audioData.toString(), key);
      
      const encryptedPath = `${filePath}.enc`;
      const encryptedFile = File.fromPath(encryptedPath);
      encryptedFile.writeSync(encrypted);
      
      // Store encryption key securely
      await storeSecurely(`key_${encryptedPath}`, key);
      
      // Delete original unencrypted file
      audioFile.removeSync();
      
      return { encryptedPath, key };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }
}