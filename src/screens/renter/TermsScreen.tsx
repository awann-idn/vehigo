import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FileText } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Terms'>;

const terms = [
  {
    title: '1. Ketentuan Umum Penyewa',
    body: 'Penyewa wajib memiliki Surat Izin Mengemudi (SIM) yang masih berlaku sesuai dengan jenis kendaraan.',
  },
  {
    title: '2. Durasi & Keterlambatan',
    body: 'Durasi sewa dihitung per 24 jam. Keterlambatan pengembalian kendaraan akan dikenakan biaya proporsional.',
  },
  {
    title: '3. Penggunaan Kendaraan',
    body: 'Kendaraan hanya diperbolehkan digunakan untuk operasional normal di jalan raya yang layak.',
  },
  {
    title: '4. Deposit & Denda',
    body: 'Deposit dikembalikan setelah pemeriksaan kendaraan selesai. Denda kerusakan dihitung sesuai hasil pemeriksaan.',
  },
];

export default function TermsScreen({ navigation }: Props) {
  return (
    <Screen scroll>
      <AppHeader title="Syarat & Ketentuan" onBack={() => navigation.goBack()} />
      <Text style={styles.subtitle}>
        Harap baca dengan teliti kebijakan penyewaan kami sebelum melanjutkan reservasi.
      </Text>

      {terms.map((term) => (
        <View key={term.title} style={styles.block}>
          <View style={styles.row}>
            <FileText size={16} color={colors.primary} />
            <Text style={styles.title}>{term.title}</Text>
          </View>
          <Text style={styles.body}>{term.body}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.bodySm,
    color: colors.text.secondary,
    marginBottom: spacing.base,
  },
  block: {
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.bodySm,
    fontWeight: '700',
    flex: 1,
  },
  body: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
