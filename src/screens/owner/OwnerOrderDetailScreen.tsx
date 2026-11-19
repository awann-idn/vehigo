import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar, Car, CreditCard, MessageCircle, Phone, User } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatRupiah } from '../../lib/formatters';
import { useOrder, useUpdateOrderStatus } from '../../hooks/useOrders';
import { useAuth } from '../../features/auth/useAuth';
import { getOrCreateChat } from '../../api/chat';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerOrderDetail'>;

export default function OwnerOrderDetailScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { data: order, isLoading } = useOrder(route.params.id);
  const updateStatus = useUpdateOrderStatus();

  const openChat = async () => {
    if (!user || !order?.renterId || !order?.mitraId) {
      Alert.alert('Chat tidak tersedia', 'Data pesanan belum lengkap untuk membuka percakapan.');
      return;
    }
    try {
      const chat = await getOrCreateChat(order.id, order.renterId, order.mitraId);
      navigation.navigate('ChatDetail', { id: chat.id });
    } catch (error) {
      Alert.alert('Chat tidak tersedia', error instanceof Error ? error.message : 'Coba lagi.');
    }
  };

  if (isLoading || !order) {
    return (
      <Screen>
        <AppHeader title="Detail Pesanan" onBack={() => navigation.goBack()} />
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      </Screen>
    );
  }

  const nextStatus =
    order.status === 'Belum Bayar'
      ? ('berlangsung' as const)
      : order.status === 'Berlangsung' || order.status === 'Denda'
        ? ('selesai' as const)
        : null;
  const actionLabel =
    order.status === 'Belum Bayar' ? 'Konfirmasi Pesanan' : 'Selesaikan Pesanan';

  const handleConfirm = () => {
    if (!nextStatus) return;
    updateStatus.mutate(
      { id: order.id, status: nextStatus },
      {
        onSuccess: () => {
          Alert.alert(
            'Sukses',
            nextStatus === 'berlangsung' ? 'Pesanan berhasil dikonfirmasi.' : 'Pesanan berhasil diselesaikan.'
          );
          navigation.goBack();
        },
        onError: (err) => {
          Alert.alert('Error', err.message);
        },
      }
    );
  };

  return (
    <Screen scroll>
      <AppHeader title="Detail Pesanan" onBack={() => navigation.goBack()} />

      <View style={styles.codeRow}>
        <Text style={styles.code}>{order.code}</Text>
        <StatusBadge label={order.status} tone={order.status === 'Selesai' ? 'success' : 'warning'} />
      </View>

      <Card style={styles.card}>
        <Row icon={User} label="Penyewa" value={order.renter} />
        <Row icon={Phone} label="Kontak" value={order.phone} />
        <Row icon={Car} label="Kendaraan" value={`${order.vehicle} • ${order.plate}`} />
        <Row icon={Calendar} label="Periode" value={`${order.start} – ${order.end} (${order.days} hari)`} />
        <Row icon={CreditCard} label="Pembayaran" value={order.payment} />
      </Card>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>TOTAL PESANAN</Text>
        <Text style={styles.totalValue}>{formatRupiah(order.total)}</Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Hubungi Penyewa"
          variant="secondary"
          onPress={openChat}
        />
        {nextStatus ? (
          <PrimaryButton
            label={actionLabel}
            onPress={handleConfirm}
            loading={updateStatus.isPending}
          />
        ) : null}
      </View>

      <View style={styles.chatHint}>
        <MessageCircle size={16} color={colors.text.muted} />
        <Text style={styles.chatText}>
          Gunakan chat untuk mengirim bukti transfer atau instruksi pengambilan.
        </Text>
      </View>
    </Screen>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Icon size={18} color={colors.primary} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.base,
  },
  code: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.text.muted,
  },
  card: {
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
  rowValue: {
    ...typography.bodySm,
    fontWeight: '600',
  },
  totalCard: {
    marginTop: spacing.base,
    padding: spacing.base,
    borderRadius: 16,
    backgroundColor: colors.primary,
    gap: 4,
  },
  totalLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.6,
  },
  totalValue: {
    ...typography.h2,
    color: colors.text.white,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  chatHint: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    alignItems: 'flex-start',
  },
  chatText: {
    ...typography.caption,
    flex: 1,
    color: colors.text.muted,
  },
});
