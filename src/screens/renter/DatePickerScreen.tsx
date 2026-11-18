import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarDays } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'DatePicker'>;

const days = Array.from({ length: 31 }, (_, index) => index + 1);

export default function DatePickerScreen({ navigation }: Props) {
  const [start, setStart] = useState(12);
  const [end, setEnd] = useState(15);

  return (
    <Screen scroll>
      <AppHeader title="Pilih Bulan & Tahun" onBack={() => navigation.goBack()} />

      <Text style={styles.subtitle}>Pilih periode waktu spesifik Anda</Text>

      <View style={styles.monthCard}>
        <CalendarDays size={16} color={colors.primary} />
        <Text style={styles.month}>Oktober 2026</Text>
      </View>

      <View style={styles.weekRow}>
        {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, index) => (
          <Text key={`${day}-${index}`} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day) => {
          const inRange = day >= start && day <= end;
          return (
            <Pressable
              key={day}
              style={[styles.day, inRange && styles.dayActive]}
              onPress={() => {
                if (day < start || end !== start + 3) {
                  setStart(day);
                  setEnd(day + 3 > 31 ? 31 : day + 3);
                } else {
                  setStart(day);
                  setEnd(day);
                }
              }}
            >
              <Text style={[styles.dayText, inRange && styles.dayTextActive]}>{day}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.rule}>
        Penyewaan minimum adalah 24 jam. Biaya lembur akan dikenakan secara proporsional.
      </Text>

      <View style={styles.actions}>
        <PrimaryButton label="Batal" variant="secondary" onPress={() => navigation.goBack()} />
        <PrimaryButton label="TERAPKAN" onPress={() => navigation.goBack()} />
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
  monthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  month: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.base,
    paddingHorizontal: spacing.sm,
  },
  weekDay: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.muted,
    width: 34,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  dayActive: {
    backgroundColor: colors.primary,
  },
  dayText: {
    ...typography.bodySm,
  },
  dayTextActive: {
    color: colors.text.white,
    fontWeight: '700',
  },
  rule: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.base,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
