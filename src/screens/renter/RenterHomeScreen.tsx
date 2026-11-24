import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bell, CalendarDays, Car, MapPin, Search, ShieldCheck, Star } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatRupiah } from '../../lib/formatters';
import { useVehicles } from '../../hooks/useVehicles';
import { useMitras } from '../../hooks/useMitras';
import { useAuth } from '../../features/auth/useAuth';
import { useUnreadNotificationsCount } from '../../hooks/useNotifications';

type Props = NativeStackScreenProps<RootStackParamList, 'RenterApp'>;

export default function RenterHomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { data: vehicles = [], isLoading, isError } = useVehicles();
  const { data: mitras = [] } = useMitras();
  const unreadCount = useUnreadNotificationsCount(user?.id);

  return (
    <Screen scroll>
      <View style={styles.topBar}>
        <View style={styles.locationBlock}>
          <Text style={styles.greeting}>Mau jalan ke mana?</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color={colors.primary} />
            <Text style={styles.location}>Palembang, ID</Text>
          </View>
        </View>
        <Pressable style={styles.bell} onPress={() => navigation.navigate('Notifikasi' as never)}>
          <Bell size={20} color={colors.primary} />
          {unreadCount > 0 ? <View style={styles.dot} /> : null}
        </Pressable>
      </View>

      <Pressable style={styles.searchBar} onPress={() => navigation.navigate('SearchResults')}>
        <Search size={18} color={colors.text.muted} />
        <Text style={styles.searchText}>Cari mobil atau motor...</Text>
      </Pressable>

        <Pressable style={styles.dateCard} onPress={() => navigation.navigate('SearchResults')}>
        <View style={styles.dateCol}>
          <Text style={styles.dateLabel}>MULAI</Text>
          <Text style={styles.dateValue}>Pilih tanggal</Text>
        </View>
        <CalendarDays size={18} color={colors.text.muted} />
        <View style={styles.dateCol}>
          <Text style={styles.dateLabel}>SELESAI</Text>
          <Text style={styles.dateValue}>Pilih tanggal</Text>
        </View>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Mitra</Text>
        <Text style={styles.sectionLink}>Lihat semua</Text>
      </View>
      <View style={styles.mitraRow}>
        {mitras.slice(0, 3).map((mitra) => (
          <Pressable
            key={mitra.id}
            style={styles.mitraCard}
            onPress={() => navigation.navigate('MitraProfile', { id: mitra.id })}
          >
            <View style={styles.mitraAvatar}>
              <Car size={22} color={colors.primary} />
            </View>
            <Text style={styles.mitraName} numberOfLines={1}>
              {mitra.name}
            </Text>
            <View style={styles.mitraMeta}>
              <Star size={12} color={colors.secondary} />
              <Text style={styles.mitraMetaText}>
                {mitra.rating} • {mitra.distance}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Card style={styles.promo}>
        <ShieldCheck size={26} color={colors.text.white} />
        <View style={styles.promoText}>
          <Text style={styles.promoTitle}>Semua transaksi terlindungi</Text>
          <Text style={styles.promoBody}>Asuransi & verifikasi mitra di setiap pesanan.</Text>
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Rekomendasi Kendaraan</Text>
        <Text style={styles.sectionLink}>Populer</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : isError ? (
        <Text style={styles.errorText}>Kendaraan belum dapat dimuat. Coba lagi nanti.</Text>
      ) : (
        vehicles.map((vehicle) => (
          <Pressable
            key={vehicle.id}
            style={styles.vehicleCard}
            onPress={() => navigation.navigate('VehicleDetail', { id: vehicle.id })}
          >
            <View style={[styles.vehicleThumb, { backgroundColor: vehicle.tint }]}>
              <Car size={30} color={colors.primary} />
            </View>
            <View style={styles.vehicleText}>
              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <Text style={styles.vehicleMeta}>
                {vehicle.transmission} • {vehicle.seats} kursi
              </Text>
              <Text style={styles.vehiclePrice}>{formatRupiah(vehicle.pricePerDay)}/hari</Text>
            </View>
            <View style={styles.ratingPill}>
              <Star size={11} color={colors.secondary} />
              <Text style={styles.ratingText}>{vehicle.rating}</Text>
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: colors.text.muted,
    ...typography.bodySm,
    marginTop: spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.base,
  },
  locationBlock: {
    gap: 4,
  },
  greeting: {
    ...typography.h2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    ...typography.bodySm,
    color: colors.text.muted,
  },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
  },
  searchText: {
    ...typography.bodySm,
    color: colors.text.muted,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    padding: spacing.base,
    borderRadius: 14,
    backgroundColor: colors.card,
  },
  dateCol: {
    gap: 2,
  },
  dateLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  dateValue: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
  },
  sectionLink: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.secondary,
  },
  mitraRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  mitraCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.stroke,
    gap: 6,
  },
  mitraAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mitraName: {
    ...typography.caption,
    fontWeight: '700',
  },
  mitraMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  mitraMetaText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    marginTop: spacing.lg,
  },
  promoText: {
    flex: 1,
    gap: 2,
  },
  promoTitle: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.text.white,
  },
  promoBody: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.stroke,
    marginBottom: spacing.md,
  },
  vehicleThumb: {
    width: 72,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleText: {
    flex: 1,
    gap: 2,
  },
  vehicleName: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  vehicleMeta: {
    ...typography.caption,
    color: colors.text.muted,
  },
  vehiclePrice: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: 2,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.card,
  },
  ratingText: {
    ...typography.caption,
    fontWeight: '700',
  },
});
