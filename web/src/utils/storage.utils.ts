import CryptoJS from 'crypto-js';

import { error } from './log.utils';

const SECRET_KEY = import.meta.env.VITE_AUTH_SECRET_KEY;

export const AppStorage = {
  set(key: string, value: any, secure?: boolean, storage?: StorageType) {
    const stringValue = JSON.stringify(value);
    const newValue = secure
      ? CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString()
      : stringValue;
    const windowStorage = storage === 'sessionStorage' ? sessionStorage : localStorage;
    windowStorage.setItem(key, newValue);
  },

  get<T = any>(key: string, secure?: boolean, storage?: StorageType): T | null {
    const windowStorage = storage === 'sessionStorage' ? sessionStorage : localStorage;
    const fetchedValue = windowStorage.getItem(key);

    if (!fetchedValue) return null;
    else if (!secure) return JSON.parse(fetchedValue) as T;

    try {
      const bytes = CryptoJS.AES.decrypt(fetchedValue, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted) as T;
    } catch (err) {
      error('error occured', err);
      return null;
    }
  },

  remove(key: string, storage?: StorageType) {
    const windowStorage = storage === 'sessionStorage' ? sessionStorage : localStorage;
    windowStorage.removeItem(key);
  },
};

export const STORAGE_KEYS = {
  AUTH: 'auth',
};
