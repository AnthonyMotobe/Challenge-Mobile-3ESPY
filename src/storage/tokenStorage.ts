import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_KEY = 'ford.access_token';
const REFRESH_KEY = 'ford.refresh_token';

const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') return AsyncStorage.setItem(key, value);
    return SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') return AsyncStorage.removeItem(key);
    return SecureStore.deleteItemAsync(key);
  },
};

export const tokenStorage = {
  async saveTokens(access: string, refresh: string): Promise<void> {
    await Promise.all([storage.set(ACCESS_KEY, access), storage.set(REFRESH_KEY, refresh)]);
  },
  async getAccessToken(): Promise<string | null> {
    return storage.get(ACCESS_KEY);
  },
  async getRefreshToken(): Promise<string | null> {
    return storage.get(REFRESH_KEY);
  },
  async clear(): Promise<void> {
    await Promise.all([storage.remove(ACCESS_KEY), storage.remove(REFRESH_KEY)]);
  },
};
