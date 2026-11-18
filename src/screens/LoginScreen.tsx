import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Lock, Mail } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { SocialAuthRow } from '../components/SocialAuthRow';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { supabase } from '../lib/supabase';
import { mapAuthError } from '../lib/authErrors';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert('Perhatian', 'Harap masukkan email dan kata sandi.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password,
      });

      if (error) {
        Alert.alert('Gagal Masuk', mapAuthError(error));
        return;
      }

      if (data.user) {
        // Cek profile role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'mitra') {
          navigation.replace('OwnerApp');
        } else if (profile?.role === 'penyewa') {
          navigation.replace('RenterApp');
        } else {
          navigation.navigate('PilihRole');
        }
      }
    } catch (err: any) {
      Alert.alert('Gagal Masuk', mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        // Fallback jika anonymous auth belum aktif di Supabase dashboard
        console.warn('Anonymous auth failed:', error.message);
      }
      navigation.navigate('RenterApp');
    } catch {
      navigation.navigate('RenterApp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <AppHeader onBack={() => navigation.goBack()} />

      <View style={styles.header}>
        <Text style={styles.title}>Selamat datang kembali!</Text>
        <Text style={styles.subtitle}>
          Sewa kendaraan impian Anda dengan lebih cepat dan aman bersama Vehigo!
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Email atau No. Telepon"
          icon={Mail}
          placeholder="nama@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={identifier}
          onChangeText={setIdentifier}
        />

        <View style={styles.passwordBlock}>
          <TextField
            label="Kata Sandi"
            icon={Lock}
            placeholder="Masukkan kata sandi Anda"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Pressable style={styles.forgot} hitSlop={8}>
            <Text style={styles.forgotText}>Lupa Sandi?</Text>
          </Pressable>
        </View>

        <PrimaryButton
          label={loading ? "MEMPROSES..." : "MASUK"}
          onPress={handleLogin}
          disabled={loading}
        />

        <SocialAuthRow />

        <Pressable style={styles.linkRow} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.linkMuted}>Belum punya akun? </Text>
          <Text style={styles.link}>Daftar Sekarang</Text>
        </Pressable>
      </View>

      <Pressable style={styles.guest} onPress={handleGuest}>
        <Text style={styles.guestText}>
          *Jelajahi aplikasi tanpa akun. Beberapa fitur mungkin terbatas.
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  form: {
    gap: spacing.base,
  },
  passwordBlock: {
    gap: spacing.sm,
  },
  forgot: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.secondary,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  linkMuted: {
    ...typography.bodySm,
    color: colors.text.secondary,
  },
  link: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.secondary,
  },
  guest: {
    marginTop: spacing.xl,
  },
  guestText: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
