import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  onSkip?: () => void;
  onBack?: () => void;
  showSkip?: boolean;
};

export function OnboardingHeader({ onSkip, onBack, showSkip = true }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
            <ChevronLeft size={20} color={colors.text.primary} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.spacer} />
      {showSkip && onSkip ? (
        <Pressable onPress={onSkip} hitSlop={12}>
          <Text style={styles.skip}>Lewati</Text>
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}
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

export function ShieldIllustration() {
  return (
    <Svg width={175} height={176} viewBox="0 0 175 176" fill="none">
      <Ellipse cx={87.5} cy={88} rx={87.5} ry={88} fill="#F0FFF5" />
      <Ellipse
        cx={87.5}
        cy={88}
        rx={85.5}
        ry={86}
        stroke="#38CB6E"
        strokeWidth={4}
      />
      <Path
        d="M87.5 46 L120 59 V86 C120 106 105 120 87.5 128 C70 120 55 106 55 86 V59 Z"
        stroke="#22C55E"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M72 84 L82.8 94.3 L105 73"
        stroke="#6D5D36"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  side: {
    width: 40,
    alignItems: 'flex-start',
  },
  spacer: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EDEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skip: {
    ...typography.h3,
    fontFamily: 'Manrope_400Regular',
    fontSize: 18,
    color: colors.secondary,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#C9CBD3',
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
});
