import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { useAuth } from '../../features/auth/useAuth';
import { pickAndCompressImage, uploadDocument } from '../../lib/storage';
import { saveInspection } from '../../api/inspections';

type Props = NativeStackScreenProps<RootStackParamList, 'Inspection'>;

const angles = ['Sisi depan', 'Sisi belakang', 'Interior', 'Sisi kanan', 'Sisi kiri'];

export default function InspectionScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [approved, setApproved] = useState(false);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const capture = async (angle: string) => {
    try {
      const uri = await pickAndCompressImage([4, 3]);
      if (uri) {
        setPhotos((prev) => ({ ...prev, [angle]: uri }));
      }
    } catch (error) {
      Alert.alert('Gagal memilih foto', error instanceof Error ? error.message : 'Coba lagi.');
    }
  };

  const next = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setUploading(true);
    try {
      if (user) {
        const uploads = await Promise.all(
          Object.values(photos).map((uri) => uploadDocument(user.id, 'vehicle', uri))
        );
        await saveInspection({
          orderId: route.params.id,
          photos: uploads.map((upload) => upload.path),
          findings: angles.map((angle) => ({
            label: angle,
            value: photos[angle] ? 'Foto terlampir' : 'Tidak ada foto',
            ok: !!photos[angle],
          })),
          damageFee: 0,
          approved,
        });

      } else {
        throw new Error('Anda harus login untuk menyimpan inspeksi');
      }
    } catch (error) {
      Alert.alert('Gagal menyimpan inspeksi', error instanceof Error ? error.message : 'Coba lagi.');
      return;
    } finally {
      setUploading(false);
    }
    Alert.alert(
      'Pengecekan terkirim',
      'Mitra akan meninjau hasil pengecekan sebelum menyelesaikan pesanan. Anda dapat memberi rating setelah pesanan selesai.',
      [{ text: 'Lihat Pesanan', onPress: () => navigation.replace('RenterOrderDetail', { id: route.params.id }) }]
    );
  };

  return (
    <Screen scroll>
      <AppHeader title={`Langkah ${step} dari 3`} onBack={() => (step === 1 ? navigation.goBack() : setStep(step - 1))} />
      <Stepper current={step} total={3} labelLeft="PENGECEKAN KONDISI" />

      {step === 1 ? (
        <View style={styles.body}>
          <Text style={styles.heading}>Cek Kondisi Kendaraan</Text>
          <Text style={styles.subtitle}>
            Lampirkan foto kondisi kendaraan. Mitra akan memeriksa kesesuaian unit sebelum
            menyelesaikan pesanan.
          </Text>
          <Text style={styles.progress}>{Object.keys(photos).length}/5 foto terisi</Text>
          <View style={styles.photos}>
            {angles.map((angle) => (
              <Pressable key={angle} style={styles.photo} onPress={() => capture(angle)}>
                <Camera size={20} color={colors.primary} />
                <Text style={styles.photoText}>{angle}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.body}>
          <Text style={styles.heading}>Ringkasan Unggahan</Text>
          <Text style={styles.subtitle}>
            Foto berikut akan menjadi bukti kondisi kendaraan saat dikembalikan.
          </Text>
          <Card style={styles.findings}>
            {angles.map((angle) => {
              const ok = !!photos[angle];
              return (
                <View key={angle} style={styles.findingRow}>
                  {ok ? (
                    <CheckCircle2 size={18} color={colors.success} />
                  ) : (
                    <Wrench size={18} color={colors.warning} />
                  )}
                  <Text style={styles.findingLabel}>{angle}</Text>
                  <Text style={[styles.findingValue, !ok && styles.findingWarning]}>
                    {ok ? 'Foto terlampir' : 'Tidak ada foto'}
                  </Text>
                </View>
              );
            })}
            <View style={styles.divider} />
            <View style={styles.findingRow}>
              <AlertTriangle size={18} color={colors.warning} />
              <Text style={styles.findingLabel}>Biaya tambahan</Text>
              <Text style={styles.findingValue}>Ditentukan mitra</Text>
            </View>
          </Card>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.body}>
          <Text style={styles.heading}>Konfirmasi Hasil Pemeriksaan</Text>
          <Text style={styles.subtitle}>
            Konfirmasi bahwa foto kondisi kendaraan sudah sesuai sebelum dikirim ke mitra.
          </Text>
          <Card style={styles.total}>
            <Text style={styles.totalLabel}>TOTAL PEMBAYARAN</Text>
            <Text style={styles.totalValue}>Belum ada biaya tambahan</Text>
          </Card>
          <Pressable style={styles.agree} onPress={() => setApproved((v) => !v)}>
            <View style={[styles.checkbox, approved && styles.checkboxActive]}>
              {approved ? <CheckCircle2 size={14} color={colors.text.white} /> : null}
            </View>
            <Text style={styles.agreeText}>
              Dengan menekan Setuju, Anda mengirim hasil pengecekan kepada mitra untuk ditinjau.
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.footer}>
        <PrimaryButton
          label={step === 3 ? 'Setuju & Selesai' : 'Lanjutkan'}
          disabled={step === 3 && !approved}
          loading={uploading}
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
