import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Mail, MessageCircle } from 'lucide-react-native';
import { RootStackParamList } from '../../../navigation/types';
import { TextField } from '../../../components/TextField';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { RegistrationLayout } from './RegistrationLayout';
import { useRegistrationStore } from '../../../features/owner/registrationStore';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerReg4'>;

export default function OwnerReg4Screen({ navigation }: Props) {
  const phone = useRegistrationStore((state) => state.phone);
  const email = useRegistrationStore((state) => state.email);
  const updateRegistration = useRegistrationStore((state) => state.update);

  return (
    <RegistrationLayout
      step={4}
      heading="Informasi Kontak"
      subheading="Kontak aktif diperlukan untuk konfirmasi pesanan dan verifikasi akun."
      onBack={() => navigation.goBack()}
      onNext={() => navigation.navigate('OwnerReg5')}
    >
      <TextField
        label="Nomor WhatsApp"
        icon={MessageCircle}
        placeholder="812 3456 7890"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(value) => updateRegistration({ phone: value })}
      />
      <Text style={styles.note}>
        *Kode verifikasi akan dikirimkan melalui pesan WhatsApp ke nomor yang terdaftar.
      </Text>
      <TextField
        label="Alamat Email"
        icon={Mail}
        placeholder="nama@gmail.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={(value) => updateRegistration({ email: value })}
      />
    </RegistrationLayout>
  );
}

const styles = StyleSheet.create({
  note: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: -spacing.sm,
  },
});
