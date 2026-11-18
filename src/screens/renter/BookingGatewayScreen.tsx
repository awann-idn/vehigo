import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MessageCircle, Smartphone } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingGateway'>;

export default function BookingGatewayScreen({ navigation, route }: Props) {
  return (
    <Screen scroll>
      <AppHeader title="Gateway Pemesanan" onBack={() => navigation.goBack()} />

      <Text style={styles.subtitle}>
        Pilih jalur pemesanan yang paling nyaman untuk Anda hari ini.
      </Text>

      <Card style={styles.option}>
        <View style={styles.optionIcon}>
          <Smartphone size={24} color={colors.text.white} />
        </View>
        <Text style={styles.optionTitle}>Pesan melalui Aplikasi</Text>
        <Text style={styles.optionBody}>
          Proses instan, otomatisasi jadwal, dan pantau status kendaraan secara real-time
          langsung dari aplikasi.
        </Text>
        <PrimaryButton
          label="Lanjutkan via Aplikasi"
          onPress={() => navigation.navigate('BookingIdentity', { vehicleId: route.params.vehicleId })}
        />
      </Card>

      <Card style={styles.optionAlt}>
        <View style={styles.optionIconAlt}>
          <MessageCircle size={24} color={colors.primary} />
        </View>
        <Text style={styles.optionTitleAlt}>Pesan via WhatsApp</Text>
        <Text style={styles.optionBody}>
          Butuh bantuan? Hubungi admin kami untuk konsultasi unit, nego harga, atau
          pertanyaan khusus lainnya.
        </Text>
        <PrimaryButton label="Chat Admin" variant="secondary" onPress={() => {}} />
      </Card>

      <Text style={styles.terms} onPress={() => navigation.navigate('Terms')}>
        Dengan melanjutkan Anda menyetujui Syarat & Ketentuan Vehigo.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.bodySm,
    color: colors.text.secondary,
    marginBottom: spacing.base,
  },
  option: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
    marginBottom: spacing.base,
  },
  optionAlt: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconAlt: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.secondaryButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    ...typography.h3,
  },
  optionTitleAlt: {
    ...typography.h3,
  },
  optionBody: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  terms: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.base,
  },
});
