import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
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
import { formatRupiah } from '../../lib/formatters';
import { useAuth } from '../../features/auth/useAuth';
import { useVehicle } from '../../hooks/useVehicles';
import { useCreateOrder } from '../../hooks/useOrders';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingCheckout'>;

export default function BookingCheckoutScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { data: vehicle, isLoading: vehicleLoading, isError: vehicleError } = useVehicle(route.params.vehicleId);
  const createOrder = useCreateOrder();
  const [method, setMethod] = useState('Lepas Kunci');

  const [period] = useState(() => {
    const start = route.params.startDate ? new Date(`${route.params.startDate}T00:00:00`) : new Date();
    const end = route.params.endDate ? new Date(`${route.params.endDate}T00:00:00`) : new Date(start);
    if (!route.params.endDate) end.setDate(end.getDate() + 1);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
    const label = (date: Date) =>
      date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const iso = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
      ).padStart(2, '0')}`;
    return {
      start: iso(start),
      end: iso(end),
      days,
      startLabel: label(start),
      endLabel: label(end),
    };
  });

  if (vehicleLoading) {
    return <Screen><Text style={styles.meta}>Memuat kendaraan...</Text></Screen>;
  }

  if (vehicleError || !vehicle || vehicle.status !== 'Tersedia') {
    return <Screen><Text style={styles.meta}>Kendaraan sedang tidak tersedia untuk dipesan.</Text></Screen>;
  }

  const subtotal = vehicle.pricePerDay * period.days;
  const driverFee = method === 'Dengan Driver' ? 150000 * period.days : 0;
  const total = subtotal + driverFee;

  const submit = () => {
    if (!user) {
      Alert.alert('Masuk dulu', 'Silakan masuk untuk melanjutkan pemesanan.');
      return;
    }

    createOrder.mutate(
      {
        renter_id: user.id,
        mitra_id: vehicle.mitraId,
        vehicle_id: vehicle.id,
        start_date: period.start,
        end_date: period.end,
        days: period.days,
        daily_price: vehicle.pricePerDay,
        subtotal,
        deposit: 0,
        total,
        payment_method: method,
        notes: method === 'Dengan Driver' ? 'Termasuk Layanan Driver' : 'Lepas Kunci',
        extra_fee: driverFee,
      },
      {
        onSuccess: (order) =>
          navigation.navigate('BookingPayment', {
            vehicleId: vehicle.id,
            orderId: order.id,
            total: order.total,
          }),
        onError: (error) => Alert.alert('Gagal membuat pesanan', error.message),
      }
    );
  };

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
          <Text style={styles.dateValue}>{period.startLabel}</Text>
        </View>
        <View style={styles.dateCol}>
          <CalendarDays size={16} color={colors.primary} />
          <Text style={styles.dateLabel}>TANGGAL SELESAI</Text>
          <Text style={styles.dateValue}>{period.endLabel}</Text>
        </View>
      </View>

      <Text style={styles.label}>METODE SEWA</Text>
      <SegmentedTabs options={['Lepas Kunci', 'Dengan Driver']} value={method} onChange={setMethod} />

      <Card style={styles.summary}>
        <Row label={`Biaya sewa (${period.days} hari)`} value={formatRupiah(subtotal)} />
        {driverFee > 0 ? (
          <Row label={`Layanan Driver (${period.days} hari)`} value={formatRupiah(driverFee)} />
        ) : null}
        <View style={styles.divider} />
        <Row label="Total" value={formatRupiah(total)} bold />
      </Card>

      <PrimaryButton
        label="Lanjut ke Pembayaran"
        onPress={submit}
        loading={createOrder.isPending}
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
