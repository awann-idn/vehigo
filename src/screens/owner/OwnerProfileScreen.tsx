import React from 'react';
import { useAuth } from '../../features/auth/useAuth';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Bell,
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  ShieldCheck,
  Star,
  User,
} from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { ListItem } from '../../components/ListItem';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerApp'>;

export default function OwnerProfileScreen({ navigation }: Props) {
  const { user, profile, signOut } = useAuth();
  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SR</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{profile?.full_name || user?.email?.split('@')[0] || 'Mitra Vehigo'}</Text>
          <Text style={styles.role}>Mitra â€¢ Terverifikasi</Text>
        </View>
        <Star size={18} color={colors.secondary} />
        <Text style={styles.rating}>4.9</Text>
      </View>

      <Card style={styles.stats}>
        <Stat label="Armada" value="8" />
        <Stat label="Pesanan" value="2.4k" />
        <Stat label="Tahun" value="7 Th." />
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Akun</Text>
        <ListItem icon={User} title="Profil Mitra" subtitle="Ubah data usaha" onPress={() => {}} />
        <ListItem icon={CreditCard} title="Metode Pembayaran" subtitle="Rekening & e-wallet" onPress={() => {}} />
        <ListItem icon={ShieldCheck} title="Keamanan Akun" subtitle="Verifikasi & kata sandi" onPress={() => navigation.navigate('OwnerVerification')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferensi</Text>
        <ListItem icon={Bell} title="Notifikasi" subtitle="Pesanan & pengingat" onPress={() => {}} />
        <ListItem icon={Settings} title="Pengaturan Aplikasi" onPress={() => {}} />
        <ListItem icon={HelpCircle} title="Pusat Bantuan" onPress={() => {}} />
      </View>

      <Pressable style={styles.logout} onPress={async () => { await signOut(); navigation.replace('Login'); }}>
        <LogOut size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Keluar dari Akun</Text>
      </Pressable>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.base,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h3,
    color: colors.text.white,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.h3,
  },
  role: {
    ...typography.caption,
    color: colors.text.muted,
  },
  rating: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.secondary,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  statValue: {
    ...typography.h3,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  logoutText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.danger,
  },
});

