import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Globe, MessageCircle } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function SocialAuthRow() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>ATAU MASUK DENGAN:</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.buttons}>
        <View style={styles.socialButton}>
          <Globe size={20} color={colors.primary} />
          <Text style={styles.socialLabel}>Google</Text>
        </View>
        <View style={styles.socialButton}>
          <MessageCircle size={20} color={colors.primary} />
          <Text style={styles.socialLabel}>Facebook</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  socialLabel: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.primary,
  },
});
