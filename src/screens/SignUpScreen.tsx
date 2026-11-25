import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Check, ChevronLeft, KeyRound, Lock, Mail } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { supabase } from '../lib/supabase';
import { mapAuthError } from '../lib/authErrors';
import { TextField } from '../components/TextField';

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
    if (!agreed) {
      Alert.alert('Syarat & Ketentuan', 'Centang persetujuan Syarat & Ketentuan terlebih dahulu.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        Alert.alert('Signup ditolak Supabase', `${mapAuthError(error)}\n\nDetail server: ${error.message}`);
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
    } catch (err) {
      Alert.alert('Gagal Mendaftar', mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <ChevronLeft size={20} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Daftar ke Vehigo</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Selamat datang di Vehigo</Text>
          <Text style={styles.subtitle}>
            Dari Pilihan ke Perjalanan, Semua dalam Genggaman.{' '}
            <Text style={styles.subtitleStrong}>Daftar Sekarang!</Text>
          </Text>

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
              icon={KeyRound}
              placeholder="Masukkan ulang kata sandi"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Pressable style={styles.agreeRow} onPress={() => setAgreed((v) => !v)}>
              <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                {agreed ? <Check size={14} color={colors.text.white} /> : null}
              </View>
              <Text style={styles.agreeText}>
                Saya telah membaca dan menyetujui{' '}
                <Text style={styles.agreeLink} onPress={() => navigation.navigate('Terms')}>
                  Syarat &amp; Ketentuan
                </Text>{' '}
                dari Vehigo
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.primary,
                pressed && styles.pressed,
                (!agreed || loading) && styles.disabled,
              ]}
              onPress={handleSignUp}
              disabled={!agreed || loading}
            >
              <Text style={styles.primaryText}>{loading ? 'MEMPROSES...' : 'DAFTAR'}</Text>
            </Pressable>

            <Pressable style={styles.linkRow} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkMuted}>Sudah punya akun? </Text>
              <Text style={styles.link}>Masuk di sini</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EDEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 18,
    color: colors.primary,
  },
  scroll: {
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
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
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  subtitleStrong: {
    fontFamily: 'Manrope_600SemiBold',
  },
  form: {
    gap: spacing.base,
  },
  agreeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#C7C6CE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  agreeText: {
    ...typography.caption,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
    color: '#000000',
  },
  agreeLink: {
    color: '#2563EB',
    fontFamily: 'Manrope_700Bold',
  },
  primary: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  primaryText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
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
