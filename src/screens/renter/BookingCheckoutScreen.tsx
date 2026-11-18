import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Car, CalendarDays } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Stepper } from '../../components/Stepper';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { Card } from '../../components/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatRupiah, vehicles } from '../../data/mock';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingCheckout'>;

export default function BookingCheckoutScreen({ navigation, route }: Props) {
  const vehicle = vehicles.find((item) => item.id === route.params.vehicleId) ?? vehicles[0];
  const [method, setMethod] = useState('Lepas Kunci');
  const days = 3;
  const total = vehicle.pricePerDay * days + 50000;

  return (
    <Screen scroll>
      <AppHeader title="Checkout" onBack={() => navigation.goBack()} />
      <Stepper current={2} total={3} labelLeft="CHECKOUT" />

      <Card style={styles.vehicle}>
        <View style={[styles.thumb, { backgroundColor: vehicle.tint }]}>
          <Car size={30} color={colors.primary} />
        </View>
        <View style={styles.vehicleText}>
          <Text style={styles.name}>{vehicle.name}</Text>
          <Text style={styles.meta}>{vehicle.mitra} • Palembang Area</Text>
          <Text style={styles.price}>{formatRupiah(vehicle.pricePerDay)}/hari</Text>
        </View>
      </Card>

      <View style={styles.dateRow}>
        <View style={styles.dateCol}>
          <CalendarDays size={16} color={colors.primary} />
          <Text style={styles.dateLabel}>TANGGAL MULAI</Text>
          <Text style={styles.dateValue}>25 Des 2023</Text>
        </View>
        <View style={styles.dateCol}>
          <CalendarDays size={16} color={colors.primary} />
          <Text style={styles.dateLabel}>TANGGAL SELESAI</Text>
          <Text style={styles.dateValue}>1 Jan 2024</Text>
        </View>
      </View>

      <Text style={styles.label}>METODE SEWA</Text>
      <SegmentedTabs options={['Lepas Kunci', 'Dengan Driver']} value={method} onChange={setMethod} />

      <Card style={styles.summary}>
        <Row label="Biaya sewa (3 hari)" value={formatRupiah(vehicle.pricePerDay * days)} />
        <Row label="Asuransi" value={formatRupiah(50000)} />
        <View style={styles.divider} />
        <Row label="Total" value={formatRupiah(total)} bold />
      </Card>

      <PrimaryButton
        label="Lanjut ke Pembayaran"
        onPress={() => navigation.navigate('BookingPayment', { vehicleId: vehicle.id })}
      />
    </Screen>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  vehicle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.base,
    backgroundColor: colors.surface,
  },
  thumb: {
    width: 64,
    height: 60,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleText: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  meta: {
    ...typography.caption,
    color: colors.text.muted,
  },
  price: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.secondary,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.base,
  },
  dateCol: {
    flex: 1,
    gap: 3,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.card,
  },
  dateLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.muted,
  },
  dateValue: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  label: {
    ...typography.label,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
  summary: {
    marginTop: spacing.base,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    ...typography.bodySm,
    color: colors.text.secondary,
  },
  rowValue: {
    ...typography.bodySm,
  },
  rowBold: {
    fontWeight: '700',
    color: colors.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
});
