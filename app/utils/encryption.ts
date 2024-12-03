import * as CryptoJS from 'crypto-js';
import { SecureStorage } from '@nativescript/secure-storage';

const secureStorage = new SecureStorage();

export async function generateEncryptionKey(): Promise<string> {
  const array = new Uint8Array(32);
  const crypto = require('crypto');
  return new Promise((resolve, reject) => {
    crypto.randomFill(array, (err, buf) => {
      if (err) reject(err);
      resolve(buf.toString('hex'));
    });
  });
}

export async function encryptData(data: string, key: string): Promise<string> {
  const encrypted = CryptoJS.AES.encrypt(data, key);
  return encrypted.toString();
}

export async function decryptData(encryptedData: string, key: string): Promise<string> {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

export async function storeSecurely(key: string, value: string): Promise<void> {
  await secureStorage.setSync({
    key,
    value
  });
}

export async function retrieveSecurely(key: string): Promise<string | null> {
  return await secureStorage.getSync({
    key
  });
}