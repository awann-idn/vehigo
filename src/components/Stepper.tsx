import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  current: number;
  total: number;
  labelLeft?: string;
  labelRight?: string;
};

export function Stepper({ current, total, labelLeft, labelRight }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <Text style={styles.label}>{labelLeft ?? ''}</Text>
        <Text style={styles.step}>
          {labelRight ?? `LANGKAH ${current} DARI ${total}`}
        </Text>
      </View>
      <View style={styles.track}>
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            style={[styles.segment, index < current && styles.segmentActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  step: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  track: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
});
