import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { formatRupiah, ownerOrders } from '../../data/mock';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerOrderDetail'>;

export default function OwnerOrderDetailScreen({ navigation, route }: Props) {
  const order = ownerOrders.find((item) => item.id === route.params.id) ?? ownerOrders[0];

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
        <PrimaryButton label="Hubungi Penyewa" variant="secondary" onPress={() => {}} />
        <PrimaryButton label="Konfirmasi Pesanan" onPress={() => {}} />
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
