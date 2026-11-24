import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ChevronRight,
  FileText,
  KeyRound,
  LogOut,
  Shield,
  Trash2,
  User,
} from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../features/auth/useAuth';
import { supabase } from '../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { usePreferencesStore } from '../../features/settings/preferencesStore';
import { clearLocalCache } from '../../api/preferences';

type Props = NativeStackScreenProps<RootStackParamList, 'AppSettings'>;

export default function AppSettingsScreen({ navigation }: Props) {
  const { profile, signOut } = useAuth();

  const queryClient = useQueryClient();
  const orderNotif = usePreferencesStore((state) => state.order);
  const chatNotif = usePreferencesStore((state) => state.chat);
  const promoNotif = usePreferencesStore((state) => state.promo);
  const setPref = usePreferencesStore((state) => state.setPref);
  const loadPrefs = usePreferencesStore((state) => state.load);

  useEffect(() => {
    void loadPrefs();
  }, [loadPrefs]);

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Policy Modals
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Perhatian', 'Kata sandi baru minimal harus 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Perhatian', 'Konfirmasi kata sandi tidak cocok.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      Alert.alert('Sukses', 'Kata sandi berhasil diperbarui.');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);
    } catch (err) {
      Alert.alert('Gagal Memperbarui Kata Sandi', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Bersihkan Cache',
      'Apakah Anda yakin ingin membersihkan cache aplikasi? Data login Anda akan tetap tersimpan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Bersihkan',
          style: 'destructive',
          onPress: async () => {
            queryClient.clear();
            await clearLocalCache();
            await loadPrefs();
            Alert.alert('Berhasil', 'Cache sementara aplikasi berhasil dibersihkan.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Keluar dari Akun', 'Apakah Anda yakin ingin keluar dari aplikasi?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const isMitra = profile?.role === 'mitra';

  return (
    <Screen scroll>
      <AppHeader title="Pengaturan Aplikasi" onBack={() => navigation.goBack()} />

      {/* Preferensi Notifikasi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferensi Notifikasi</Text>
        <Card style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Notifikasi Pesanan</Text>
              <Text style={styles.switchDesc}>Pemberitahuan perubahan status & booking</Text>
            </View>
            <Switch
              value={orderNotif}
              onValueChange={(value) => setPref('order', value)}
              trackColor={{ false: colors.stroke, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Pesan Chat</Text>
              <Text style={styles.switchDesc}>Pemberitahuan pesan masuk dari penyewa/mitra</Text>
            </View>
            <Switch
              value={chatNotif}
              onValueChange={(value) => setPref('chat', value)}
              trackColor={{ false: colors.stroke, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Promo & Info Fitur</Text>
              <Text style={styles.switchDesc}>Penawaran spesial dan tips berkendara</Text>
            </View>
            <Switch
              value={promoNotif}
              onValueChange={(value) => setPref('promo', value)}
              trackColor={{ false: colors.stroke, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </Card>
      </View>

      {/* Keamanan & Akun */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Keamanan & Akun</Text>
        <Card style={styles.card}>
          <Pressable
            style={styles.menuRow}
            onPress={() => {
              if (isMitra) {
                navigation.navigate('OwnerBusinessProfile');
              } else {
                navigation.navigate('RenterProfileEdit');
              }
            }}
          >
            <View style={styles.menuLeft}>
              <User size={20} color={colors.primary} />
              <View>
                <Text style={styles.menuTitle}>Ubah Profil</Text>
                <Text style={styles.menuSubtitle}>Nama, kontak, dan info dasar</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.text.muted} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.menuRow} onPress={() => setShowPasswordModal(true)}>
            <View style={styles.menuLeft}>
              <KeyRound size={20} color={colors.primary} />
              <View>
                <Text style={styles.menuTitle}>Ganti Kata Sandi</Text>
                <Text style={styles.menuSubtitle}>Perbarui kata sandi akun Anda</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.text.muted} />
          </Pressable>
        </Card>
      </View>

      {/* Data & Sistem */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sistem & Ketentuan</Text>
        <Card style={styles.card}>
          <Pressable style={styles.menuRow} onPress={handleClearCache}>
            <View style={styles.menuLeft}>
              <Trash2 size={20} color={colors.warning} />
              <View>
                <Text style={styles.menuTitle}>Bersihkan Cache</Text>
                <Text style={styles.menuSubtitle}>Hapus berkas sementara untuk meringankan penyimpanan</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.text.muted} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.menuRow} onPress={() => setShowTermsModal(true)}>
            <View style={styles.menuLeft}>
              <FileText size={20} color={colors.primary} />
              <View>
                <Text style={styles.menuTitle}>Syarat & Ketentuan Layanan</Text>
                <Text style={styles.menuSubtitle}>Aturan sewa dan tanggung jawab pengguna</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.text.muted} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.menuRow} onPress={() => setShowPrivacyModal(true)}>
            <View style={styles.menuLeft}>
              <Shield size={20} color={colors.primary} />
              <View>
                <Text style={styles.menuTitle}>Kebijakan Privasi</Text>
                <Text style={styles.menuSubtitle}>Cara kami mengelola data pribadi Anda</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.text.muted} />
          </Pressable>
        </Card>
      </View>

      {/* App Version Info */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionTitle}>Vehigo Mobile</Text>
        <Text style={styles.versionSubtitle}>Versi 1.0.0 (Build 58)</Text>
      </View>

      {/* Logout */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Keluar dari Akun</Text>
      </Pressable>

      {/* Modal Ganti Password */}
      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ganti Kata Sandi</Text>
            <Text style={styles.modalSubtitle}>Masukkan kata sandi baru untuk akun Anda.</Text>
            <View style={{ gap: spacing.md, marginVertical: spacing.base }}>
              <TextField
                label="Kata Sandi Baru"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Minimal 6 karakter"
                secureTextEntry
              />
              <TextField
                label="Konfirmasi Kata Sandi"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Ulangi kata sandi baru"
                secureTextEntry
              />
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  label={isUpdatingPassword ? 'Menyimpan...' : 'Simpan'}
                  onPress={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Syarat & Ketentuan */}
      <Modal visible={showTermsModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Syarat & Ketentuan Layanan</Text>
            <Text style={styles.modalBodyScroll}>
              1. Penyewa wajib memiliki SIM aktif dan KTP sah yang telah terverifikasi.{'\n\n'}
              2. Unit rental hanya boleh digunakan untuk kegiatan legal dan di bawah batas wilayah yang disepakati.{'\n\n'}
              3. Kerusakan fisik selama masa sewa menjadi tanggung jawab penyewa sesuai klausul asuransi.{'\n\n'}
              4. Mitra bertanggung jawab memastikan kendaraan dalam kondisi prima dan laik jalan.
            </Text>
            <PrimaryButton label="Tutup" onPress={() => setShowTermsModal(false)} />
          </View>
        </View>
      </Modal>

      {/* Modal Kebijakan Privasi */}
      <Modal visible={showPrivacyModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kebijakan Privasi</Text>
            <Text style={styles.modalBodyScroll}>
              Vehigo menjamin keamanan data pribadi Anda. Data identitas (KTP, SIM) hanya digunakan untuk keperluan verifikasi keamanan berkendara dan koordinasi darurat selama masa aktif penyewaan kendaraan. Kami tidak membagikan data identitas kepada pihak ketiga tanpa persetujuan Anda.
            </Text>
            <PrimaryButton label="Tutup" onPress={() => setShowPrivacyModal(false)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.base,
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.xs,
  },
  card: {
    padding: spacing.base,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  switchInfo: {
    flex: 1,
    paddingRight: spacing.base,
  },
  switchLabel: {
    ...typography.h3,
    fontSize: 15,
  },
  switchDesc: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.stroke,
    marginVertical: spacing.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    flex: 1,
  },
  menuTitle: {
    ...typography.h3,
    fontSize: 15,
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: 2,
  },
  versionTitle: {
    ...typography.caption,
    color: colors.text.muted,
    fontWeight: '600',
  },
  versionSubtitle: {
    ...typography.caption,
    color: colors.text.muted,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.base,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    marginBottom: spacing.xl,
  },
  logoutText: {
    ...typography.button,
    color: colors.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.base,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    ...typography.h2,
    marginBottom: 4,
  },
  modalSubtitle: {
    ...typography.bodySm,
    color: colors.text.muted,
  },
  modalBodyScroll: {
    ...typography.body,
    color: colors.text.muted,
    lineHeight: 22,
    marginVertical: spacing.base,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    marginTop: spacing.base,
  },
  modalCancel: {
    paddingVertical: 12,
    paddingHorizontal: spacing.base,
  },
  modalCancelText: {
    ...typography.button,
    color: colors.text.muted,
  },
});
