import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Car, Search, SlidersHorizontal, Star } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { TextField } from '../../components/TextField';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatRupiah, vehicles } from '../../data/mock';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchResults'>;

const filters = ['Semua', 'Matic', 'Manual', '7 Kursi', 'Hemat'];

export default function SearchResultsScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Semua');

  const data = useMemo(
    () =>
      vehicles.filter((vehicle) => {
        const matchesQuery =
          vehicle.name.toLowerCase().includes(query.toLowerCase()) ||
          vehicle.mitra.toLowerCase().includes(query.toLowerCase());
        const matchesFilter =
          filter === 'Semua' ||
          (filter === 'Matic' && vehicle.transmission === 'Matic') ||
          (filter === 'Manual' && vehicle.transmission === 'Manual') ||
          (filter === '7 Kursi' && vehicle.seats === 7) ||
          (filter === 'Hemat' && vehicle.pricePerDay <= 400000);
        return matchesQuery && matchesFilter;
      }),
    [filter, query]
  );

  return (
    <Screen scroll>
      <AppHeader title="Cari Kendaraan" onBack={() => navigation.goBack()} />

      <TextField
        icon={Search}
        placeholder="Cari kendaraan di Palembang..."
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.filterRow}>
        <SlidersHorizontal size={16} color={colors.text.muted} />
        <View style={styles.filterTabs}>
          <SegmentedTabs options={filters} value={filter} onChange={setFilter} />
        </View>
      </View>

      <Text style={styles.count}>{data.length} kendaraan ditemukan</Text>

      {data.length === 0 ? (
        <EmptyState icon={Car} title="Tidak ditemukan" message="Coba kata kunci atau filter lain." />
      ) : (
        data.map((vehicle) => (
          <Pressable
            key={vehicle.id}
            style={styles.card}
            onPress={() => navigation.navigate('VehicleDetail', { id: vehicle.id })}
          >
            <View style={[styles.thumb, { backgroundColor: vehicle.tint }]}>
              <Car size={34} color={colors.primary} />
            </View>
            <View style={styles.text}>
              <Text style={styles.name}>{vehicle.name}</Text>
              <Text style={styles.meta}>
                {vehicle.mitra} • {vehicle.location}
              </Text>
              <Text style={styles.meta}>
                {vehicle.transmission} • {vehicle.seats} kursi
              </Text>
              <Text style={styles.price}>{formatRupiah(vehicle.pricePerDay)}/hari</Text>
            </View>
            <View style={styles.rating}>
              <Star size={12} color={colors.secondary} />
              <Text style={styles.ratingText}>{vehicle.rating}</Text>
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  filterTabs: {
    flex: 1,
  },
  count: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
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
  thumb: {
    width: 72,
    height: 70,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 1,
  },
  name: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  meta: {
    ...typography.caption,
    color: colors.text.muted,
  },
  price: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: 2,
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
});
