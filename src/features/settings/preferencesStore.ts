import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'vehigo.notification_prefs';

export type NotificationPrefs = {
  order: boolean;
  chat: boolean;
  promo: boolean;
};

const defaults: NotificationPrefs = { order: true, chat: true, promo: true };

async function readRaw(): Promise<string | null> {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(KEY) ?? null;
  return SecureStore.getItemAsync(KEY);
}

async function writeRaw(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(KEY, value);
    return;
  }
  await SecureStore.setItemAsync(KEY, value);
}

interface PrefsStore extends NotificationPrefs {
  loaded: boolean;
  load: () => Promise<void>;
  setPref: (key: keyof NotificationPrefs, value: boolean) => void;
}

export const usePreferencesStore = create<PrefsStore>((set, get) => ({
  ...defaults,
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    try {
      const raw = await readRaw();
      const parsed = raw ? (JSON.parse(raw) as Partial<NotificationPrefs>) : {};
      set({
        order: parsed.order ?? true,
        chat: parsed.chat ?? true,
        promo: parsed.promo ?? true,
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },
  setPref: (key, value) => {
    set({ [key]: value } as Pick<PrefsStore, keyof NotificationPrefs>);
    const { order, chat, promo } = get();
    void writeRaw(JSON.stringify({ order, chat, promo })).catch(() => {});
  },
}));
