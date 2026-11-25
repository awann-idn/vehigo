import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  title: string;
  message?: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, message, icon: Icon, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon size={26} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable style={styles.action} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
  },
  message: {
    ...typography.bodySm,
    color: colors.text.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  action: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.secondaryButton,
  },
  actionText: {
    ...typography.bodySm,
    fontFamily: 'Manrope_700Bold',
    color: colors.primary,
  },
});
