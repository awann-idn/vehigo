import React from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Globe, MessageCircle } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

if (Platform.OS === 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

async function exchangeOAuthCallback(url: string) {
  const parsed = Linking.parse(url);
  const callbackError = typeof parsed.queryParams?.error_description === 'string'
    ? parsed.queryParams.error_description
    : typeof parsed.queryParams?.error === 'string'
      ? parsed.queryParams.error
      : null;
  if (callbackError) throw new Error(callbackError);
  const code = typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;
  if (!code) {
    throw new Error('Callback OAuth tidak membawa authorization code.');
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw new Error(error.message);
}

export function SocialAuthRow({ onSignedIn }: { onSignedIn?: () => void }) {
  const signIn = async (provider: 'google' | 'facebook') => {
    const redirectTo = Platform.OS === 'web'
      ? `${window.location.origin}/`
      : Linking.createURL('auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) {
      Alert.alert('Login gagal', error.message);
      return;
    }

    if (!data?.url) {
      Alert.alert('Login gagal', 'URL login dari Supabase tidak tersedia.');
      return;
    }

    if (Platform.OS === 'web') {
      window.location.assign(data.url);
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'cancel' || result.type === 'dismiss') return;
    if (result.type !== 'success' || !result.url) {
      Alert.alert('Login gagal', 'Proses login OAuth tidak selesai.');
      return;
    }

    try {
      await exchangeOAuthCallback(result.url);
    } catch (callbackError) {
      Alert.alert('Login gagal', callbackError instanceof Error ? callbackError.message : 'Callback OAuth tidak valid.');
      return;
    }
    onSignedIn?.();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>ATAU MASUK DENGAN:</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.buttons}>
        <Pressable style={styles.socialButton} onPress={() => signIn('google')}>
          <Globe size={20} color={colors.primary} />
          <Text style={styles.socialLabel}>Google</Text>
        </Pressable>
        <Pressable style={styles.socialButton} onPress={() => signIn('facebook')}>
          <MessageCircle size={20} color={colors.primary} />
          <Text style={styles.socialLabel}>Facebook</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  socialLabel: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.primary,
  },
});
