import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Car, KeyRound, ShieldCheck } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useAuth } from '../features/auth/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'PilihRole'>;
type Role = 'penyewa' | 'mitra';

export default function PilihRoleScreen({ navigation }: Props) {
  const [role, setRole] = useState<Role>('penyewa');
  const [loading, setLoading] = useState(false);
  const { updateRole } = useAuth();

  const handleContinue = async () => {
    try {
      setLoading(true);
      await updateRole(role);
      navigation.replace(role === 'mitra' ? 'OwnerReg1' : 'RenterApp');
    } catch (error) {
      Alert.alert('Role belum tersimpan', error instanceof Error ? error.message : 'Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Pilih Peran" onBack={() => navigation.goBack()} />

      <View style={styles.header}>
        <Text style={styles.title}>Selamat datang di Vehigo</Text>
        <Text style={styles.subtitle}>
          Tentukan bagaimana Anda ingin memulai perjalanan bersama kami hari ini.
        </Text>
      </View>

      <View style={styles.cards}>
        <RoleCard
          title="Penyewa"
          description="Cari kendaraan terbaik dan pesan dengan proses yang aman dan instan."
          icon={<Car size={26} color={role === 'penyewa' ? colors.text.white : colors.primary} />}
          active={role === 'penyewa'}
          onPress={() => setRole('penyewa')}
        />
        <RoleCard
          title="Mitra"
          description="Daftarkan kendaraan Anda dan mulailah menghasilkan pendapatan pasif."
          icon={<KeyRound size={26} color={role === 'mitra' ? colors.text.white : colors.primary} />}
          active={role === 'mitra'}
          onPress={() => setRole('mitra')}
        />
      </View>

      <View style={styles.notice}>
        <ShieldCheck size={20} color={colors.primary} />
        <View style={styles.noticeText}>
          <Text style={styles.noticeTitle}>KEAMANAN TERJAMIN</Text>
          <Text style={styles.noticeBody}>
            Setiap peran memerlukan verifikasi identitas resmi (KTP/SIM) untuk menjaga
            ekosistem tetap aman.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.hint}>Anda dapat mengganti peran nanti melalui pengaturan profil.</Text>
        <PrimaryButton
          label={loading ? "MENYIMPAN..." : "Lanjutkan"}
          disabled={loading}
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
}

function RoleCard({
  title,
  description,
  icon,
  active,
  onPress,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.card, active && styles.cardActive]}>
      <View style={[styles.iconBadge, active && styles.iconBadgeActive]}>{icon}</View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <View style={[styles.radio, active && styles.radioActive]}>
        {active ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  header: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  cards: {
    gap: spacing.base,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    padding: spacing.base,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeActive: {
    backgroundColor: colors.primary,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    ...typography.h3,
  },
  cardDescription: {
    ...typography.bodySm,
    color: colors.text.secondary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginTop: spacing.lg,
  },
  noticeText: {
    flex: 1,
    gap: 3,
  },
  noticeTitle: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  noticeBody: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  hint: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.text.muted,
  },
});
