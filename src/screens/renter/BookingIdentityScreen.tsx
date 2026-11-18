import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CreditCard, Phone, User } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Stepper } from '../../components/Stepper';
import { TextField } from '../../components/TextField';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingIdentity'>;

export default function BookingIdentityScreen({ navigation, route }: Props) {
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <Screen scroll>
      <AppHeader title="Identitas Penyewa" onBack={() => navigation.goBack()} />
      <Stepper current={1} total={3} labelLeft="IDENTITAS PENYEWA" />

      <Text style={styles.subtitle}>
        Mohon lengkapi data diri Anda sesuai dengan kartu identitas resmi (KTP).
      </Text>

      <View style={styles.form}>
        <TextField
          label="Nama Lengkap"
          icon={User}
          placeholder="Bambang Pamungkas"
          value={name}
          onChangeText={setName}
        />
        <TextField
          label="NIK"
          icon={CreditCard}
          placeholder="3275***********"
          keyboardType="number-pad"
          maxLength={16}
          value={nik}
          onChangeText={setNik}
        />
        <TextField
          label="Nomor WhatsApp"
          icon={Phone}
          placeholder="+62 812 3456 7890"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <View style={styles.upload}>
          <CreditCard size={24} color={colors.primary} />
          <Text style={styles.uploadTitle}>Unggah Foto KTP</Text>
          <Text style={styles.uploadHint}>Pastikan seluruh bagian KTP terlihat jelas.</Text>
        </View>

        <PrimaryButton
          label="Lanjutkan"
          onPress={() => navigation.navigate('BookingCheckout', { vehicleId: route.params.vehicleId })}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.bodySm,
    color: colors.text.secondary,
    marginTop: spacing.base,
  },
  form: {
    gap: spacing.base,
    marginTop: spacing.base,
  },
  upload: {
    alignItems: 'center',
    gap: 6,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  uploadTitle: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  uploadHint: {
    ...typography.caption,
    color: colors.text.muted,
  },
});
