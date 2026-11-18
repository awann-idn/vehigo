import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Banknote, Wallet } from 'lucide-react-native';
import { RootStackParamList } from '../../../navigation/types';
import { TextField } from '../../../components/TextField';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { RegistrationLayout } from './RegistrationLayout';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerReg5'>;
type Method = 'bank' | 'ewallet';

export default function OwnerReg5Screen({ navigation }: Props) {
  const [method, setMethod] = useState<Method>('bank');
  const [account, setAccount] = useState('');

  return (
    <RegistrationLayout
      step={5}
      heading="Informasi Keuangan"
      subheading="Pilih metode untuk menerima pendapatan sewa Anda."
      onBack={() => navigation.goBack()}
      onNext={() => navigation.navigate('OwnerVerification')}
      nextLabel="Selesaikan Pendaftaran"
    >
      <View style={styles.methods}>
        <Pressable
          style={[styles.method, method === 'bank' && styles.methodActive]}
          onPress={() => setMethod('bank')}
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
          onPress={() => setMethod('ewallet')}
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
        onChangeText={setAccount}
      />
      <TextField
        label={method === 'bank' ? 'Nama Pemilik Rekening' : 'Nama Terdaftar'}
        placeholder="Sesuai buku tabungan / akun e-wallet"
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
