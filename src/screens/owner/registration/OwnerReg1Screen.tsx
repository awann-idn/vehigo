import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2, CreditCard, Upload } from 'lucide-react-native';
import { RootStackParamList } from '../../../navigation/types';
import { TextField } from '../../../components/TextField';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { RegistrationLayout } from './RegistrationLayout';
import { pickAndCompressImage, uploadDocument } from '../../../lib/storage';
import { useAuth } from '../../../features/auth/useAuth';
import { useRegistrationStore } from '../../../features/owner/registrationStore';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerReg1'>;

export default function OwnerReg1Screen({ navigation }: Props) {
  const ownerName = useRegistrationStore((state) => state.ownerName);
  const updateRegistration = useRegistrationStore((state) => state.update);
  const identityNumber = useRegistrationStore((state) => state.identityNumber);
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
        await uploadDocument(user.id, 'ktp', uri);
        setUploaded(true);
        Alert.alert('Sukses', 'Foto KTP berhasil diunggah!');
      } else {
        // Mode offline/mock preview
        setUploaded(true);
        Alert.alert('Sukses', 'Foto KTP berhasil dipilih!');
      }
    } catch (err: any) {
      Alert.alert('Gagal Mengunggah', err.message || 'Terjadi kesalahan saat memilih foto.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <RegistrationLayout
      step={1}
      heading="Identitas Pemilik"
      subheading="Mari mulai dengan memverifikasi identitas legal Anda. Ini menjamin ekosistem yang aman bagi semua pengguna."
      onBack={() => navigation.goBack()}
      onNext={() => {
        if (!ownerName.trim() || identityNumber.length !== 16 || !uploaded) {
          Alert.alert('Data belum lengkap', 'Isi nama, NIK 16 digit, dan unggah foto KTP sebelum lanjut.');
          return;
        }
        navigation.navigate('OwnerReg2');
      }}
    >
      <TextField
        label="Nama Lengkap (Sesuai KTP)"
        placeholder="Ari Wijaya"
        value={ownerName}
        onChangeText={(value) => updateRegistration({ ownerName: value })}
      />
      <TextField
        label="NIK (16 Digit)"
        placeholder="3275 0000 0000 0000"
        keyboardType="number-pad"
        maxLength={16}
        value={identityNumber}
        onChangeText={(value) => updateRegistration({ identityNumber: value.replace(/\D/g, '') })}
      />

      <Pressable
        style={[styles.upload, uploaded && styles.uploadSuccess]}
        onPress={handlePickAndUpload}
        disabled={uploading}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <View style={styles.uploadIcon}>
            <CreditCard size={26} color={colors.primary} />
          </View>
        )}

        <Text style={styles.uploadTitle}>
          {uploaded ? 'KTP Terunggah' : 'Dokumen Identitas'}
        </Text>
        <Text style={styles.uploadHint}>
          {uploaded ? 'Ketuk untuk mengganti foto KTP' : 'Unggah foto KTP Anda (JPG/PNG, maks 5MB)'}
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
              <Text style={styles.uploadButtonText}>Pilih Foto KTP</Text>
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
