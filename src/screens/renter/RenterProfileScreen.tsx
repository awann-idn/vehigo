import React from 'react';
import { useAuth } from '../../features/auth/useAuth';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { ListItem } from '../../components/ListItem';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'RenterApp'>;

export default function RenterProfileScreen({ navigation }: Props) {
  const { user, profile, signOut } = useAuth();
  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>BS</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{profile?.full_name || user?.email?.split('@')[0] || 'Tamu Vehigo'}</Text>
          <Text style={styles.role}>{profile?.role === 'mitra' ? 'Mitra' : 'Penyewa'}</Text>
        </View>
        <ChevronRight size={18} color={colors.text.muted} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Akun</Text>
        <ListItem icon={User} title="Profil Saya" subtitle="Ubah data diri" onPress={() => {}} />
        <ListItem icon={ShieldCheck} title="Verifikasi Identitas" subtitle="KTP & SIM" onPress={() => {}} />
        <ListItem icon={CreditCard} title="Metode Pembayaran" subtitle="E-wallet & bank" onPress={() => {}} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferensi</Text>
        <ListItem icon={Bell} title="Notifikasi" onPress={() => navigation.navigate('RenterApp')} />
        <ListItem icon={Settings} title="Pengaturan Aplikasi" onPress={() => {}} />
        <ListItem icon={HelpCircle} title="Pusat Bantuan" onPress={() => {}} />
        <ListItem icon={ShieldCheck} title="Syarat & Ketentuan" onPress={() => navigation.navigate('Terms')} />
      </View>

      <Pressable style={styles.switchRole} onPress={() => navigation.navigate('PilihRole')}>
        <Text style={styles.switchText}>
          Ingin menyewakan kendaraan? Ganti peran menjadi Mitra kapan saja.
        </Text>
      </Pressable>

      <Pressable style={styles.logout} onPress={async () => { await signOut(); navigation.replace('Login'); }}>
        <LogOut size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Keluar dari Akun</Text>
      </Pressable>
    </Screen>
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
  section: {
    marginTop: spacing.base,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  switchRole: {
    marginTop: spacing.lg,
    padding: spacing.base,
    borderRadius: 14,
    backgroundColor: colors.secondaryButton,
  },
  switchText: {
    ...typography.caption,
    color: colors.primary,
    textAlign: 'center',
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

