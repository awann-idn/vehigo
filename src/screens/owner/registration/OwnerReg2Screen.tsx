import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FileText, Upload } from 'lucide-react-native';
import { RootStackParamList } from '../../../navigation/types';
import { TextField } from '../../../components/TextField';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { RegistrationLayout } from './RegistrationLayout';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerReg2'>;

export default function OwnerReg2Screen({ navigation }: Props) {
  const [businessName, setBusinessName] = useState('');

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

      <View style={styles.upload}>
        <View style={styles.uploadIcon}>
          <FileText size={26} color={colors.primary} />
        </View>
        <Text style={styles.uploadTitle}>Dokumen Legalitas</Text>
        <Text style={styles.uploadHint}>Unggah NIB / Akta Usaha / Surat Izin Rental</Text>
        <View style={styles.uploadButton}>
          <Upload size={16} color={colors.primary} />
          <Text style={styles.uploadButtonText}>Unggah Dokumen</Text>
        </View>
      </View>
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
  uploadButtonText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.primary,
  },
});
