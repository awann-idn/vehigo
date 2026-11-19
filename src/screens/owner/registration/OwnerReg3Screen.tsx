import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LocateFixed, MapPin, X } from 'lucide-react-native';
import { RootStackParamList } from '../../../navigation/types';
import { TextField } from '../../../components/TextField';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { RegistrationLayout } from './RegistrationLayout';
import { useRegistrationStore } from '../../../features/owner/registrationStore';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerReg3'>;

const terms = [
  'Ketentuan penyewa: usia minimal, SIM, dan identitas yang diperlukan.',
  'Durasi & keterlambatan: sistem durasi sewa dan denda keterlambatan.',
  'Penggunaan kendaraan: aturan pemakaian dan larangan.',
  'Pengembalian & bahan bakar: kondisi unit saat dikembalikan.',
];

export default function OwnerReg3Screen({ navigation }: Props) {
  const address = useRegistrationStore((state) => state.address);
  const updateRegistration = useRegistrationStore((state) => state.update);
  const [termsVisible, setTermsVisible] = useState(false);

  return (
    <RegistrationLayout
      step={3}
      heading="Informasi Usaha"
      subheading="Lengkapi form informasi di bawah ini dengan jelas agar dapat meningkatkan transparansi kepada penyewa."
      onBack={() => navigation.goBack()}
      onNext={() => navigation.navigate('OwnerReg4')}
    >
      <TextField
        label="Alamat Lengkap Usaha"
        placeholder="Jl. Talang Kelapa, Alang-Alang Lebar, Palembang - 30153"
        multiline
        value={address}
        onChangeText={(value) => updateRegistration({ address: value })}
        style={styles.multiline}
      />

      <Text style={styles.label}>TITIK KOORDINAT (MAP VIEW)</Text>
      <View style={styles.map}>
        <MapPin size={40} color={colors.primary} />
        <Text style={styles.mapText}>Palembang, Sumatera Selatan</Text>
        <Pressable style={styles.locateButton}>
          <LocateFixed size={14} color={colors.primary} />
          <Text style={styles.locateText}>GUNAKAN LOKASI SAAT INI</Text>
        </Pressable>
      </View>

      <Pressable style={styles.termsButton} onPress={() => setTermsVisible(true)}>
        <Text style={styles.termsButtonText}>Atur Syarat & Ketentuan Rental</Text>
      </Pressable>

      <Modal visible={termsVisible} transparent animationType="slide" onRequestClose={() => setTermsVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Syarat & Ketentuan</Text>
              <Pressable onPress={() => setTermsVisible(false)} hitSlop={10}>
                <X size={20} color={colors.text.primary} />
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>
              Lengkapi syarat dan ketentuan rental Anda agar penyewa memahami aturan sebelum
              melakukan pemesanan.
            </Text>
            <ScrollView style={styles.modalBody}>
              {terms.map((item, index) => (
                <View key={item} style={styles.termRow}>
                  <Text style={styles.termIndex}>{index + 1}.</Text>
                  <Text style={styles.termText}>{item}</Text>
                </View>
              ))}
            </ScrollView>
            <Pressable style={styles.modalSave} onPress={() => setTermsVisible(false)}>
              <Text style={styles.modalSaveText}>Simpan S&K</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </RegistrationLayout>
  );
}

const styles = StyleSheet.create({
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  label: {
    ...typography.label,
    color: colors.text.secondary,
  },
  map: {
    height: 180,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  mapText: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.primary,
  },
  locateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locateText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  termsButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.secondaryButton,
  },
  termsButtonText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,33,56,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.h3,
  },
  modalSubtitle: {
    ...typography.bodySm,
    color: colors.text.secondary,
  },
  modalBody: {
    maxHeight: 320,
  },
  termRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  termIndex: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.primary,
  },
  termText: {
    ...typography.bodySm,
    flex: 1,
    color: colors.text.secondary,
  },
  modalSave: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    ...typography.button,
    color: colors.text.white,
  },
});
