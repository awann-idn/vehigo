import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Car, Star } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Card } from '../../components/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useMitras } from '../../hooks/useMitras';
import { useVehicles } from '../../hooks/useVehicles';
import { useReviews } from '../../hooks/useReviews';

type Props = NativeStackScreenProps<RootStackParamList, 'MitraProfile'>;

export default function MitraProfileScreen({ navigation, route }: Props) {
  const { data: mitras = [], isLoading: loadingMitra } = useMitras();
  const { data: vehicles = [], isLoading: loadingVehicles } = useVehicles(route.params.id);
  const { data: reviews = [] } = useReviews('mitra', route.params.id);
  const mitra = mitras.find((item) => item.id === route.params.id);

  if (loadingMitra || loadingVehicles) {
    return <Screen><AppHeader title="Profil Mitra" onBack={() => navigation.goBack()} /><ActivityIndicator /></Screen>;
  }
  if (!mitra) {
    return <Screen><AppHeader title="Profil Mitra" onBack={() => navigation.goBack()} /><Text style={styles.meta}>Mitra tidak ditemukan.</Text></Screen>;
  }

  return (
    <Screen scroll>
      <AppHeader title="Profil Mitra" onBack={() => navigation.goBack()} />

      <Card style={styles.hero}>
        <View style={styles.avatar}>
          <Car size={28} color={colors.text.white} />
        </View>
        <Text style={styles.name}>{mitra.name}</Text>
        <View style={styles.metaRow}>
          <Star size={13} color={colors.secondary} />
          <Text style={styles.meta}>
            {mitra.rating} • {mitra.reviews} Reviews • {mitra.distance}
          </Text>
        </View>
      </Card>

      <View style={styles.stats}>
        <Stat label="Unit" value={`${mitra.units}`} />
        <Stat label="Pesanan" value={`${mitra.orders}`} />
        <Stat label="Pengalaman" value={`${mitra.years} Th.`} />
      </View>

      <Text style={styles.sectionTitle}>Unit Tersedia</Text>
      {vehicles.slice(0, 3).map((vehicle) => (
        <View key={vehicle.id} style={styles.unit}>
          <View style={[styles.unitThumb, { backgroundColor: vehicle.tint }]}>
            <Car size={24} color={colors.primary} />
          </View>
          <View style={styles.unitText}>
            <Text style={styles.unitName}>{vehicle.name}</Text>
            <Text style={styles.meta}>{vehicle.transmission} • {vehicle.seats} kursi</Text>
          </View>
        </View>
      ))}
      {vehicles.length === 0 && <Text style={styles.meta}>Belum ada unit tersedia.</Text>}

      <Text style={styles.sectionTitle}>Ulasan</Text>
      {reviews.slice(0, 2).map((review) => (
        <View key={review.id} style={styles.review}>
          <Text style={styles.reviewAuthor}>{review.author}</Text>
          <Text style={styles.meta}>{'★'.repeat(review.rating)}</Text>
          <Text style={styles.reviewBody}>{review.body}</Text>
        </View>
      ))}
      {reviews.length === 0 && <Text style={styles.meta}>Belum ada ulasan.</Text>}

      <View style={styles.note}>
        <Text style={styles.noteText}>
          Semua unit mitra ini telah diverifikasi oleh tim Vehigo.
        </Text>
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.h3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    ...typography.caption,
    color: colors.text.muted,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.base,
    padding: spacing.base,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  statValue: {
    ...typography.h3,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
  sectionTitle: {
    ...typography.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  unit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  unitThumb: {
    width: 52,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitText: {
    flex: 1,
    gap: 2,
  },
  unitName: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  review: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 2,
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
  note: {
    marginTop: spacing.lg,
    padding: spacing.base,
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  noteText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
