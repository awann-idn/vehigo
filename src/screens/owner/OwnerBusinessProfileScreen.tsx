import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { TextField } from '../../components/TextField';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../features/auth/useAuth';
import {
  useMyMitraProfile,
  useMyPayoutAccount,
  useSaveMitraRegistration,
} from '../../hooks/useMitras';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerBusinessProfile'>;

type FormInitial = {
  ownerName: string;
  businessName: string;
  address: string;
  phone: string;
  method: 'bank' | 'ewallet';
  accountNumber: string;
  accountHolder: string;
};

function BusinessProfileForm({
  userId,
  initial,
  onSaved,
}: {
  userId: string;
  initial: FormInitial;
  onSaved: () => void;
}) {
  const { refreshProfile } = useAuth();
  const saveRegistration = useSaveMitraRegistration();

  const [ownerName, setOwnerName] = useState(initial.ownerName);
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [address, setAddress] = useState(initial.address);
  const [phone, setPhone] = useState(initial.phone);
  const [method, setMethod] = useState<'bank' | 'ewallet'>(initial.method);
  const [accountNumber, setAccountNumber] = useState(initial.accountNumber);
  const [accountHolder, setAccountHolder] = useState(initial.accountHolder);

  const save = async () => {
    if (!ownerName.trim() || !businessName.trim()) {
      Alert.alert('Data belum lengkap', 'Nama pemilik dan nama usaha wajib diisi.');
      return;
    }
    try {
      await saveRegistration.mutateAsync({
        userId,
        ownerName,
        businessName,
        address,
        phone,
        payoutMethod: method,
        accountNumber,
        accountHolder,
      });
      await refreshProfile();
      Alert.alert('Tersimpan', 'Data usaha berhasil diperbarui.', [{ text: 'OK', onPress: onSaved }]);
    } catch (error) {
      Alert.alert('Gagal menyimpan', error instanceof Error ? error.message : 'Coba lagi.');
    }
  };

  return (
    <>
      <Text style={styles.subtitle}>
        Perbarui data usaha, kontak, dan rekening penerimaan pendapatan Anda.
      </Text>

      <View style={styles.form}>
        <TextField label="Nama Pemilik" value={ownerName} onChangeText={setOwnerName} />
        <TextField label="Nama Usaha" value={businessName} onChangeText={setBusinessName} />
        <TextField
          label="Alamat Usaha"
          value={address}
          onChangeText={setAddress}
          multiline
          style={styles.multiline}
        />
        <TextField
          label="Nomor WhatsApp"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>METODE PENERIMAAN</Text>
        <SegmentedTabs
          options={['bank', 'ewallet']}
          value={method}
          onChange={(value) => setMethod(value as 'bank' | 'ewallet')}
        />
        <TextField
          label={method === 'bank' ? 'Nomor Rekening' : 'Nomor E-Wallet'}
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="number-pad"
        />
        <TextField
          label={method === 'bank' ? 'Nama Pemilik Rekening' : 'Nama Terdaftar'}
          value={accountHolder}
          onChangeText={setAccountHolder}
        />

        <PrimaryButton label="Simpan Perubahan" onPress={save} loading={saveRegistration.isPending} />
      </View>
    </>
  );
}

export default function OwnerBusinessProfileScreen({ navigation }: Props) {
  const { user, profile } = useAuth();
  const { data: mitraProfile, isLoading: mitraLoading } = useMyMitraProfile(user?.id);
  const { data: payout, isLoading: payoutLoading } = useMyPayoutAccount(user?.id);

  return (
    <Screen scroll>
      <AppHeader title="Profil Mitra" onBack={() => navigation.goBack()} />

      {!user ? (
        <Text style={styles.subtitle}>Silakan masuk ulang untuk mengubah profil.</Text>
      ) : mitraLoading || payoutLoading ? (
        <Text style={styles.subtitle}>Memuat profil...</Text>
      ) : (
        <BusinessProfileForm
          userId={user.id}
          initial={{
            ownerName: profile?.full_name ?? '',
            businessName: mitraProfile?.businessName ?? '',
            address: mitraProfile?.address ?? '',
            phone: profile?.phone ?? '',
            method: payout?.method ?? 'bank',
            accountNumber: payout?.accountNumber ?? '',
            accountHolder: payout?.accountHolder ?? '',
          }}
          onSaved={() => navigation.goBack()}
        />
      )}
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
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
