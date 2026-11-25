import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Lock, Mail } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { supabase } from '../lib/supabase';
import { mapAuthError } from '../lib/authErrors';
import { TextField } from '../components/TextField';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const routeByRole = (role?: string | null) => {
    if (role === 'admin') navigation.replace('AdminApp');
    else if (role === 'mitra') navigation.replace('OwnerApp');
    else if (role === 'penyewa') navigation.replace('RenterApp');
    else navigation.replace('PilihRole');
  };

  const handleLogin = async () => {
    const email = identifier.trim().toLowerCase();
    if (!email || !password) {
      Alert.alert('Perhatian', 'Harap masukkan email dan kata sandi.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Email tidak valid', 'Gunakan alamat email yang sama persis dengan saat mendaftar.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        Alert.alert('Login ditolak Supabase', `${mapAuthError(error)}\n\nDetail server: ${error.message}`);
        return;
      }
      if (!data.session) {
        Alert.alert('Email belum dikonfirmasi', 'Buka link konfirmasi dari email Supabase terlebih dahulu, lalu coba login lagi.');
        return;
      }
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();
        if (profileError) {
          Alert.alert('Profile belum tersedia', `Akun berhasil login, tetapi profile belum bisa dibaca.\n\nDetail server: ${profileError.message}`);
          return;
        }
        routeByRole(profile?.role);
      }
    } catch (err) {
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
        Alert.alert('Mode tamu tidak tersedia', 'Aktifkan anonymous sign-in di Supabase atau daftar akun terlebih dahulu.');
        return;
      }
      navigation.replace('RenterApp');
    } catch (err) {
      Alert.alert('Mode tamu gagal', mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Selamat datang kembali!</Text>
        <Text style={styles.subtitle}>
          Sewa kendaraan impian Anda dengan lebih cepat dan aman dengan Vehigo!
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

        <View>
          <TextField
            label="Kata Sandi"
            icon={Lock}
            placeholder="Masukkan kata sandi Anda"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            style={styles.forgot}
            hitSlop={8}
            onPress={async () => {
              const email = identifier.trim().toLowerCase();
              if (!/^\S+@\S+\.\S+$/.test(email)) {
                Alert.alert('Email diperlukan', 'Masukkan email terlebih dahulu.');
                return;
              }
              const { error } = await supabase.auth.resend({ type: 'signup', email });
              Alert.alert(
                error ? 'Gagal mengirim email' : 'Email dikirim',
                error ? mapAuthError(error) : 'Cek inbox untuk link konfirmasi akun.'
              );
            }}
          >
            <Text style={styles.forgotText}>Lupa Sandi?</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.primary, pressed && styles.pressed, loading && styles.disabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.primaryText}>{loading ? 'MEMPROSES...' : 'LOGIN'}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.guestButton, pressed && styles.pressed, loading && styles.disabled]}
          onPress={handleGuest}
          disabled={loading}
        >
          <Text style={styles.guestText}>LOGIN SEBAGAI TAMU*</Text>
        </Pressable>

        <Text style={styles.note}>*Jelajahi aplikasi tanpa akun. Beberapa fitur mungkin terbatas.</Text>

        <Pressable style={styles.linkRow} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.linkMuted}>Belum punya akun? </Text>
          <Text style={styles.link}>Daftar Sekarang</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: spacing.base,
  },
  header: {
    marginTop: 60,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
    fontSize: 26,
    lineHeight: 34,
    color: colors.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.primary,
    lineHeight: 22,
    maxWidth: 330,
  },
  form: {
    gap: spacing.base,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
  forgotText: {
    ...typography.caption,
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: colors.secondary,
  },
  primary: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.base,
  },
  primaryText: {
    ...typography.button,
    color: '#F6F3F5',
  },
  guestButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E5E2E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestText: {
    ...typography.button,
    color: '#1A2138',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
  note: {
    ...typography.caption,
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: '#9397A6',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  linkMuted: {
    ...typography.bodySm,
    fontSize: 12,
    color: '#000000',
  },
  link: {
    ...typography.bodySm,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 12,
    color: colors.secondary,
  },
});
