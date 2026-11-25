import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { OnboardingHeader, PageDots } from '../components/OnboardingBits';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding1'>;

const PHONE = require('../../assets/figma/onboarding_phone.jpg');

export default function Onboarding1Screen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <OnboardingHeader onSkip={() => navigation.navigate('Login')} />

      <View style={styles.illustration}>
        <Image source={PHONE} style={styles.photo} resizeMode="cover" />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Temukan Kendaraan{'\n'}
          <Text style={styles.titleMuted}>Impian Anda</Text>
        </Text>
        <Text style={styles.body}>
          Ribuan pilihan kendaraan siap menemani perjalanan Anda. Sewa lebih cepat dan mudah
          dari mana saja
        </Text>

        <PageDots total={3} active={0} />

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Onboarding2')}
        >
          <Text style={styles.ctaText}>LANJUT</Text>
        </Pressable>
        <Text style={styles.copyright}>
          © 2026 Vehigo Indonesia. Seluruh Hak Cipta Dilindungi.
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
  illustration: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
  },
  photo: {
    width: 267,
    height: 203,
    borderRadius: 27,
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
  copyright: {
    ...typography.caption,
    color: '#757577',
    textAlign: 'center',
  },
});
