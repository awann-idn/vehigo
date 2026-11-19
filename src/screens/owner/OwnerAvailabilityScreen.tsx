import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import {
  useToggleVehicleDate,
  useUnavailableDates,
  useVehicleBlocks,
} from '../../hooks/useAvailability';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerAvailability'>;

const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

export default function OwnerAvailabilityScreen({ navigation, route }: Props) {
  const vehicleId = route.params.id;
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const monthStart = isoDate(new Date(year, monthIndex, 1));
  const monthEnd = isoDate(new Date(year, monthIndex + 1, 0));

  const { data: blocks = [], isLoading: blocksLoading } = useVehicleBlocks(
    vehicleId,
    monthStart,
    monthEnd
  );
  const { data: unavailable = [], isLoading: unavailableLoading } = useUnavailableDates(
    vehicleId,
    monthStart,
    monthEnd
  );
  const toggle = useToggleVehicleDate(vehicleId);

  const blockedSet = useMemo(() => new Set(blocks), [blocks]);
  const orderSet = useMemo(
    () => new Set(unavailable.filter((date) => !blockedSet.has(date))),
    [unavailable, blockedSet]
  );

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, index) =>
    index < firstDay ? null : index - firstDay + 1
  );

  const isLoading = blocksLoading || unavailableLoading;

  const onToggle = (date: string) => {
    if (date < isoDate(today)) return;
    if (orderSet.has(date)) {
      Alert.alert('Tanggal sudah dipesan', 'Tanggal ini terikat pada pesanan aktif dan tidak dapat diblokir.');
      return;
    }
    toggle.mutate(
      { date, blocked: !blockedSet.has(date) },
      {
        onError: (error) => Alert.alert('Gagal memperbarui', error.message),
      }
    );
  };

  return (
    <Screen scroll>
      <AppHeader title="Kelola Tanggal" onBack={() => navigation.goBack()} />
      <Text style={styles.subtitle}>
        Blokir tanggal saat kendaraan tidak dapat disewakan. Tanggal yang sudah dipesan penyewa
        ditampilkan terpisah.
      </Text>

      <View style={styles.monthHeader}>
        <Pressable onPress={() => setMonth(new Date(year, monthIndex - 1, 1))} hitSlop={10}>
          <ChevronLeft size={20} color={colors.primary} />
        </Pressable>
        <Text style={styles.monthLabel}>
          {month.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </Text>
        <Pressable onPress={() => setMonth(new Date(year, monthIndex + 1, 1))} hitSlop={10}>
          <ChevronRight size={20} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {weekdays.map((day) => (
          <Text key={day} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : (
        <View style={styles.grid}>
          {cells.map((day, index) => {
            if (!day) return <View key={`empty-${index}`} style={styles.cell} />;
            const date = isoDate(new Date(year, monthIndex, day));
            const isPast = date < isoDate(today);
            const isBlocked = blockedSet.has(date);
            const isOrdered = orderSet.has(date);
            return (
              <Pressable
                key={date}
                style={[
                  styles.cell,
                  styles.day,
                  isBlocked && styles.blocked,
                  isOrdered && styles.ordered,
                  isPast && styles.past,
                ]}
                onPress={() => onToggle(date)}
                disabled={isPast || isOrdered || toggle.isPending}
              >
                <Text
                  style={[
                    styles.dayText,
                    isBlocked && styles.blockedText,
                    isOrdered && styles.orderedText,
                    isPast && styles.pastText,
                  ]}
                >
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.surface }]} />
          <Text style={styles.legendText}>Tersedia</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Diblokir</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <Text style={styles.legendText}>Sudah dipesan</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.bodySm,
    color: colors.text.secondary,
    marginBottom: spacing.base,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  monthLabel: {
    ...typography.body,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    ...typography.caption,
    color: colors.text.muted,
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  day: {
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blocked: {
    backgroundColor: colors.primary,
  },
  ordered: {
    backgroundColor: colors.border,
  },
  past: {
    backgroundColor: 'transparent',
  },
  dayText: {
    ...typography.bodySm,
    fontWeight: '600',
  },
  blockedText: {
    color: colors.text.white,
  },
  orderedText: {
    color: colors.text.muted,
  },
  pastText: {
    color: colors.text.muted,
    opacity: 0.4,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
    marginTop: spacing.base,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
