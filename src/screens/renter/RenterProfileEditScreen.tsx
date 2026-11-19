import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../features/auth/useAuth';
import { useUpdateMyProfile } from '../../hooks/useMitras';

type Props = NativeStackScreenProps<RootStackParamList, 'RenterProfileEdit'>;

function ProfileForm({
  userId,
  initialName,
  initialPhone,
  onSaved,
}: {
  userId: string;
  initialName: string;
  initialPhone: string;
  onSaved: () => void;
}) {
  const { refreshProfile } = useAuth();
  const updateProfile = useUpdateMyProfile();
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);

  const save = async () => {
    if (!fullName.trim()) {
      Alert.alert('Data belum lengkap', 'Nama lengkap wajib diisi.');
      return;
    }
    try {
      await updateProfile.mutateAsync({ userId, fullName, phone });
      await refreshProfile();
      Alert.alert('Tersimpan', 'Profil berhasil diperbarui.', [{ text: 'OK', onPress: onSaved }]);
    } catch (error) {
      Alert.alert('Gagal menyimpan', error instanceof Error ? error.message : 'Coba lagi.');
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.subtitle}>Perbarui nama dan nomor kontak yang digunakan di Vehigo.</Text>
      <TextField label="Nama Lengkap" value={fullName} onChangeText={setFullName} />
      <TextField
        label="Nomor WhatsApp"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <PrimaryButton label="Simpan Perubahan" onPress={save} loading={updateProfile.isPending} />
    </View>
  );
}

export default function RenterProfileEditScreen({ navigation }: Props) {
  const { user, profile } = useAuth();

  return (
    <Screen scroll>
      <AppHeader title="Profil Saya" onBack={() => navigation.goBack()} />
      {user ? (
        <ProfileForm
          userId={user.id}
          initialName={profile?.full_name ?? ''}
          initialPhone={profile?.phone ?? ''}
          onSaved={() => navigation.goBack()}
        />
      ) : (
        <Text style={styles.subtitle}>Silakan masuk ulang untuk mengubah profil.</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.base,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.text.secondary,
  },
});
