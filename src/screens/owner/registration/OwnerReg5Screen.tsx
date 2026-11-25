import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Banknote, Wallet } from 'lucide-react-native';
import { RootStackParamList } from '../../../navigation/types';
import { TextField } from '../../../components/TextField';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { RegistrationLayout } from './RegistrationLayout';
import { useRegistrationStore } from '../../../features/owner/registrationStore';
import { useSaveMitraRegistration } from '../../../hooks/useMitras';
import { useAuth } from '../../../features/auth/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerReg5'>;
export default function OwnerReg5Screen({ navigation }: Props) {
  const { user, refreshProfile } = useAuth();
  const method = useRegistrationStore((state) => state.payoutMethod);
  const account = useRegistrationStore((state) => state.accountNumber);
  const accountHolder = useRegistrationStore((state) => state.accountHolder);
  const registration = useRegistrationStore();
  const resetRegistration = useRegistrationStore((state) => state.reset);
  const updateRegistration = useRegistrationStore((state) => state.update);
  const saveRegistration = useSaveMitraRegistration();

  const finish = async () => {
    if (!user) {
      Alert.alert('Login diperlukan', 'Silakan masuk ulang untuk menyelesaikan pendaftaran.');
      return;
    }
    if (!registration.businessName.trim() || !registration.ownerName.trim()) {
      Alert.alert('Data belum lengkap', 'Nama pemilik dan nama usaha wajib diisi.');
      return;
    }
    if (!account.trim() || !accountHolder.trim()) {
      Alert.alert('Data rekening belum lengkap', 'Nomor rekening dan nama pemilik wajib diisi.');
      return;
    }

    try {
      await saveRegistration.mutateAsync({
        userId: user.id,
        ownerName: registration.ownerName,
        identityNumber: registration.identityNumber,
        businessName: registration.businessName,
        businessDescription: registration.businessDescription,
        address: registration.address,
        phone: registration.phone,
        payoutMethod: method,
        accountNumber: account,
        operatingHours: registration.operatingHours,
        terms: registration.terms,
        accountHolder,
      });
      await refreshProfile();
      resetRegistration();
      navigation.navigate('OwnerVerification');
    } catch (error) {
      Alert.alert('Pendaftaran gagal', error instanceof Error ? error.message : 'Coba lagi.');
    }
  };

  return (
    <RegistrationLayout
      step={5}
      heading="Informasi Keuangan"
      subheading="Pilih metode untuk menerima pendapatan sewa Anda."
      onBack={() => navigation.goBack()}
      onNext={finish}
      nextLabel="Selesaikan Pendaftaran"
    >
      <View style={styles.methods}>
        <Pressable
          style={[styles.method, method === 'bank' && styles.methodActive]}
          onPress={() => updateRegistration({ payoutMethod: 'bank' })}
        >
          <Banknote size={24} color={method === 'bank' ? colors.text.white : colors.primary} />
          <Text style={[styles.methodTitle, method === 'bank' && styles.methodTitleActive]}>
            Rekening Bank
          </Text>
          <Text style={[styles.methodBody, method === 'bank' && styles.methodBodyActive]}>
            Transfer langsung ke rekening bank lokal Anda.
          </Text>
        </Pressable>
        <Pressable
          style={[styles.method, method === 'ewallet' && styles.methodActive]}
          onPress={() => updateRegistration({ payoutMethod: 'ewallet' })}
        >
          <Wallet size={24} color={method === 'ewallet' ? colors.text.white : colors.primary} />
          <Text style={[styles.methodTitle, method === 'ewallet' && styles.methodTitleActive]}>
            E-Wallet
          </Text>
          <Text style={[styles.methodBody, method === 'ewallet' && styles.methodBodyActive]}>
            Dana, GoPay, OVO — pencairan lebih cepat.
          </Text>
        </Pressable>
      </View>

      <TextField
        label={method === 'bank' ? 'Nomor Rekening' : 'Nomor E-Wallet'}
        placeholder={method === 'bank' ? '0000 0000 0000' : '0812 3456 7890'}
        keyboardType="number-pad"
        value={account}
        onChangeText={(value) => updateRegistration({ accountNumber: value })}
      />
      <TextField
        label={method === 'bank' ? 'Nama Pemilik Rekening' : 'Nama Terdaftar'}
        placeholder="Sesuai buku tabungan / akun e-wallet"
        value={accountHolder}
        onChangeText={(value) => updateRegistration({ accountHolder: value })}
      />

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Ringkasan Pendaftaran</Text>
        <Text style={styles.summaryBody}>
          Data Anda akan diverifikasi dalam 1x24 jam. Anda akan menerima notifikasi melalui
          WhatsApp dan email setelah akun mitra aktif.
        </Text>
      </View>
    </RegistrationLayout>
  );
}

const styles = StyleSheet.create({
  methods: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  method: {
    flex: 1,
    padding: spacing.base,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: spacing.sm,
    minHeight: 140,
  },
  methodActive: {
    backgroundColor: colors.primary,
  },
  methodTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  methodTitleActive: {
    color: colors.text.white,
  },
  methodBody: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  methodBodyActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  summary: {
    padding: spacing.base,
    borderRadius: 14,
    backgroundColor: colors.surface,
    gap: 4,
  },
  summaryTitle: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  summaryBody: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 17,
  },
});
