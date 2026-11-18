import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Tone = 'neutral' | 'warning' | 'success' | 'danger';

type Props = {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
};

const tones: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.card, fg: colors.text.secondary },
  warning: { bg: 'rgba(176, 122, 30, 0.12)', fg: colors.warning },
  success: { bg: 'rgba(31, 122, 77, 0.12)', fg: colors.success },
  danger: { bg: 'rgba(180, 35, 24, 0.12)', fg: colors.danger },
};

export function StatusBadge({ label, tone = 'neutral', style }: Props) {
  const palette = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }, style]}>
      <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
