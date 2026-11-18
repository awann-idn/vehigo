import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LifeBuoy } from 'lucide-react-native';
import { AppHeader } from '../../../components/AppHeader';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { Stepper } from '../../../components/Stepper';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';

type Props = {
  step: number;
  total?: number;
  heading: string;
  subheading?: string;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  children: React.ReactNode;
};

export function RegistrationLayout({
  step,
  total = 5,
  heading,
  subheading,
  onBack,
  onNext,
  nextLabel = 'Lanjutkan',
  children,
}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Mitra Kami" onBack={onBack} />
      <View style={styles.stepper}>
        <Stepper current={step} total={total} labelLeft="REGISTRASI MITRA" />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>{heading}</Text>
        {subheading ? <Text style={styles.subheading}>{subheading}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={nextLabel} onPress={onNext} />
        <Pressable style={styles.help}>
          <LifeBuoy size={14} color={colors.text.muted} />
          <Text style={styles.helpText}>Mengalami kesulitan? Hubungi Kami</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  stepper: {
    paddingBottom: spacing.base,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  heading: {
    ...typography.h2,
  },
  subheading: {
    ...typography.bodySm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  body: {
    gap: spacing.base,
    marginTop: spacing.sm,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  help: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  helpText: {
    ...typography.caption,
    color: colors.text.muted,
  },
});
