import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarDays } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useUnavailableDates } from '../../hooks/useAvailability';

type Props = NativeStackScreenProps<RootStackParamList, 'DatePicker'>;

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateLabel(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function DatePickerScreen({ navigation, route }: Props) {
  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const monthStart = isoDate(new Date(year, monthIndex, 1));
  const monthEnd = isoDate(new Date(year, monthIndex + 1, 0));
  const { data: unavailableDates = [], isLoading, isError, refetch } = useUnavailableDates(
    route.params?.vehicleId ?? '', monthStart, monthEnd
  );
  const unavailable = useMemo(() => new Set(unavailableDates), [unavailableDates]);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, index) =>
    index < firstDay ? null : index - firstDay + 1
  );
  const changeMonth = (offset: number) => {
    setMonth(new Date(year, monthIndex + offset, 1));
    setStartDate(null);
    setEndDate(null);
  };

  const chooseDay = (day: number) => {
    const value = isoDate(new Date(year, monthIndex, day));
    if (value < isoDate(today) || unavailable.has(value)) return;
    if (!startDate || (startDate && endDate)) {
      setStartDate(value);
      setEndDate(null);
      return;
    }
    if (value <= startDate) {
      setStartDate(value);
      return;
    }
    const rangeHasUnavailable = unavailableDates.some((blocked) => blocked > startDate && blocked <= value);
    if (rangeHasUnavailable) {
      Alert.alert('Tanggal tidak tersedia', 'Rentang yang dipilih melewati tanggal yang sudah dipesan atau diblokir.');
      return;
    }
    setEndDate(value);
  };

  const apply = () => {
    if (!route.params?.vehicleId) {
      Alert.alert('Pilih kendaraan dulu', 'Buka kalender dari detail kendaraan.');
      return;
    }
    if (isError) {
      Alert.alert('Availability gagal dimuat', 'Data kalender belum bisa dibaca dari Supabase. Coba lagi.');
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert('Pilih periode', 'Pilih tanggal mulai dan tanggal selesai.');
      return;
    }
    navigation.navigate('BookingCheckout', { vehicleId: route.params.vehicleId, startDate, endDate });
  };

  return (
    <Screen scroll>
      <AppHeader title="Pilih Tanggal" onBack={() => navigation.goBack()} />
      <Text style={styles.subtitle}>Pilih tanggal yang masih tersedia untuk kendaraan ini.</Text>
      <View style={styles.monthCard}>
        <Pressable onPress={() => changeMonth(-1)} disabled={monthStart <= isoDate(new Date(today.getFullYear(), today.getMonth(), 1))} hitSlop={12}><Text style={styles.arrow}>‹</Text></Pressable>
        <CalendarDays size={16} color={colors.primary} />
        <Text style={styles.month}>{month.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</Text>
        <Pressable onPress={() => changeMonth(1)} hitSlop={12}><Text style={styles.arrow}>›</Text></Pressable>
      </View>
      <View style={styles.weekRow}>{['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekDay}>{day}</Text>)}</View>
      {isLoading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : (
        <View style={styles.grid}>{cells.map((day, index) => {
          if (!day) return <View key={`empty-${index}`} style={styles.day} />;
          const value = isoDate(new Date(year, monthIndex, day));
          const blocked = value < isoDate(today) || unavailable.has(value);
          const selected = !!startDate && value >= startDate && !!endDate && value <= endDate;
          const endpoint = value === startDate || value === endDate;
          return <Pressable key={value} disabled={blocked} style={[styles.day, selected && styles.dayActive, endpoint && styles.dayEndpoint, blocked && styles.dayUnavailable]} onPress={() => chooseDay(day)}>
            <Text style={[styles.dayText, selected && styles.dayTextActive, blocked && styles.dayTextUnavailable]}>{day}</Text>
          </Pressable>;
        })}</View>
      )}
      <Text style={styles.rule}>{isError ? 'Gagal mengambil availability dari Supabase.' : isLoading ? 'Memuat availability...' : startDate && endDate ? `${dateLabel(startDate)} – ${dateLabel(endDate)}` : 'Tanggal abu-abu tidak dapat dipilih.'}</Text>
      {isError && <PrimaryButton label="Coba lagi" variant="secondary" onPress={() => refetch()} />}
      <View style={styles.actions}><PrimaryButton label="Batal" variant="secondary" onPress={() => navigation.goBack()} /><PrimaryButton label="TERAPKAN" onPress={apply} disabled={isLoading || isError || !startDate || !endDate} /></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...typography.bodySm, color: colors.text.secondary, marginBottom: spacing.base },
  monthCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  month: { ...typography.bodySm, fontWeight: '700' },
  arrow: { ...typography.h2, color: colors.primary, lineHeight: 24 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.base, paddingHorizontal: spacing.sm },
  weekDay: { ...typography.caption, fontWeight: '700', color: colors.text.muted, width: 34, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm },
  day: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  dayActive: { backgroundColor: colors.primary },
  dayEndpoint: { borderWidth: 2, borderColor: colors.secondary },
  dayText: { ...typography.bodySm },
  dayTextActive: { color: colors.text.white, fontWeight: '700' },
  dayUnavailable: { backgroundColor: colors.surface, opacity: 0.45 },
  dayTextUnavailable: { color: colors.text.muted, textDecorationLine: 'line-through' },
  loading: { marginVertical: spacing.xl },
  rule: { ...typography.caption, color: colors.text.muted, marginTop: spacing.base },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
});
