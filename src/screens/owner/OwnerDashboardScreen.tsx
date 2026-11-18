import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BarChart3,
  Bell,
  CalendarCheck,
  Car,
  ClipboardList,
  MapPin,
  Star,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatRupiah, ownerOrders, vehicles } from '../../data/mock';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerApp'>;

const kpis = [
  { icon: Wallet, label: 'PENDAPATAN', value: 'Rp 8.5M', hint: 'Bulan ini' },
  { icon: ClipboardList, label: 'PESANAN', value: '24', hint: 'Bulan ini' },
  { icon: Car, label: 'ARMADA', value: `${vehicles.length} unit`, hint: 'Aktif' },
  { icon: Star, label: 'RATING', value: '4.9', hint: 'Sangat Baik' },
];

export default function OwnerDashboardScreen({ navigation }: Props) {
  return (
    <Screen scroll>
      <View style={styles.topBar}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>Selamat datang,</Text>
          <Text style={styles.brand}>Sriwijaya Rent!</Text>
          <View style={styles.locationRow}>
            <MapPin size={13} color={colors.text.muted} />
            <Text style={styles.location}>Palembang, ID</Text>
          </View>
        </View>
        <Pressable style={styles.avatar} onPress={() => navigation.navigate('OwnerApp')}>
          <Text style={styles.avatarText}>SR</Text>
        </Pressable>
      </View>

      <Card style={styles.banner}>
        <View style={styles.bannerIcon}>
          <TrendingUp size={20} color={colors.text.white} />
        </View>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>2 pesanan baru diselesaikan penyewa</Text>
          <Text style={styles.bannerBody}>
            Pantau performa usaha dan kelola aktivitas rental Anda secara real-time.
          </Text>
        </View>
      </Card>

      <View style={styles.grid}>
        {kpis.map(({ icon: Icon, label, value, hint }) => (
          <View key={label} style={styles.kpi}>
            <Icon size={18} color={colors.primary} />
            <Text style={styles.kpiLabel}>{label}</Text>
            <Text style={styles.kpiValue}>{value}</Text>
            <Text style={styles.kpiHint}>{hint}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kendaraan Terlaris</Text>
        <BarChart3 size={18} color={colors.text.muted} />
      </View>
      <Card style={styles.bestSeller}>
        <View style={styles.bestIcon}>
          <Car size={22} color={colors.primary} />
        </View>
        <View style={styles.bestText}>
          <Text style={styles.bestTitle}>Toyota Avanza 2023</Text>
          <Text style={styles.bestSub}>Mitsubishi Xpander</Text>
        </View>
        <StatusBadge label="INSIGHT" tone="success" />
      </Card>

      <View style={styles.insightRow}>
        <Card style={styles.insight}>
          <Text style={styles.insightLabel}>INSIGHT</Text>
          <Text style={styles.insightText}>Avanza paling laris pekan ini</Text>
        </Card>
        <Card style={styles.insight}>
          <Text style={styles.insightLabel}>PREDIKSI</Text>
          <Text style={styles.insightText}>Hari tersibuk: Sabtu</Text>
        </Card>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pesanan Terbaru</Text>
        <Pressable onPress={() => navigation.navigate('OwnerApp')}>
          <Text style={styles.seeAll}>Lihat semua</Text>
        </Pressable>
      </View>

      {ownerOrders.slice(0, 3).map((order) => (
        <Pressable
          key={order.id}
          style={styles.orderRow}
          onPress={() => navigation.navigate('OwnerOrderDetail', { id: order.id })}
        >
          <View style={styles.orderIcon}>
            <CalendarCheck size={18} color={colors.primary} />
          </View>
          <View style={styles.orderText}>
            <Text style={styles.orderName}>{order.renter}</Text>
            <Text style={styles.orderSub}>
              {order.vehicle.split(' ')[0]} • {order.start}
            </Text>
          </View>
          <View style={styles.orderRight}>
            <Text style={styles.orderTotal}>{formatRupiah(order.total)}</Text>
            <StatusBadge label={order.status} tone={order.status === 'Selesai' ? 'success' : 'warning'} />
          </View>
        </Pressable>
      ))}

      <Pressable style={styles.alertsLink} onPress={() => navigation.navigate('OwnerApp')}>
        <Bell size={16} color={colors.primary} />
        <Text style={styles.alertsLinkText}>Buka pusat notifikasi</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
    paddingBottom: spacing.base,
  },
  greetingBlock: {
    gap: 2,
  },
  greeting: {
    ...typography.bodySm,
    color: colors.text.muted,
  },
  brand: {
    ...typography.h2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  location: {
    ...typography.caption,
    color: colors.text.muted,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.bodySm,
    fontWeight: '800',
    color: colors.text.white,
  },
  banner: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
    gap: 3,
  },
  bannerTitle: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.text.white,
  },
  bannerBody: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.base,
  },
  kpi: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    gap: 2,
  },
  kpiLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.6,
    marginTop: 6,
  },
  kpiValue: {
    ...typography.h3,
  },
  kpiHint: {
    ...typography.caption,
    color: colors.text.muted,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
  },
  seeAll: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.secondary,
  },
  bestSeller: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  bestIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestText: {
    flex: 1,
    gap: 2,
  },
  bestTitle: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  bestSub: {
    ...typography.caption,
    color: colors.text.muted,
  },
  insightRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  insight: {
    flex: 1,
    gap: 4,
    backgroundColor: colors.surface,
  },
  insightLabel: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.6,
  },
  insightText: {
    ...typography.bodySm,
    color: colors.text.secondary,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  orderIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    flex: 1,
    gap: 2,
  },
  orderName: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  orderSub: {
    ...typography.caption,
    color: colors.text.muted,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderTotal: {
    ...typography.caption,
    fontWeight: '700',
  },
  alertsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.lg,
  },
  alertsLinkText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.primary,
  },
});
