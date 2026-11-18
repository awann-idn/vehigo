import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Building2, Copy, Timer } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Stepper } from '../../components/Stepper';
import { Card } from '../../components/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingPayment'>;

export default function BookingPaymentScreen({ navigation }: Props) {
  return (
    <Screen scroll>
      <AppHeader title="Pembayaran" onBack={() => navigation.goBack()} />
      <Stepper current={3} total={3} labelLeft="PEMBAYARAN" />

      <Card style={styles.total}>
        <Text style={styles.totalLabel}>TOTAL PEMBAYARAN</Text>
        <Text style={styles.totalValue}>Rp 705.000</Text>
        <View style={styles.timer}>
          <Timer size={14} color={colors.text.white} />
          <Text style={styles.timerText}>Bayar dalam 23:59:12</Text>
        </View>
      </Card>

      <Text style={styles.label}>METODE TRANSFER</Text>
      <Card style={styles.bank}>
        <View style={styles.bankIcon}>
          <Building2 size={20} color={colors.primary} />
        </View>
        <View style={styles.bankText}>
          <Text style={styles.bankName}>Virtual Account BNI</Text>
          <Text style={styles.bankNumber}>8839 0812 4452 901</Text>
        </View>
        <Copy size={18} color={colors.text.muted} />
      </Card>

      <Text style={styles.hint}>
        Selesaikan pembayaran sebelum batas waktu. Pesanan otomatis dibatalkan bila melewati
        batas waktu.
      </Text>

      <PrimaryButton
        label="Selesai"
        onPress={() => navigation.replace('RenterApp')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: {
    marginTop: spacing.base,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    gap: 4,
  },
  totalLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.6,
  },
  totalValue: {
    ...typography.h1,
    color: colors.text.white,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  timerText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  label: {
    ...typography.label,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  bank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  bankIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankText: {
    flex: 1,
    gap: 2,
  },
  bankName: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  bankNumber: {
    ...typography.bodySm,
    color: colors.text.secondary,
  },
  hint: {
    ...typography.caption,
    color: colors.text.muted,
    marginVertical: spacing.base,
  },
});
