import React from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatRupiah } from '../../lib/formatters';
import { useAuth } from '../../features/auth/useAuth';
import { useAdminOverview, useSetUserStatus, useVerifyMitra } from '../../hooks/useAdmin';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminApp'>;

const countLabels: Record<string, string> = {
  users: 'Pengguna',
  mitras: 'Mitra',
  vehicles: 'Kendaraan',
  orders: 'Pesanan',
};

export default function AdminDashboardScreen(_props: Props) {
  const { profile, isLoading } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const { data: overview, isLoading: loading, error } = useAdminOverview(isAdmin);
  const verify = useVerifyMitra();
  const userStatus = useSetUserStatus();

  const handleVerify = (userId: string, verification: 'verified' | 'rejected') => {
    verify.mutate(
      { userId, verification },
      { onError: (err) => Alert.alert('Gagal', err.message) }
    );
  };

  const handleUserStatus = (userId: string, status: 'active' | 'suspended') => {
    userStatus.mutate(
      { userId, status },
      { onError: (err) => Alert.alert('Gagal', err.message) }
    );
  };

  if (Platform.OS !== 'web') {
    return (
      <Screen>
        <Text style={styles.muted}>Dashboard admin tersedia melalui website.</Text>
      </Screen>
    );
  }
  if (isLoading) return <Screen><ActivityIndicator color={colors.primary} /></Screen>;
  if (profile?.role !== 'admin') {
    return (
      <Screen>
        <Text style={styles.muted}>Akses admin ditolak.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Dashboard Admin</Text>
      <Text style={styles.subtitle}>Verifikasi mitra, pantau pesanan, dan kelola pengguna.</Text>

      {loading && !overview ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : null}
      {error ? <Text style={styles.error}>{error.message}</Text> : null}

      {overview ? (
        <>
          <View style={styles.grid}>
            {Object.entries(overview.counts).map(([label, value]) => (
              <View key={label} style={styles.card}>
                <Text style={styles.value}>{value}</Text>
                <Text style={styles.label}>{countLabels[label] ?? label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>MITRA MENUNGGU VERIFIKASI</Text>
          {overview.pendingMitras.length === 0 ? (
            <Text style={styles.muted}>Tidak ada mitra yang menunggu verifikasi.</Text>
          ) : (
            overview.pendingMitras.map((mitra) => (
              <View key={mitra.userId} style={styles.rowCard}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{mitra.businessName}</Text>
                  <Text style={styles.rowSub}>
                    {mitra.ownerName || 'Nama pemilik belum diisi'}
                  </Text>
                  <Text style={styles.rowSub}>{mitra.address || 'Alamat belum diisi'}</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    style={[styles.action, styles.actionPrimary]}
                    onPress={() => handleVerify(mitra.userId, 'verified')}
                  >
                    <Text style={styles.actionPrimaryText}>Verifikasi</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.action, styles.actionDanger]}
                    onPress={() => handleVerify(mitra.userId, 'rejected')}
                  >
                    <Text style={styles.actionDangerText}>Tolak</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>PESANAN TERBARU</Text>
          {overview.recentOrders.length === 0 ? (
            <Text style={styles.muted}>Belum ada pesanan.</Text>
          ) : (
            overview.recentOrders.map((order) => (
              <View key={order.id} style={styles.rowCard}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{order.code}</Text>
                  <Text style={styles.rowSub}>
                    {order.renter || 'Penyewa'} → {order.mitra || 'Mitra'}
                  </Text>
                  <Text style={styles.rowSub}>{order.status}</Text>
                </View>
                <Text style={styles.amount}>{formatRupiah(order.total)}</Text>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>PENGGUNA</Text>
          {overview.users.map((user) => (
            <View key={user.id} style={styles.rowCard}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{user.fullName || 'Tanpa nama'}</Text>
                <Text style={styles.rowSub}>
                  {user.role} • {user.status}
                </Text>
              </View>
              <Pressable
                style={[
                  styles.action,
                  user.status === 'suspended' ? styles.actionPrimary : styles.actionDanger,
                ]}
                onPress={() =>
                  handleUserStatus(user.id, user.status === 'suspended' ? 'active' : 'suspended')
                }
              >
                <Text
                  style={
                    user.status === 'suspended'
                      ? styles.actionPrimaryText
                      : styles.actionDangerText
                  }
                >
                  {user.status === 'suspended' ? 'Aktifkan' : 'Suspend'}
                </Text>
              </Pressable>
            </View>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1 },
  subtitle: { ...typography.bodySm, color: colors.text.muted, marginTop: spacing.sm },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  card: {
    width: '22%',
    minWidth: 140,
    padding: spacing.base,
    borderRadius: 14,
    backgroundColor: colors.card,
  },
  value: { ...typography.h1 },
  label: { ...typography.caption, color: colors.text.muted },
  sectionTitle: {
    ...typography.label,
    color: colors.text.muted,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.stroke,
    marginBottom: spacing.sm,
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { ...typography.bodySm, fontWeight: '700' },
  rowSub: { ...typography.caption, color: colors.text.secondary },
  amount: { ...typography.bodySm, fontWeight: '700', color: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionPrimaryText: { ...typography.caption, fontWeight: '700', color: colors.text.white },
  actionDanger: { borderColor: colors.danger },
  actionDangerText: { ...typography.caption, fontWeight: '700', color: colors.danger },
  muted: { ...typography.bodySm, color: colors.text.muted },
  error: { ...typography.bodySm, color: colors.danger, marginTop: spacing.md },
});
