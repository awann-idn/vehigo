import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera, CheckCircle2, FileCheck2, ScanFace, ShieldCheck } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerVerification'>;

const steps = [
  { icon: FileCheck2, title: 'Verifikasi KTP', body: 'Pastikan data sesuai identitas resmi.' },
  { icon: ScanFace, title: 'Verifikasi Wajah', body: 'Ambil selfie untuk mencocokkan dengan KTP.' },
  { icon: ShieldCheck, title: 'Verifikasi Nomor', body: 'Kode dikirim via WhatsApp.' },
];

export default function OwnerVerificationScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Keamanan Akun" onBack={() => navigation.goBack()} />

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <ShieldCheck size={48} color={colors.text.white} />
        </View>
        <Text style={styles.title}>Verifikasi Identitas</Text>
        <Text style={styles.subtitle}>
          Bantu kami memastikan identitas Anda aman dan terpercaya di platform Vehigo.
        </Text>
      </View>

      <View style={styles.list}>
        {steps.map(({ icon: Icon, title, body }) => (
          <Card key={title} style={styles.item}>
            <View style={styles.itemIcon}>
              <Icon size={20} color={colors.primary} />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>{title}</Text>
              <Text style={styles.itemBody}>{body}</Text>
            </View>
            <CheckCircle2 size={20} color={colors.success} />
          </Card>
        ))}
      </View>

      <View style={styles.uploadHint}>
        <Camera size={18} color={colors.text.muted} />
        <Text style={styles.uploadText}>
          Kamera akan terbuka untuk mengambil foto selfie dan KTP.
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Kirim Verifikasi"
          onPress={() => navigation.replace('OwnerApp')}
        />
        <Pressable style={styles.help}>
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
    paddingBottom: spacing.base,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.base,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.bodySm,
    textAlign: 'center',
    color: colors.text.secondary,
  },
  list: {
    gap: spacing.md,
    marginTop: spacing.base,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  itemBody: {
    ...typography.caption,
    color: colors.text.muted,
  },
  uploadHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  uploadText: {
    ...typography.caption,
    flex: 1,
    color: colors.text.muted,
  },
  footer: {
    marginTop: 'auto',
    gap: spacing.md,
  },
  help: {
    alignItems: 'center',
  },
  helpText: {
    ...typography.caption,
    color: colors.text.muted,
  },
});
