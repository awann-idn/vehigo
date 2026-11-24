import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatRupiah } from '../../lib/formatters';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../features/auth/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerApp'>;

const tabs = ['Semua', 'Menunggu', 'Berlangsung', 'Selesai', 'Dibatalkan'];

function matchesTab(status: string, tab: string) {
  if (tab === 'Semua') return true;
  if (tab === 'Menunggu') return status === 'Belum Bayar' || status === 'Menunggu Konfirmasi';
  if (tab === 'Selesai') return status === 'Selesai' || status === 'Denda';
  return status === tab;
}

export default function OwnerOrdersScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('Semua');

  const { data: ownerOrders = [], isLoading } = useOrders('mitra', user?.id);

  const data = useMemo(
    () =>
      ownerOrders.filter(
        (order) =>
          (matchesTab(order.status, tab)) &&
          (order.code.toLowerCase().includes(query.toLowerCase()) ||
            order.renter.toLowerCase().includes(query.toLowerCase()) ||
            order.vehicle.toLowerCase().includes(query.toLowerCase()))
      ),
    [query, tab, ownerOrders]
  );

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Pesanan Saya</Text>
        <Text style={styles.subtitle}>Kelola dan pantau pesanan dari penyewa</Text>
      </View>

      <TextField
        icon={Search}
        placeholder="Cari pesanan..."
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.tabs}>
        <SegmentedTabs options={tabs} value={tab} onChange={setTab} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Belum ada pesanan"
          message="Pesanan yang masuk akan muncul di sini."
        />
      ) : (
        <View style={styles.list}>
          {data.map((order) => (
            <Pressable
              key={order.id}
              style={styles.card}
              onPress={() => navigation.navigate('OwnerOrderDetail', { id: order.id })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.code}>{order.code}</Text>
                <StatusBadge
                  label={order.status}
                  tone={
                    order.status === 'Selesai'
                      ? 'success'
                      : order.status === 'Berlangsung'
                        ? 'neutral'
                        : order.status === 'Denda' || order.status === 'Dibatalkan'
                          ? 'danger'
                          : 'warning'
                  }
                />
              </View>
              <Text style={styles.renter}>{order.renter}</Text>
              <Text style={styles.meta}>
                {order.vehicle} • {order.plate}
              </Text>
              <Text style={styles.meta}>
                {order.start} – {order.end} ({order.days} hari)
              </Text>
              <View style={styles.cardBottom}>
                <Text style={styles.total}>Total: {formatRupiah(order.total)}</Text>
                <Text style={styles.detail}>LIHAT DETAIL</Text>
              </View>
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
  tabs: {
    marginTop: spacing.md,
  },
  list: {
    gap: spacing.md,
    marginTop: spacing.base,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.stroke,
    padding: spacing.base,
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  code: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.4,
  },
  renter: {
    ...typography.body,
    fontWeight: '700',
  },
  meta: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  total: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  detail: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
});
