import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  align?: 'left' | 'center';
};

export function AppHeader({ title, onBack, right, align = 'left' }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
            <ChevronLeft size={22} color={colors.text.primary} />
          </Pressable>
        ) : null}
      </View>
      <Text
        style={[styles.title, align === 'center' && styles.centeredTitle]}
        numberOfLines={1}
      >
        {title ?? ''}
      </Text>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    gap: spacing.sm,
  },
  side: {
    width: 40,
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  title: {
    ...typography.h3,
    flex: 1,
  },
  centeredTitle: {
    textAlign: 'center',
  },
});
