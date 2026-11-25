import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Car, ClipboardList } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatRupiah } from '../../lib/formatters';
import { useAuth } from '../../features/auth/useAuth';
import { useOrders } from '../../hooks/useOrders';

type Props = NativeStackScreenProps<RootStackParamList, 'RenterApp'>;

const tabs = ['Semua', 'Belum Bayar', 'Berlangsung', 'Selesai', 'Denda', 'Dibatalkan'];

const tabStatuses: Record<string, string[]> = {
  'Belum Bayar': ['Belum Bayar', 'Menunggu Konfirmasi'],
  Berlangsung: ['Berlangsung'],
  Selesai: ['Selesai'],
  Denda: ['Denda'],
  Dibatalkan: ['Dibatalkan'],
};

function matchesTab(status: string, tab: string) {
  if (tab === 'Semua') return true;
  return (tabStatuses[tab] ?? [tab]).includes(status);
}

export default function RenterOrdersScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState('Semua');

  const { data: orders = [], isLoading, isError, refetch } = useOrders('renter', user?.id);

  const data = useMemo(
    () => orders.filter((order) => matchesTab(order.status, tab)),
    [orders, tab]
  );

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Pesanan Saya</Text>
        <Text style={styles.subtitle}>Pantau status penyewaan kendaraan Anda</Text>
      </View>

      <SegmentedTabs options={tabs} value={tab} onChange={setTab} />

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : isError ? (
        <EmptyState
          icon={ClipboardList}
          title="Pesanan belum dapat dimuat"
          message="Periksa koneksi lalu coba lagi."
          actionLabel="Coba lagi"
          onAction={() => refetch()}
        />
      ) : data.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Belum ada pesanan" message="Pesanan Anda akan muncul di sini." />
      ) : (
        <View style={styles.list}>
          {data.map((order) => (
            <Pressable
              key={order.id}
              style={styles.card}
              onPress={() => navigation.navigate('RenterOrderDetail', { id: order.id })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.code}>{order.code}</Text>
                <StatusBadge
                  label={order.status}
                  tone={
                    order.status === 'Selesai'
                      ? 'success'
                      : order.status === 'Denda'
                        ? 'danger'
                        : 'warning'
                  }
                />
              </View>
              <View style={styles.row}>
                <View style={styles.thumb}>
                  <Car size={24} color={colors.primary} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.vehicle}>{order.vehicle}</Text>
                  <Text style={styles.meta}>{order.plate}</Text>
                  <Text style={styles.meta}>Total: {formatRupiah(order.total)}</Text>
                </View>
              </View>
              {order.status === 'Belum Bayar' ? (
                <PrimaryButton
                  label="Bayar Sekarang"
                  onPress={() => {
                    if (!order.vehicleId) {
                      Alert.alert('Data pesanan belum lengkap', 'Kendaraan pada pesanan ini belum tersedia.');
                      return;
                    }
                    navigation.navigate('BookingPayment', {
                      vehicleId: order.vehicleId,
                      orderId: order.id,
                      total: order.total,
                    });
                  }}
                />
              ) : order.status === 'Menunggu Konfirmasi' ? (
                <Text style={styles.waiting}>Menunggu konfirmasi mitra</Text>
              ) : order.status === 'Berlangsung' ? (
                <PrimaryButton
                  label="Akhiri Pemakaian"
                  variant="secondary"
                  onPress={() => navigation.navigate('Inspection', { id: order.id })}
                />
              ) : order.status === 'Selesai' ? (
                <PrimaryButton
                  label="Beri Rating"
                  variant="secondary"
                  onPress={() => navigation.navigate('Rating', { id: order.id })}
                />
              ) : null}
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.base,
    gap: 2,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.text.muted,
  },
  list: {
    gap: spacing.md,
    marginTop: spacing.base,
  },
  card: {
    padding: spacing.base,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.stroke,
    gap: spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  code: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.muted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  thumb: {
    width: 52,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  vehicle: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  meta: {
    ...typography.caption,
    color: colors.text.muted,
  },
  waiting: {
    ...typography.caption,
    fontFamily: 'Manrope_700Bold',
    color: colors.secondary,
    textAlign: 'center',
  },
});
