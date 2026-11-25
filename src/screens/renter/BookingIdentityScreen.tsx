import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { useAuth } from '../../features/auth/useAuth';
import { pickAndCompressImage, uploadDocument } from '../../lib/storage';
import { supabase } from '../../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingIdentity'>;

export default function BookingIdentityScreen({ navigation, route }: Props) {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? '');
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [ktpUri, setKtpUri] = useState<string | null>(null);
  const [ktpUploaded, setKtpUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickKtp = async () => {
    if (!user) {
      Alert.alert('Login diperlukan', 'Masuk terlebih dahulu untuk mengunggah KTP.');
      return;
    }
    try {
      const uri = await pickAndCompressImage([4, 3]);
      if (!uri) return;
      setKtpUri(uri);
      setUploading(true);
      await uploadDocument(user.id, 'ktp', uri);
      setKtpUploaded(true);
    } catch (error) {
      Alert.alert('Gagal mengunggah KTP', error instanceof Error ? error.message : 'Coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const next = async () => {
    if (!user) {
      Alert.alert('Login diperlukan', 'Masuk terlebih dahulu untuk melanjutkan.');
      return;
    }
    if (!name.trim() || nik.length !== 16 || !phone.trim() || !ktpUploaded) {
      Alert.alert('Data belum lengkap', 'Isi nama, NIK 16 digit, WhatsApp, dan unggah KTP.');
      return;
    }
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: name.trim(), phone: phone.trim() })
        .eq('id', user.id);
      if (error) throw new Error(error.message);
      await refreshProfile();
      navigation.navigate('BookingCheckout', {
        vehicleId: route.params.vehicleId,
        startDate: route.params.startDate,
        endDate: route.params.endDate,
      });
    } catch (error) {
      Alert.alert('Gagal menyimpan identitas', error instanceof Error ? error.message : 'Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

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
          onChangeText={(value) => setNik(value.replace(/\D/g, ''))}
        />
        <TextField
          label="Nomor WhatsApp"
          icon={Phone}
          placeholder="+62 812 3456 7890"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Pressable style={[styles.upload, ktpUploaded && styles.uploadDone]} onPress={pickKtp} disabled={uploading}>
          {ktpUri ? <Image source={{ uri: ktpUri }} style={styles.preview} /> : <CreditCard size={24} color={colors.primary} />}
          <Text style={styles.uploadTitle}>{ktpUploaded ? 'KTP Terunggah' : 'Unggah Foto KTP'}</Text>
          <Text style={styles.uploadHint}>
            {uploading ? 'Mengunggah...' : 'Pastikan seluruh bagian KTP terlihat jelas.'}
          </Text>
          {uploading ? <ActivityIndicator color={colors.primary} /> : null}
        </Pressable>

        <PrimaryButton label="Lanjutkan" onPress={next} loading={saving} />
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
  uploadDone: {
    borderColor: colors.success,
  },
  preview: {
    width: 160,
    height: 96,
    borderRadius: 10,
  },
  uploadHint: {
    ...typography.caption,
    color: colors.text.muted,
  },
});
