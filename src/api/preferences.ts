import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PREFIX = 'vehigo.';

export async function clearLocalCache(): Promise<void> {
  if (Platform.OS === 'web') {
    const keys: string[] = [];
    for (let index = 0; index < globalThis.localStorage.length; index += 1) {
      const key = globalThis.localStorage.key(index);
      if (key && key.startsWith(PREFIX)) keys.push(key);
    }
    keys.forEach((key) => globalThis.localStorage.removeItem(key));
    return;
  }
  await SecureStore.deleteItemAsync(`${PREFIX}notification_prefs`);
}
