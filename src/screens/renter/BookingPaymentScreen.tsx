import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2, Clock3, Timer } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Stepper } from '../../components/Stepper';
import { Card } from '../../components/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatRupiah } from '../../lib/formatters';
import { useOrder, useUpdateOrderStatus } from '../../hooks/useOrders';
import { recordSuccessfulPayment } from '../../api/payments';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingPayment'>;

export default function BookingPaymentScreen({ navigation, route }: Props) {
  const orderId = route.params.orderId;
  const { data: order, isLoading, isError } = useOrder(orderId ?? '');
  const updateStatus = useUpdateOrderStatus();
  const [isPaying, setIsPaying] = useState(false);
  const total = order?.total ?? route.params.total ?? 0;

  const isPaid = order?.status === 'Menunggu Konfirmasi' || order?.status === 'Berlangsung' || order?.status === 'Selesai';

  const finish = () => {
    if (orderId) {
      navigation.navigate('RenterOrderDetail', { id: orderId });
      return;
    }
    navigation.navigate('RenterApp');
  };

  const handleSimulatePayment = async () => {
    if (!orderId) {
      Alert.alert('Error', 'ID Pesanan tidak ditemukan.');
      return;
    }

    setIsPaying(true);
    try {
      await recordSuccessfulPayment(orderId, total, 'Transfer Bank (Simulasi)');
      await updateStatus.mutateAsync({ id: orderId, status: 'menunggu_konfirmasi' });
      Alert.alert(
        'Pembayaran Simulasi Diterima',
        'Pembayaran tercatat. Pesanan menunggu konfirmasi mitra sebelum aktif.',
        [{ text: 'Lihat Pesanan', onPress: finish }]
      );
    } catch (error) {
      Alert.alert('Gagal memproses pembayaran', error instanceof Error ? error.message : 'Silakan coba lagi.');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <Screen scroll>
      <AppHeader title="Pembayaran" onBack={() => navigation.goBack()} />
      <Stepper current={3} total={3} labelLeft="PEMBAYARAN" />

      <Card style={styles.total}>
        <Text style={styles.totalLabel}>TOTAL PEMBAYARAN</Text>
        <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
        <View style={styles.timer}>
          <Timer size={14} color={colors.text.white} />
          <Text style={styles.timerText}>{isPaid ? 'Pembayaran Selesai' : 'Bayar dalam 23:59:12'}</Text>
        </View>
      </Card>

      <Text style={styles.label}>STATUS PEMBAYARAN</Text>
      <Card style={styles.bank}>
        <View style={styles.bankIcon}>
          {isPaid ? (
            <CheckCircle2 size={20} color={colors.success} />
          ) : (
            <Clock3 size={20} color={colors.primary} />
          )}
        </View>
        <View style={styles.bankText}>
          <Text style={styles.bankName}>
            {isLoading
              ? 'Memuat status...'
              : isError
                ? 'Status belum dapat dimuat'
                : isPaid
                  ? order?.status === 'Menunggu Konfirmasi'
                    ? 'Menunggu konfirmasi mitra'
                    : 'Pembayaran Berhasil'
                  : 'Menunggu pembayaran'}
          </Text>
          <Text style={styles.bankNumber}>
            {isPaid
              ? order?.status === 'Menunggu Konfirmasi'
                ? 'Mitra akan memverifikasi pembayaran Anda'
                : 'Pesanan telah dikonfirmasi'
              : 'Simulasi transfer bank / virtual account'}
          </Text>
        </View>
      </Card>

      <Text style={styles.hint}>
        {isPaid
          ? order?.status === 'Menunggu Konfirmasi'
            ? 'Pembayaran sudah tercatat. Pesanan aktif setelah mitra mengonfirmasi.'
            : 'Pembayaran telah dikonfirmasi dan unit siap digunakan sesuai jadwal sewa.'
          : 'Tekan tombol di bawah untuk menyelesaikan simulasi pembayaran tanpa gateway eksternal.'}
      </Text>

      <View style={{ gap: spacing.sm }}>
        {!isPaid ? (
          <PrimaryButton
            label="Simulasi Bayar Sekarang"
            onPress={handleSimulatePayment}
            loading={isPaying || updateStatus.isPending}
          />
        ) : null}
        <PrimaryButton
          label={isPaid ? 'Lihat Detail Pesanan' : 'Kembali ke Pesanan'}
          variant={isPaid ? 'primary' : 'secondary'}
          onPress={finish}
        />
      </View>
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
