import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { formatRupiah } from '../../lib/formatters';
import { useAuth } from '../../features/auth/useAuth';
import { useOrders } from '../../hooks/useOrders';
import { useVehicles } from '../../hooks/useVehicles';
import { useMitraRating, useMyMitraProfile } from '../../hooks/useMitras';
import { useUnreadNotificationsCount } from '../../hooks/useNotifications';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerApp'>;

export default function OwnerDashboardScreen({ navigation }: Props) {
  const { user, profile } = useAuth();
  const unreadNotifs = useUnreadNotificationsCount(user?.id);
  const { data: orders = [] } = useOrders('mitra', user?.id);
  const { data: vehicles = [] } = useVehicles(user?.id);
  const { data: mitraProfile } = useMyMitraProfile(user?.id);
  const { data: rating } = useMitraRating(user?.id);

  const awaitingConfirmation = useMemo(
    () => orders.filter((order) => order.status === 'Belum Bayar').length,
    [orders]
  );
  const activeOrders = useMemo(
    () => orders.filter((order) => order.status === 'Berlangsung' || order.status === 'Denda').length,
    [orders]
  );
  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === 'Selesai').length,
    [orders]
  );

  const revenue = useMemo(
    () =>
      orders
        .filter((order) => order.status === 'Selesai')
        .reduce((sum, order) => sum + (order.total || 0), 0),
    [orders]
  );
  const revenueLabel =
    revenue >= 1_000_000 ? `Rp ${(revenue / 1_000_000).toFixed(1)}M` : formatRupiah(revenue);

  const rentedVehicles = useMemo(
    () => vehicles.filter((v) => v.status === 'Disewa').length,
    [vehicles]
  );
  const standbyVehicles = useMemo(
    () => vehicles.filter((v) => v.status === 'Tersedia').length,
    [vehicles]
  );
  const totalVehicles = vehicles.length;

  const kpis = [
    { icon: Wallet, label: 'PENDAPATAN', value: revenueLabel, hint: `${completedOrders} pesanan selesai` },
    { icon: ClipboardList, label: 'PESANAN', value: `${orders.length}`, hint: `${activeOrders} aktif • ${awaitingConfirmation} baru` },
    { icon: Car, label: 'ARMADA', value: `${totalVehicles} unit`, hint: `${rentedVehicles} disewa • ${standbyVehicles} standby` },
    {
      icon: Star,
      label: 'RATING',
      value: rating?.average ? rating.average.toFixed(1) : '-',
      hint: rating?.count ? `${rating.count} ulasan` : 'Belum ada ulasan',
    },
  ];

  const bestSeller = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((order) => {
      if (order.vehicle) {
        counts[order.vehicle] = (counts[order.vehicle] ?? 0) + 1;
      }
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : null;
  }, [orders]);

  return (
    <Screen scroll>
      <View style={styles.topBar}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>Selamat datang,</Text>
          <Text style={styles.brand}>{profile?.full_name || user?.email?.split('@')[0] || 'Profil belum dilengkapi'}</Text>
          <View style={styles.locationRow}>
            <MapPin size={13} color={colors.text.muted} />
            <Text style={styles.location} numberOfLines={1}>
              {mitraProfile?.address || 'Lokasi belum diatur'}
            </Text>
          </View>
        </View>
        <View style={styles.topRight}>
          <Pressable
            style={styles.bellBtn}
            onPress={() => navigation.navigate('OwnerAlerts')}
          >
            <Bell size={20} color={colors.primary} />
            {unreadNotifs > 0 ? <View style={styles.notifDot} /> : null}
          </Pressable>
          <Pressable
            style={styles.avatar}
            onPress={() => (navigation as any).navigate('OwnerApp', { screen: 'Profil' })}
          >
            {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} resizeMode="contain" />
          ) : (
            <Text style={styles.avatarText}>{(profile?.full_name || user?.email || 'M').slice(0, 2).toUpperCase()}</Text>
          )}
          </Pressable>
        </View>
      </View>

      <Card style={styles.banner}>
        <View style={styles.bannerIcon}>
          <TrendingUp size={20} color={colors.text.white} />
        </View>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>
            {awaitingConfirmation > 0
              ? `${awaitingConfirmation} pesanan menunggu konfirmasi`
              : 'Semua pesanan sudah ditangani'}
          </Text>
          <Text style={styles.bannerBody}>
            Pantau performa usaha dan kelola aktivitas rental Anda secara real-time.
          </Text>
        </View>
      </Card>

      <Card style={styles.checklist}>
        <Text style={styles.checklistTitle}>LANGKAH PERSIAPAN</Text>
        <ChecklistRow completed={!!mitraProfile} label="Profil usaha selesai" />
        <ChecklistRow completed={vehicles.length > 0} label="Tambah kendaraan" number={2} />
        <ChecklistRow completed={orders.length > 0} label="Mulai menerima pesanan" number={3} />
        {vehicles.length === 0 ? (
          <Pressable
            style={styles.checklistButton}
            onPress={() => navigation.navigate('OwnerAddVehicle')}
          >
            <Car size={18} color={colors.text.white} />
            <Text style={styles.checklistButtonText}>TAMBAH KENDARAAN</Text>
          </Pressable>
        ) : null}
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
          <Text style={styles.bestTitle}>{bestSeller?.name ?? 'Belum ada data'}</Text>
          <Text style={styles.bestSub}>
            {bestSeller ? `${bestSeller.count} pesanan` : 'Pesanan akan muncul di sini'}
          </Text>
        </View>
        <StatusBadge label="INSIGHT" tone="success" />
      </Card>

      <View style={styles.insightRow}>
        <Card style={styles.insight}>
          <Text style={styles.insightLabel}>STATUS ARMADA</Text>
          <Text style={styles.insightText}>
            {standbyVehicles} standby • {rentedVehicles} tersewa
          </Text>
        </Card>
        <Card style={styles.insight}>
          <Text style={styles.insightLabel}>PENDAPATAN</Text>
          <Text style={styles.insightText}>
            {completedOrders} pesanan selesai
          </Text>
        </Card>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pesanan Terbaru</Text>
        <Pressable onPress={() => (navigation as any).navigate('OwnerApp', { screen: 'Pesanan' })}>
          <Text style={styles.seeAll}>Lihat semua</Text>
        </Pressable>
      </View>

      {orders.length === 0 ? (
        <Card style={styles.bestSeller}>
          <Text style={styles.bestSub}>Belum ada pesanan terbaru.</Text>
        </Card>
      ) : (
        orders.slice(0, 3).map((order) => (
          <Pressable
            key={order.id}
            style={styles.orderRow}
            onPress={() => navigation.navigate('OwnerOrderDetail', { id: order.id })}
          >
            <View style={styles.orderIcon}>
              <CalendarCheck size={18} color={colors.primary} />
            </View>
            <View style={styles.orderText}>
              <Text style={styles.orderName}>{order.renter || 'Penyewa'}</Text>
              <Text style={styles.orderSub}>
                {(order.vehicle || 'Kendaraan').split(' ')[0]} • {order.start}
              </Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.orderTotal}>{formatRupiah(order.total)}</Text>
              <StatusBadge
                label={order.status}
                tone={
                  order.status === 'Selesai'
                    ? 'success'
                    : order.status === 'Berlangsung'
                      ? 'neutral'
                      : order.status === 'Dibatalkan'
                        ? 'danger'
                        : 'warning'
                }
              />
            </View>
          </Pressable>
        ))
      )}

      <Pressable
        style={styles.alertsLink}
        onPress={() => navigation.navigate('OwnerAlerts')}
      >
        <Bell size={16} color={colors.primary} />
        <Text style={styles.alertsLinkText}>Buka pusat notifikasi</Text>
      </Pressable>
    </Screen>
  );
}

function ChecklistRow({ completed, label, number }: { completed: boolean; label: string; number?: number }) {
  return (
    <View style={styles.checklistRow}>
      <View style={[styles.checkCircle, completed && styles.checkCircleDone]}>
        <Text style={[styles.checkText, completed && styles.checkTextDone]}>{completed ? '✓' : number}</Text>
      </View>
      <Text style={[styles.checklistLabel, completed && styles.checklistLabelDone]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    paddingTop: spacing.md,
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
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bellBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignSelf: 'center',
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
  checklist: {
    marginTop: spacing.base,
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  checklistTitle: {
    ...typography.label,
    color: colors.text.primary,
    letterSpacing: 1.2,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkText: {
    ...typography.bodySm,
    color: colors.text.muted,
    fontWeight: '700',
  },
  checkTextDone: {
    color: colors.text.white,
  },
  checklistLabel: {
    ...typography.bodySm,
    color: colors.text.secondary,
  },
  checklistLabelDone: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  checklistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.accent,
    marginTop: spacing.sm,
  },
  checklistButtonText: {
    ...typography.button,
    color: colors.text.white,
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
