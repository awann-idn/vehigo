import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerAddVehicle'>;

const angles = ['Sisi depan', 'Sisi belakang', 'Interior', 'Sisi kanan', 'Sisi kiri'];

export default function OwnerAddVehicleScreen({ navigation }: Props) {
  const [transmission, setTransmission] = useState('Matic');

  return (
    <Screen scroll>
      <AppHeader title="Tambah Kendaraan" onBack={() => navigation.goBack()} />

      <Text style={styles.subtitle}>
        Lengkapi informasi kendaraan untuk mulai disewakan. Ambil foto sesuai sudut yang
        diminta untuk menghasilkan tampilan 360° kendaraan.
      </Text>

      <View style={styles.form}>
        <TextField label="Nama Kendaraan" placeholder="Contoh: BMW M4 Competition" />
        <TextField label="Nomor Polisi" placeholder="BG 1234 XX" autoCapitalize="characters" />
        <TextField label="Tahun" placeholder="2023" keyboardType="number-pad" />
        <TextField label="Harga Sewa / Hari" placeholder="350000" keyboardType="number-pad" />

        <Text style={styles.label}>TRANSMISI</Text>
        <SegmentedTabs options={['Matic', 'Manual']} value={transmission} onChange={setTransmission} />

        <Text style={styles.label}>FOTO 360°</Text>
        <View style={styles.angles}>
          {angles.map((angle) => (
            <Pressable key={angle} style={styles.angle}>
              <Camera size={20} color={colors.primary} />
              <Text style={styles.angleText}>{angle}</Text>
            </Pressable>
          ))}
        </View>

        <PrimaryButton label="Simpan Kendaraan" onPress={() => navigation.goBack()} />
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
  form: {
    gap: spacing.base,
  },
  label: {
    ...typography.label,
    color: colors.text.secondary,
  },
  angles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  angle: {
    width: '47%',
    height: 90,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
  },
  angleText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});
