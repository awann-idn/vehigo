import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2, Clock3, CreditCard, FileCheck2, Upload } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Card } from '../../components/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../features/auth/useAuth';
import { pickAndCompressImage, uploadDocument } from '../../lib/storage';
import { fetchMyDocuments } from '../../api/documents';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type Props = NativeStackScreenProps<RootStackParamList, 'RenterVerification'>;

const docs = [
  { kind: 'ktp' as const, title: 'KTP', body: 'Kartu Tanda Penduduk pemilik akun.' },
  { kind: 'sim' as const, title: 'SIM', body: 'SIM A yang masih berlaku untuk mengemudi.' },
];

const statusLabel: Record<string, string> = {
  pending: 'Menunggu verifikasi',
  verified: 'Terverifikasi',
  rejected: 'Ditolak',
};

export default function RenterVerificationScreen({ navigation }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: documents = [] } = useQuery({
    queryKey: ['myDocuments', user?.id],
    queryFn: () => fetchMyDocuments(user?.id as string),
    enabled: !!user?.id,
  });
  const [uploading, setUploading] = useState<string | null>(null);

  const upload = async (kind: 'ktp' | 'sim') => {
    if (!user) {
      Alert.alert('Login diperlukan', 'Silakan masuk ulang.');
      return;
    }
    try {
      setUploading(kind);
      const uri = await pickAndCompressImage([4, 3]);
      if (!uri) return;
      await uploadDocument(user.id, kind, uri);
      await queryClient.invalidateQueries({ queryKey: ['myDocuments', user.id] });
      Alert.alert('Terunggah', 'Dokumen berhasil diunggah dan menunggu verifikasi admin.');
    } catch (error) {
      Alert.alert('Gagal mengunggah', error instanceof Error ? error.message : 'Coba lagi.');
    } finally {
      setUploading(null);
    }
  };

  return (
    <Screen scroll>
      <AppHeader title="Verifikasi Identitas" onBack={() => navigation.goBack()} />
      <Text style={styles.subtitle}>
        Unggah KTP dan SIM agar mitra dapat memverifikasi identitas Anda sebelum penyewaan.
      </Text>

      {docs.map((doc) => {
        const record = documents.find((item) => item.kind === doc.kind);
        const status = record?.status;
        return (
          <Card key={doc.kind} style={styles.card}>
            <View style={styles.iconBadge}>
              {status === 'verified' ? (
                <CheckCircle2 size={20} color={colors.success} />
              ) : status === 'pending' ? (
                <Clock3 size={20} color={colors.warning} />
              ) : (
                <FileCheck2 size={20} color={colors.primary} />
              )}
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.title}>{doc.title}</Text>
              <Text style={styles.body}>{doc.body}</Text>
              <Text
                style={[
                  styles.status,
                  status === 'verified' && { color: colors.success },
                  status === 'rejected' && { color: colors.danger },
                ]}
              >
                {status ? statusLabel[status] : 'Belum diunggah'}
              </Text>
            </View>
            <Pressable
              style={styles.upload}
              onPress={() => upload(doc.kind)}
              disabled={uploading !== null}
            >
              <Upload size={16} color={colors.primary} />
              <Text style={styles.uploadText}>
                {uploading === doc.kind ? 'Mengunggah...' : 'Unggah'}
              </Text>
            </Pressable>
          </Card>
        );
      })}

      <View style={styles.note}>
        <CreditCard size={16} color={colors.text.muted} />
        <Text style={styles.noteText}>
          Data identitas hanya digunakan untuk verifikasi dan tidak dibagikan ke publik.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.bodySm,
    color: colors.text.secondary,
    marginBottom: spacing.base,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1, gap: 2 },
  title: { ...typography.bodySm, fontWeight: '700' },
  body: { ...typography.caption, color: colors.text.secondary },
  status: { ...typography.caption, fontWeight: '700', color: colors.warning },
  upload: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.secondaryButton,
  },
  uploadText: { ...typography.caption, fontWeight: '700', color: colors.primary },
  note: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.base,
  },
  noteText: { ...typography.caption, color: colors.text.muted, flex: 1 },
});
