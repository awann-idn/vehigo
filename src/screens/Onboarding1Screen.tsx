import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Car, Search, ShieldCheck } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { PrimaryButton } from '../components/PrimaryButton';
import { OnboardingHeader, PageDots } from '../components/OnboardingBits';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding1'>;

export default function Onboarding1Screen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader onSkip={() => navigation.navigate('Login')} />

      <View style={styles.illustration}>
        <View style={styles.circle}>
          <Car size={84} color={colors.primary} strokeWidth={1.3} />
          <View style={styles.floating}>
            <Search size={20} color={colors.text.white} />
          </View>
          <View style={[styles.floating, styles.floatingAlt]}>
            <ShieldCheck size={20} color={colors.text.white} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Temukan Kendaraan Impian Anda</Text>
        <Text style={styles.body}>
          Ribuan pilihan kendaraan siap menemani perjalanan Anda. Sewa lebih cepat dan
          mudah dari mana saja.
        </Text>
        <PageDots total={3} active={0} />
        <PrimaryButton label="MULAI SEKARANG" onPress={() => navigation.navigate('Onboarding2')} />
        <Text style={styles.copyright}>© 2026 Vehigo Indonesia. Seluruh Hak Cipta Dilindungi.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.base,
  },
  illustration: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floating: {
    position: 'absolute',
    top: 24,
    right: 18,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingAlt: {
    top: undefined,
    right: undefined,
    bottom: 22,
    left: 20,
    backgroundColor: colors.secondary,
  },
  content: {
    gap: spacing.base,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    textAlign: 'center',
    color: colors.text.secondary,
  },
  copyright: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
