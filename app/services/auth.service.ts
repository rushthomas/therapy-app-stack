import { Biometrics } from '@nativescript/biometrics';

export class AuthService {
  private biometrics: Biometrics;

  constructor() {
    this.biometrics = new Biometrics();
  }

  async authenticateUser(): Promise<boolean> {
    try {
      const result = await this.biometrics.verifyFingerprintOrFaceId({
        message: 'Please authenticate to access therapy sessions',
        fallbackMessage: 'Please use your device passcode'
      });
      return result.code === 0;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  async isAuthenticationAvailable(): Promise<boolean> {
    try {
      const available = await this.biometrics.available();
      return available.biometrics;
    } catch (error) {
      console.error('Biometrics check failed:', error);
      return false;
    }
  }
}