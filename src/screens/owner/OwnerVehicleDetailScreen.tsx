import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Car, Fuel, Gauge, Settings2, Users } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatRupiah, vehicles } from '../../data/mock';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerVehicleDetail'>;

export default function OwnerVehicleDetailScreen({ navigation, route }: Props) {
  const vehicle = vehicles.find((item) => item.id === route.params.id) ?? vehicles[0];

  return (
    <Screen scroll>
      <AppHeader title="Detail Kendaraan" onBack={() => navigation.goBack()} />

      <View style={[styles.hero, { backgroundColor: vehicle.tint }]}>
        <Car size={90} color={colors.primary} strokeWidth={1.3} />
      </View>

      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <Text style={styles.name}>{vehicle.name}</Text>
          <Text style={styles.plate}>{vehicle.plate}</Text>
        </View>
        <StatusBadge
          label={vehicle.status}
          tone={vehicle.status === 'Tersedia' ? 'success' : vehicle.status === 'Disewa' ? 'warning' : 'danger'}
        />
      </View>

      <Card style={styles.specs}>
        <Spec icon={Settings2} label="Transmisi" value={vehicle.transmission} />
        <Spec icon={Users} label="Kapasitas" value={`${vehicle.seats} kursi`} />
        <Spec icon={Fuel} label="Bahan Bakar" value="Bensin" />
        <Spec icon={Gauge} label="Tahun" value={`${vehicle.year}`} />
      </Card>

      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>HARGA SEWA</Text>
        <Text style={styles.price}>{formatRupiah(vehicle.pricePerDay)} / hari</Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Ubah Status" variant="secondary" onPress={() => {}} />
        <PrimaryButton label="Edit Kendaraan" onPress={() => {}} />
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
    height: 190,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  titleText: {
    gap: 2,
  },
  name: {
    ...typography.h3,
  },
  plate: {
    ...typography.caption,
    color: colors.text.muted,
  },
  specs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
    backgroundColor: colors.surface,
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
  priceCard: {
    marginTop: spacing.base,
    padding: spacing.base,
    borderRadius: 16,
    backgroundColor: colors.primary,
    gap: 2,
  },
  priceLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.6,
  },
  price: {
    ...typography.h3,
    color: colors.text.white,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
});
