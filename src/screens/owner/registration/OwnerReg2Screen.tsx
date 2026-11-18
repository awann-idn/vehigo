import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2, FileText, Upload } from 'lucide-react-native';
import { RootStackParamList } from '../../../navigation/types';
import { TextField } from '../../../components/TextField';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { RegistrationLayout } from './RegistrationLayout';
import { pickAndCompressImage, uploadDocument } from '../../../lib/storage';
import { useAuth } from '../../../features/auth/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerReg2'>;

export default function OwnerReg2Screen({ navigation }: Props) {
  const [businessName, setBusinessName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const { user } = useAuth();

  const handlePickAndUpload = async () => {
    try {
      const uri = await pickAndCompressImage([4, 3]);
      if (!uri) return;

      setImageUri(uri);

      if (user?.id) {
        setUploading(true);
        await uploadDocument(user.id, 'nib', uri);
        setUploaded(true);
        Alert.alert('Sukses', 'Dokumen legalitas berhasil diunggah!');
      } else {
        setUploaded(true);
        Alert.alert('Sukses', 'Dokumen legalitas berhasil dipilih!');
      }
    } catch (err: any) {
      Alert.alert('Gagal Mengunggah', err.message || 'Terjadi kesalahan saat memilih dokumen.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <RegistrationLayout
      step={2}
      heading="Legalitas Usaha"
      subheading="Pastikan data yang Anda masukkan sesuai dengan dokumen resmi untuk mempercepat proses verifikasi."
      onBack={() => navigation.goBack()}
      onNext={() => navigation.navigate('OwnerReg3')}
    >
      <TextField
        label="Nama Usaha"
        placeholder="Contoh: Sriwijaya Rent"
        value={businessName}
        onChangeText={setBusinessName}
      />
      <TextField label="Nomor Induk Berusaha (NIB)" placeholder="Masukkan NIB jika ada" />
      <TextField label="NPWP Usaha" placeholder="00.000.000.0-000.000" />

      <Pressable
        style={[styles.upload, uploaded && styles.uploadSuccess]}
        onPress={handlePickAndUpload}
        disabled={uploading}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <View style={styles.uploadIcon}>
            <FileText size={26} color={colors.primary} />
          </View>
        )}

        <Text style={styles.uploadTitle}>
          {uploaded ? 'Dokumen Terunggah' : 'Dokumen Legalitas'}
        </Text>
        <Text style={styles.uploadHint}>
          {uploaded ? 'Ketuk untuk mengganti dokumen' : 'Unggah NIB / Akta Usaha / Surat Izin Rental'}
        </Text>

        <View style={[styles.uploadButton, uploaded && styles.uploadButtonSuccess]}>
          {uploading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : uploaded ? (
            <>
              <CheckCircle2 size={16} color={colors.success} />
              <Text style={[styles.uploadButtonText, { color: colors.success }]}>Siap Digunakan</Text>
            </>
          ) : (
            <>
              <Upload size={16} color={colors.primary} />
              <Text style={styles.uploadButtonText}>Pilih Dokumen</Text>
            </>
          )}
        </View>
      </Pressable>
    </RegistrationLayout>
  );
}

const styles = StyleSheet.create({
  upload: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  uploadSuccess: {
    borderColor: colors.success,
    borderStyle: 'solid',
    backgroundColor: colors.card,
  },
  previewImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    ...typography.h3,
  },
  uploadHint: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.secondaryButton,
  },
  uploadButtonSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  uploadButtonText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.primary,
  },
});
