import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertTriangle, Camera, CheckCircle2, Wrench } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Stepper } from '../../components/Stepper';
import { Card } from '../../components/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Inspection'>;

const angles = ['Sisi depan', 'Sisi belakang', 'Interior', 'Sisi kanan', 'Sisi kiri'];
const findings = [
  { label: 'Bahan bakar', value: 'Sesuai', ok: true },
  { label: 'Kebersihan', value: 'Sesuai', ok: true },
  { label: 'Body & cat', value: 'Lecet halus 2 titik', ok: false },
  { label: 'Ban & interior', value: 'Sesuai', ok: true },
];

export default function InspectionScreen({ navigation, route }: Props) {
  const [step, setStep] = useState(1);
  const [approved, setApproved] = useState(false);

  const next = () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    navigation.replace('Rating', { id: route.params.id });
  };

  return (
    <Screen scroll>
      <AppHeader title={`Langkah ${step} dari 3`} onBack={() => (step === 1 ? navigation.goBack() : setStep(step - 1))} />
      <Stepper current={step} total={3} labelLeft="PENGECEKAN KONDISI" />

      {step === 1 ? (
        <View style={styles.body}>
          <Text style={styles.heading}>Cek Kondisi Kendaraan</Text>
          <Text style={styles.subtitle}>
            AI akan membandingkan kondisi saat ini dengan data awal untuk memastikan kesesuaian unit.
          </Text>
          <Text style={styles.progress}>2/5 foto terisi</Text>
          <View style={styles.photos}>
            {angles.map((angle) => (
              <Pressable key={angle} style={styles.photo}>
                <Camera size={20} color={colors.primary} />
                <Text style={styles.photoText}>{angle}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.body}>
          <Text style={styles.heading}>Pemeriksaan Selesai</Text>
          <Text style={styles.subtitle}>
            Berikut laporan rincian akhir mengenai bahan bakar, kebersihan, dan kondisi fisik kendaraan.
          </Text>
          <Card style={styles.findings}>
            {findings.map((item) => (
              <View key={item.label} style={styles.findingRow}>
                {item.ok ? (
                  <CheckCircle2 size={18} color={colors.success} />
                ) : (
                  <Wrench size={18} color={colors.warning} />
                )}
                <Text style={styles.findingLabel}>{item.label}</Text>
                <Text style={[styles.findingValue, !item.ok && styles.findingWarning]}>
                  {item.value}
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.findingRow}>
              <AlertTriangle size={18} color={colors.warning} />
              <Text style={styles.findingLabel}>Denda Kerusakan & Lecet</Text>
              <Text style={styles.findingWarning}>Rp 150.000</Text>
            </View>
          </Card>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.body}>
          <Text style={styles.heading}>Konfirmasi Hasil Pemeriksaan</Text>
          <Text style={styles.subtitle}>
            Jika Anda merasa hasil analisis AI tidak sesuai dengan kondisi asli, silakan hubungi mitra.
          </Text>
          <Card style={styles.total}>
            <Text style={styles.totalLabel}>TOTAL PEMBAYARAN</Text>
            <Text style={styles.totalValue}>Rp 150.000</Text>
          </Card>
          <Pressable style={styles.agree} onPress={() => setApproved((v) => !v)}>
            <View style={[styles.checkbox, approved && styles.checkboxActive]}>
              {approved ? <CheckCircle2 size={14} color={colors.text.white} /> : null}
            </View>
            <Text style={styles.agreeText}>
              Dengan menekan Setuju, Anda menyetujui rincian biaya yang telah ditetapkan oleh sistem.
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.footer}>
        <PrimaryButton
          label={step === 3 ? 'Setuju & Selesai' : 'Lanjutkan'}
          disabled={step === 3 && !approved}
          onPress={next}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    marginTop: spacing.base,
    gap: spacing.sm,
  },
  heading: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.text.secondary,
  },
  progress: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
  photos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  photo: {
    width: '47%',
    height: 88,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
  },
  photoText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  findings: {
    marginTop: spacing.base,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  findingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  findingLabel: {
    ...typography.bodySm,
    flex: 1,
    color: colors.text.secondary,
  },
  findingValue: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.success,
  },
  findingWarning: {
    color: colors.warning,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  total: {
    marginTop: spacing.base,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    gap: 2,
  },
  totalLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.6,
  },
  totalValue: {
    ...typography.h2,
    color: colors.text.white,
  },
  agree: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.base,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  agreeText: {
    ...typography.caption,
    flex: 1,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  footer: {
    marginTop: spacing.lg,
  },
});
