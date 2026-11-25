import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleHelp, ChevronLeft } from 'lucide-react-native';
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

const SUPPORT_WHATSAPP = 'https://wa.me/6281200000000';

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
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
          <ChevronLeft size={20} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Mitra Kami</Text>
        <Pressable onPress={() => Linking.openURL(SUPPORT_WHATSAPP)} hitSlop={12}>
          <CircleHelp size={20} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Stepper current={step} total={total} labelLeft={getStepLabel(step)} />
        <View style={styles.editorial}>
          <Text style={styles.heading}>{heading}</Text>
          {subheading ? <Text style={styles.subheading}>{subheading}</Text> : null}
        </View>
        <View style={styles.body}>{children}</View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={nextLabel} onPress={onNext} style={styles.nextButton} />
        <Pressable onPress={() => Linking.openURL(SUPPORT_WHATSAPP)} style={styles.help}>
          <Text style={styles.helpText}>Mengalami kesulitan? </Text>
          <Text style={styles.helpLink}>Hubungi Kami</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function getStepLabel(step: number) {
  return ['VERIFIKASI IDENTITAS', 'LEGALITAS USAHA', 'INFORMASI USAHA', 'INFORMASI KONTAK', 'INFORMASI KEUANGAN'][step - 1];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: 72,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(252,248,251,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E2E4',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EDEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 18,
    flex: 1,
    marginLeft: spacing.md,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 170,
    gap: spacing.xl,
  },
  editorial: { gap: spacing.sm },
  heading: { ...typography.h2, color: colors.primary },
  subheading: { ...typography.bodySm, color: colors.text.secondary, lineHeight: 22 },
  body: { gap: spacing.base },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.base,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderTopWidth: 1,
    borderTopColor: '#E5E2E4',
  },
  nextButton: { borderRadius: 12 },
  help: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  helpText: { ...typography.caption, color: colors.text.secondary },
  helpLink: { ...typography.caption, fontFamily: 'Manrope_800ExtraBold', color: colors.secondary },
});
