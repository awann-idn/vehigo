import React from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Car, Fuel, Settings2, ShieldCheck, Star, Users } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatRupiah } from '../../lib/formatters';
import { useVehicle, useVehiclePhotos } from '../../hooks/useVehicles';
import { useReviews } from '../../hooks/useReviews';

type Props = NativeStackScreenProps<RootStackParamList, 'VehicleDetail'>;

export default function VehicleDetailScreen({ navigation, route }: Props) {
  const { data: vehicle, isLoading } = useVehicle(route.params.id);
  const { data: photos = [] } = useVehiclePhotos(route.params.id);
  const { data: reviews = [] } = useReviews('vehicle', route.params.id);

  if (isLoading || !vehicle) {
    return (
      <Screen>
        <AppHeader title="Detail Kendaraan" onBack={() => navigation.goBack()} />
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <AppHeader title="Detail Kendaraan" onBack={() => navigation.goBack()} />

      <View style={[styles.hero, { backgroundColor: vehicle.tint }]}>
        {photos.length > 0 ? (
          <FlatList data={photos.filter((photo) => photo.url)} horizontal pagingEnabled showsHorizontalScrollIndicator={false} keyExtractor={(photo) => photo.id} renderItem={({ item }) => <Image source={{ uri: item.url ?? undefined }} style={styles.heroImage} />} />
        ) : <Car size={110} color={colors.primary} strokeWidth={1.2} />}
        <View style={styles.heroBadge}>
          <ShieldCheck size={14} color={colors.text.white} />
          <Text style={styles.heroBadgeText}>Verified</Text>
        </View>
      </View>

      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <Text style={styles.name}>{vehicle.name}</Text>
          <Text style={styles.meta}>
            {vehicle.transmission} • {vehicle.seats} kursi • {vehicle.year}
          </Text>
        </View>
        <View style={styles.rating}>
          <Star size={13} color={colors.secondary} />
          <Text style={styles.ratingText}>{vehicle.rating ? vehicle.rating.toFixed(1) : '-'}</Text>
        </View>
      </View>

      <Text style={styles.description}>
        Nikmati kenyamanan berkendara dengan {vehicle.name} terbaru. Kendaraan dalam kondisi
        prima, lengkap dengan fitur 360° untuk memastikan kondisi unit sebelum penyewaan.
      </Text>

      <Card style={styles.specs}>
        <Spec icon={Settings2} label="Transmisi" value={vehicle.transmission} />
        <Spec icon={Users} label="Kapasitas" value={`${vehicle.seats} kursi`} />
        <Spec icon={Fuel} label="Bahan Bakar" value="Bensin" />
        <Spec icon={ShieldCheck} label="Deposit" value="Rp 500rb" />
      </Card>

      <Pressable
        style={styles.mitraCard}
        onPress={() => vehicle.mitraId && navigation.navigate('MitraProfile', { id: vehicle.mitraId })}
      >
        <View style={styles.mitraAvatar}>
          <Car size={22} color={colors.primary} />
        </View>
        <View style={styles.mitraText}>
          <Text style={styles.mitraName}>{vehicle.mitra}</Text>
          <Text style={styles.mitraMeta}>{vehicle.location || 'Lokasi belum tersedia'}</Text>
        </View>
        <Text style={styles.mitraLink}>Lihat</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ulasan Terbaru</Text>
        <Pressable onPress={() => navigation.navigate('Reviews')}>
          <Text style={styles.sectionLink}>Lihat semua</Text>
        </Pressable>
      </View>

      {reviews.slice(0, 2).map((review) => (
        <View key={review.id} style={styles.review}>
          <View style={styles.reviewTop}>
            <Text style={styles.reviewAuthor}>{review.author}</Text>
            <View style={styles.rating}>
              <Star size={11} color={colors.secondary} />
              <Text style={styles.ratingText}>{review.rating}</Text>
            </View>
          </View>
          <Text style={styles.reviewBody}>{review.body}</Text>
        </View>
      ))}
      {reviews.length === 0 && <Text style={styles.reviewBody}>Belum ada ulasan untuk kendaraan ini.</Text>}

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Harga sewa</Text>
          <Text style={styles.price}>{formatRupiah(vehicle.pricePerDay)}/hari</Text>
        </View>
        <PrimaryButton
          label="Pesan Sekarang"
          style={styles.cta}
          onPress={() => navigation.navigate('DatePicker', { vehicleId: vehicle.id })}
        />
      </View>
    </Screen>
  );
}

function Spec({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.spec}>
      <Icon size={18} color={colors.primary} />
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 200,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  heroImage: {
    width: 340,
    height: 200,
    resizeMode: 'cover',
  },
  heroBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  heroBadgeText: {
    ...typography.caption,
    color: colors.text.white,
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.h3,
  },
  meta: {
    ...typography.caption,
    color: colors.text.muted,
  },
  rating: {
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
  description: {
    ...typography.bodySm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    lineHeight: 19,
  },
  specs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
    backgroundColor: colors.surface,
    marginTop: spacing.base,
  },
  spec: {
    width: '44%',
    gap: 2,
  },
  specLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 4,
  },
  specValue: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  mitraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.base,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  mitraAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mitraText: {
    flex: 1,
    gap: 2,
  },
  mitraName: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  mitraMeta: {
    ...typography.caption,
    color: colors.text.muted,
  },
  mitraLink: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.secondary,
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
  sectionLink: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.secondary,
  },
  review: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 4,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewAuthor: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  reviewBody: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.base,
    marginTop: spacing.lg,
    padding: spacing.base,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
  price: {
    ...typography.h3,
  },
  cta: {
    flex: 1,
  },
});
