import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Eye, EyeOff, LucideIcon } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = TextInputProps & {
  label?: string;
  icon?: LucideIcon;
  error?: string;
};

export function TextField({ label, icon: Icon, error, secureTextEntry, style, ...rest }: Props) {
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, focused && styles.fieldFocused, !!error && styles.fieldError]}>
        {Icon ? (
          <View style={styles.iconBadge}>
            <Icon size={22} color={colors.primary} strokeWidth={1.8} />
          </View>
        ) : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="rgba(48,54,79,0.4)"
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={10} style={styles.eye}>
            {hidden ? (
              <EyeOff size={20} color={colors.primary} />
            ) : (
              <Eye size={20} color={colors.primary} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    ...typography.body,
    color: '#000000',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.18)',
    borderRadius: 12,
    backgroundColor: '#F6F3F5',
    paddingHorizontal: 7,
    gap: spacing.sm,
  },
  fieldFocused: {
    borderColor: colors.primary,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3E4D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    paddingRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.md,
    color: colors.primary,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
});
