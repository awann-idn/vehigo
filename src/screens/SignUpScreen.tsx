import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, Lock, Mail } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { supabase } from '../lib/supabase';
import { mapAuthError } from '../lib/authErrors';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const email = identifier.trim().toLowerCase();
    if (!email || !password) {
      Alert.alert('Perhatian', 'Harap isi email dan kata sandi.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Email tidak valid', 'Gunakan alamat email yang valid.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Perhatian', 'Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Perhatian', 'Kata sandi minimal 6 karakter.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert(
          'Signup ditolak Supabase',
          `${mapAuthError(error)}\n\nDetail server: ${error.message}`
        );
        return;
      }

      if (!data.user) {
        Alert.alert('Signup tidak selesai', 'Supabase tidak mengembalikan user. Coba lagi.');
        return;
      }

      if (data.session) {
        Alert.alert('Pendaftaran Berhasil', 'Akun Anda telah dibuat. Silakan tentukan peran Anda.', [
          { text: 'Lanjutkan', onPress: () => navigation.navigate('PilihRole') },
        ]);
      } else {
        Alert.alert(
          'Konfirmasi email diperlukan',
          'Akun berhasil dibuat. Buka link konfirmasi di email Anda, lalu kembali ke halaman login untuk masuk.',
          [{ text: 'Ke Login', onPress: () => navigation.replace('Login') }]
        );
      }
    } catch (err: any) {
      Alert.alert('Gagal Mendaftar', mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <AppHeader title="Daftar ke Vehigo" onBack={() => navigation.goBack()} />

      <View style={styles.header}>
        <Text style={styles.title}>Selamat datang di Vehigo</Text>
        <Text style={styles.subtitle}>
          Dari Pilihan ke Perjalanan, Semua dalam Genggaman. Daftar Sekarang!
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
        <TextField
          label="Kata Sandi"
          icon={Lock}
          placeholder="Masukkan kata sandi"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextField
          label="Konfirmasi Kata Sandi"
          icon={Lock}
          placeholder="Masukkan ulang kata sandi"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Pressable style={styles.agreeRow} onPress={() => setAgreed((v) => !v)}>
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed ? <Check size={13} color={colors.text.white} /> : null}
          </View>
          <Text style={styles.agreeText}>
            Saya telah membaca dan menyetujui{' '}
            <Text style={styles.agreeLink}>Syarat & Ketentuan</Text> dari Vehigo
          </Text>
        </Pressable>

        <PrimaryButton
          label={loading ? "MEMPROSES..." : "Daftar"}
          disabled={!agreed || loading}
          onPress={handleSignUp}
        />

        <Pressable style={styles.linkRow} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkMuted}>Sudah punya akun? </Text>
          <Text style={styles.link}>Masuk di sini</Text>
        </Pressable>
      </View>
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
  agreeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  agreeText: {
    ...typography.bodySm,
    flex: 1,
    color: colors.text.secondary,
  },
  agreeLink: {
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
});
