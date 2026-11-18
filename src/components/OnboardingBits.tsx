import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  onSkip: () => void;
  showBack?: boolean;
  onBack?: () => void;
};

export function OnboardingHeader({ onSkip, showBack, onBack }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable onPress={onBack} hitSlop={10}>
            <ChevronLeft size={22} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.logoRow}>
        <View style={styles.logoDot} />
        <Text style={styles.brand}>VEHIGO</Text>
      </View>
      <Pressable onPress={onSkip} hitSlop={10} style={styles.side}>
        <Text style={styles.skip}>Lewati</Text>
      </Pressable>
    </View>
  );
}

export function PageDots({ total, active }: { total: number; active: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, index) => (
        <View key={index} style={[styles.dot, index === active && styles.dotActive]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  side: {
    width: 60,
    alignItems: 'flex-end',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoDot: {
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  brand: {
    ...typography.bodySm,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.primary,
  },
  skip: {
    ...typography.bodySm,
    color: colors.text.secondary,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.primary,
  },
});
