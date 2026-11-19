import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { env } from './env';

const CHUNK_SIZE = 1800;

const chunkedStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(key) ?? null;
    }
    const count = await SecureStore.getItemAsync(`${key}.count`);
    if (!count) return null;
    const total = Number.parseInt(count, 10);
    const parts: string[] = [];
    for (let index = 0; index < total; index += 1) {
      const part = await SecureStore.getItemAsync(`${key}.${index}`);
      if (part === null) return null;
      parts.push(part);
    }
    return parts.join('');
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(key, value);
      return;
    }
    const parts = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) ?? [];
    await SecureStore.setItemAsync(`${key}.count`, String(parts.length));
    await Promise.all(
      parts.map((part, index) => SecureStore.setItemAsync(`${key}.${index}`, part))
    );
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(key);
      return;
    }
    const count = await SecureStore.getItemAsync(`${key}.count`);
    if (count) {
      const total = Number.parseInt(count, 10);
      await Promise.all(
        Array.from({ length: total }, (_, index) =>
          SecureStore.deleteItemAsync(`${key}.${index}`)
        )
      );
    }
    await SecureStore.deleteItemAsync(`${key}.count`);
  },
};

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: chunkedStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
