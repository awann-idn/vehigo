import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'PilihRole'>;

export default function PilihRoleScreen({ navigation }: Props) {
  const [selectedRole, setSelectedRole] = useState<'penyewa' | 'mitra'>('penyewa');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Selamat datang di Vehigo</Text>
          <Text style={styles.subtitle}>
            Tentukan bagaimana Anda ingin memulai perjalanan bersama kami hari ini.
          </Text>
        </View>

        <View style={styles.roleCardsContainer}>
          {/* Card Penyewa */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedRole === 'penyewa' && styles.selectedCard,
            ]}
            activeOpacity={0.85}
            onPress={() => setSelectedRole('penyewa')}
          >
            <View style={styles.radioHeader}>
              <Text style={styles.roleTitle}>Penyewa</Text>
              <View style={[styles.radioOuter, selectedRole === 'penyewa' && styles.radioOuterActive]}>
                {selectedRole === 'penyewa' && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={styles.roleDescription}>
              Cari kendaraan terbaik dan pesan dengan proses yang aman dan instan.
            </Text>
          </TouchableOpacity>

          {/* Card Mitra */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedRole === 'mitra' && styles.selectedCard,
            ]}
            activeOpacity={0.85}
            onPress={() => setSelectedRole('mitra')}
          >
            <View style={styles.radioHeader}>
              <Text style={styles.roleTitle}>Mitra (Owner)</Text>
              <View style={[styles.radioOuter, selectedRole === 'mitra' && styles.radioOuterActive]}>
                {selectedRole === 'mitra' && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={styles.roleDescription}>
              Daftarkan kendaraan Anda dan mulailah menghasilkan pendapatan pasif.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeHeader}>KEAMANAN TERJAMIN</Text>
          <Text style={styles.noticeText}>
            Setiap peran memerlukan verifikasi identitas resmi (KTP/SIM) untuk menjaga ekosistem tetap aman.
          </Text>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.hintText}>
            Anda dapat mengganti peran nanti melalui pengaturan profil.
          </Text>

          <TouchableOpacity
            style={styles.continueButton}
            activeOpacity={0.8}
            onPress={() => alert(`Role terpilih: ${selectedRole.toUpperCase()}. Lanjut ke tahap berikutnya!`)}
          >
            <Text style={styles.continueButtonText}>LANJUTKAN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.primary,
    lineHeight: 22,
    opacity: 0.8,
  },
  roleCardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  card: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: '#F3F4F8',
  },
  radioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  roleDescription: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  noticeBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: 24,
  },
  noticeHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  noticeText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  footerSection: {
    alignItems: 'center',
  },
  hintText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
