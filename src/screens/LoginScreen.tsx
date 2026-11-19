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
import { useAuth } from '../features/auth/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { refreshProfile } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert(
          'Login ditolak Supabase',
          `${mapAuthError(error)}\n\nDetail server: ${error.message}`
        );
        return;
      }

      if (!data.session) {
        Alert.alert('Email belum dikonfirmasi', 'Buka link konfirmasi dari email Supabase terlebih dahulu, lalu coba login lagi.');
        return;
      }

      if (data.user) {
        // Cek profile role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) {
          Alert.alert('Profile belum tersedia', `Akun berhasil login, tetapi profile belum bisa dibaca. Jalankan migration trigger profile di Supabase.\n\nDetail server: ${profileError.message}`);
          return;
        }

        if (profile?.role === 'admin') {
          navigation.replace('AdminApp');
        } else if (profile?.role === 'mitra') {
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
    Alert.alert('Login diperlukan', 'Buat akun atau masuk untuk menggunakan Vehigo.');
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
          label="Email"
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
            <Text style={styles.forgotText}>Kirim ulang konfirmasi</Text>
          </Pressable>
        </View>

        <PrimaryButton
          label={loading ? "MEMPROSES..." : "MASUK"}
          onPress={handleLogin}
          disabled={loading}
        />

        <SocialAuthRow onSignedIn={async () => {
          await refreshProfile();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          if (error) {
            Alert.alert('Profil belum dapat dimuat', error.message);
            return;
          }
          if (profile?.role === 'admin') navigation.replace('AdminApp');
          else if (profile?.role === 'mitra') navigation.replace('OwnerApp');
          else if (profile?.role === 'penyewa') navigation.replace('RenterApp');
          else navigation.replace('PilihRole');
        }} />

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
