import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BarChart3, Car, Check, KeyRound } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { PrimaryButton } from '../components/PrimaryButton';
import { OnboardingHeader, PageDots } from '../components/OnboardingBits';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding2'>;

const perks = [
  'Akses ribuan pilihan kendaraan berkualitas dan mitra rental terpercaya',
  'Dapatkan laporan dan grafik analitik otomatis dari hasil penyewaan kendaraan Anda',
];

export default function Onboarding2Screen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader onSkip={() => navigation.navigate('Login')} />

      <View style={styles.illustration}>
        <View style={styles.leftPanel}>
          <Car size={40} color={colors.primary} />
          <Text style={styles.panelLabel}>Penyewa</Text>
        </View>
        <View style={styles.rightPanel}>
          <KeyRound size={40} color={colors.text.white} />
          <Text style={[styles.panelLabel, styles.panelLabelLight]}>Mitra</Text>
        </View>
        <View style={styles.chartBadge}>
          <BarChart3 size={18} color={colors.text.white} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Sewa Kendaraan atau Jadi Pemilik?</Text>
        <Text style={styles.body}>
          Butuh kendaraan untuk perjalanan? Atau punya kendaraan yang ingin disewakan? Di
          Vehigo, Anda bisa melakukan keduanya dengan mudah!
        </Text>

        <View style={styles.perks}>
          {perks.map((perk) => (
            <View key={perk} style={styles.perkRow}>
              <View style={styles.check}>
                <Check size={14} color={colors.text.white} />
              </View>
              <Text style={styles.perkText}>{perk}</Text>
            </View>
          ))}
        </View>

        <PageDots total={3} active={1} />

        <View style={styles.actions}>
          <PrimaryButton
            label="KEMBALI"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          />
          <PrimaryButton
            label="LANJUT"
            onPress={() => navigation.navigate('Onboarding3')}
            style={styles.actionButton}
          />
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  leftPanel: {
    width: 130,
    height: 170,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  rightPanel: {
    width: 130,
    height: 200,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  panelLabel: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.primary,
  },
  panelLabelLight: {
    color: colors.text.white,
  },
  chartBadge: {
    position: 'absolute',
    bottom: '18%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
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
    ...typography.bodySm,
    textAlign: 'center',
    color: colors.text.secondary,
  },
  perks: {
    gap: spacing.md,
    width: '100%',
  },
  perkRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  perkText: {
    ...typography.bodySm,
    flex: 1,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
});
