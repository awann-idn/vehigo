import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Car, Plus, Search } from 'lucide-react-native';
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
import { useVehicles } from '../../hooks/useVehicles';
import { useAuth } from '../../features/auth/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerApp'>;

const tabs = ['Semua', 'Tersedia', 'Disewa', 'Maintenance'];

export default function OwnerFleetScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('Semua');
  const { user } = useAuth();

  const { data: vehicles = [], isLoading, isError } = useVehicles(user?.id);

  const data = useMemo(
    () =>
      vehicles.filter(
        (vehicle) =>
          (tab === 'Semua' || vehicle.status === tab) &&
          vehicle.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query, tab, vehicles]
  );

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Armada Saya</Text>
        <Text style={styles.subtitle}>Kelola kendaraan rental Anda dengan mudah</Text>
      </View>

      <TextField icon={Search} placeholder="Cari kendaraan..." value={query} onChangeText={setQuery} />

      <View style={styles.tabs}>
        <SegmentedTabs options={tabs} value={tab} onChange={setTab} />
      </View>

      <Pressable style={styles.addButton} onPress={() => navigation.navigate('OwnerAddVehicle')}>
        <Plus size={18} color={colors.text.white} />
        <Text style={styles.addText}>TAMBAH KENDARAAN</Text>
      </Pressable>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : isError ? (
        <EmptyState icon={Car} title="Kendaraan belum tersedia" message="Data belum dapat dimuat. Coba lagi nanti." />
      ) : data.length === 0 ? (
        <EmptyState icon={Car} title="Tidak ada kendaraan" message="Tambahkan kendaraan pertama Anda." />
      ) : (
        <View style={styles.list}>
          {data.map((vehicle) => (
            <Pressable
              key={vehicle.id}
              style={styles.card}
              onPress={() => navigation.navigate('OwnerVehicleDetail', { id: vehicle.id })}
            >
              <View style={[styles.thumb, { backgroundColor: vehicle.tint }]}>
                <Car size={34} color={colors.primary} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.name}>{vehicle.name}</Text>
                <Text style={styles.plate}>{vehicle.plate}</Text>
                <Text style={styles.price}>{formatRupiah(vehicle.pricePerDay)}/hari</Text>
              </View>
              <StatusBadge
                label={vehicle.status}
                tone={
                  vehicle.status === 'Tersedia'
                    ? 'success'
                    : vehicle.status === 'Disewa'
                      ? 'warning'
                      : 'danger'
                }
              />
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    marginTop: spacing.base,
  },
  addText: {
    ...typography.button,
    color: colors.text.white,
  },
  list: {
    gap: spacing.md,
    marginTop: spacing.base,
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
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 1,
  },
  name: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  plate: {
    ...typography.caption,
    color: colors.text.muted,
  },
  price: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: 2,
  },
});
