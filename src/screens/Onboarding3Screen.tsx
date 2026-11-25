import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { PageDots, ShieldIllustration } from '../components/OnboardingBits';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding3'>;

const LOGO = require('../../assets/figma/vehigo_wordmark.png');

export default function Onboarding3Screen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.illustration}>
        <ShieldIllustration />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Transaksi{'\n'}
          <Text style={styles.titleMuted}>Aman &amp; Terpercaya</Text>
        </Text>
        <Text style={styles.body}>
          Semua transaksi dilindungi oleh sistem keamanan kami. Nikmati penyewaan kendaraan
          tanpa rasa khawatir.
        </Text>

        <PageDots total={3} active={2} />

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.ctaText}>MULAI SEKARANG</Text>
        </Pressable>

        <Text style={styles.terms}>
          Dengan melanjutkan, Anda menyetujui{' '}
          <Text style={styles.termsLink} onPress={() => navigation.navigate('Terms')}>
            Syarat &amp; Ketentuan
          </Text>{' '}
          kami.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  header: {
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  logo: {
    width: 76,
    height: 38,
  },
  illustration: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: spacing.base,
  },
  title: {
    ...typography.h2,
    color: colors.primary,
    textAlign: 'center',
  },
  titleMuted: {
    ...typography.h2,
    color: '#76767E',
  },
  body: {
    ...typography.body,
    color: '#46464D',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  cta: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
  },
  ctaText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  terms: {
    ...typography.caption,
    color: '#30364F',
    textAlign: 'center',
  },
  termsLink: {
    fontFamily: 'Manrope_800ExtraBold',
  },
});
