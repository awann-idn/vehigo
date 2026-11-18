import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, ShieldCheck } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { PrimaryButton } from '../components/PrimaryButton';
import { PageDots } from '../components/OnboardingBits';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding3'>;

export default function Onboarding3Screen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>VEHIGO</Text>
      </View>

      <View style={styles.illustration}>
        <View style={styles.halo}>
          <View style={styles.shield}>
            <ShieldCheck size={92} color={colors.text.white} strokeWidth={1.3} />
            <View style={styles.checkBadge}>
              <Check size={18} color={colors.text.white} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Transaksi Aman & Terpercaya</Text>
        <Text style={styles.body}>
          Semua transaksi dilindungi oleh sistem keamanan kami. Nikmati penyewaan
          kendaraan tanpa rasa khawatir.
        </Text>
        <PageDots total={3} active={2} />
        <PrimaryButton label="MULAI SEKARANG" onPress={() => navigation.navigate('Login')} />
        <Text style={styles.terms}>
          Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami.
        </Text>
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
  header: {
    paddingTop: spacing.base,
  },
  brand: {
    ...typography.h3,
    letterSpacing: 3,
    color: colors.primary,
  },
  illustration: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shield: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 26,
    right: 26,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
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
  terms: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
