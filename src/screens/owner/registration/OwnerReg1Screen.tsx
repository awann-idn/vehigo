import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CreditCard, Upload } from 'lucide-react-native';
import { RootStackParamList } from '../../../navigation/types';
import { TextField } from '../../../components/TextField';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { RegistrationLayout } from './RegistrationLayout';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerReg1'>;

export default function OwnerReg1Screen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');

  return (
    <RegistrationLayout
      step={1}
      heading="Identitas Pemilik"
      subheading="Mari mulai dengan memverifikasi identitas legal Anda. Ini menjamin ekosistem yang aman bagi semua pengguna."
      onBack={() => navigation.goBack()}
      onNext={() => navigation.navigate('OwnerReg2')}
    >
      <TextField
        label="Nama Lengkap (Sesuai KTP)"
        placeholder="Ari Wijaya"
        value={name}
        onChangeText={setName}
      />
      <TextField
        label="NIK (16 Digit)"
        placeholder="3275 0000 0000 0000"
        keyboardType="number-pad"
        maxLength={16}
        value={nik}
        onChangeText={setNik}
      />

      <View style={styles.upload}>
        <View style={styles.uploadIcon}>
          <CreditCard size={26} color={colors.primary} />
        </View>
        <Text style={styles.uploadTitle}>Dokumen Identitas</Text>
        <Text style={styles.uploadHint}>Unggah foto KTP Anda (JPG/PNG, maks 5MB)</Text>
        <View style={styles.uploadButton}>
          <Upload size={16} color={colors.primary} />
          <Text style={styles.uploadButtonText}>Unggah Foto KTP</Text>
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
