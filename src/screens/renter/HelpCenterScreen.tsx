import React, { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ChevronDown,
  ChevronUp,
  Mail,
  MessageCircle,
} from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Card } from '../../components/Card';
import { TextField } from '../../components/TextField';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpCenter'>;

const CS_WHATSAPP_NUMBER = '6281200000000';
const CS_EMAIL = 'support@vehigo.id';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'booking' | 'payment' | 'mitra' | 'emergency';
}

const FAQ_LIST: FAQItem[] = [
  {
    id: '1',
    category: 'booking',
    question: 'Bagaimana cara menyewa kendaraan di Vehigo?',
    answer:
      'Pilih kendaraan yang tersedia di halaman Beranda atau Cari, tentukan tanggal sewa dan jam pengambilan, lalu selesaikan verifikasi identitas dan konfirmasi pemesanan.',
  },
  {
    id: '2',
    category: 'booking',
    question: 'Apakah saya bisa membatalkan pesanan yang sudah dibayar?',
    answer:
      'Pembatalan dapat dilakukan sebelum kendaraan diserahkan oleh Mitra. Kebijakan pengembalian dana mengacu pada ketentuan waktu pembatalan di Syarat & Ketentuan.',
  },
  {
    id: '3',
    category: 'payment',
    question: 'Metode pembayaran apa saja yang didukung?',
    answer:
      'Saat ini sistem mendukung simulasi pembayaran QRIS, Transfer Bank Virtual Account, dan dompet digital yang akan langsung mengonfirmasi status sewa Anda.',
  },
  {
    id: '4',
    category: 'emergency',
    question: 'Apa yang harus dilakukan jika terjadi kendala pada kendaraan di jalan?',
    answer:
      'Buka menu Chat pesanan aktif Anda dan gunakan fitur Panggilan Darurat untuk langsung menghubungi Mitra pemilik unit. Anda juga dapat menghubungi layanan bantuan Vehigo.',
  },
  {
    id: '5',
    category: 'mitra',
    question: 'Bagaimana cara mendaftar menjadi Mitra Vehigo?',
    answer:
      'Di profil akun, pilih opsi "Ganti Peran Menjadi Mitra", lengkapi formulir pendaftaran 5 langkah, dan unggah dokumen verifikasi usaha serta armada Anda.',
  },
  {
    id: '6',
    category: 'mitra',
    question: 'Kapan pencairan dana sewa masuk ke rekening Mitra?',
    answer:
      'Pencairan dana sewa diproses otomatis setelah masa sewa selesai dan serah-terima pengembalian kendaraan telah dikonfirmasi oleh kedua belah pihak.',
  },
  {
    id: '7',
    category: 'booking',
    question: 'Dokumen apa yang dibutuhkan untuk menyewa?',
    answer:
      'Penyewa wajib melampirkan foto KTP yang masih berlaku dan SIM (SIM A untuk mobil atau SIM C untuk motor) saat pertama kali melakukan verifikasi profil.',
  },
  {
    id: '8',
    category: 'emergency',
    question: 'Bagaimana jika kendaraan mengalami kecelakaan?',
    answer:
      'Prioritaskan keselamatan Anda, segera hubungi nomor kontak darurat mitra melalui tombol darurat di chat, dan laporkan kondisi kendaraan melalui form inspeksi akhir.',
  },
];

export default function HelpCenterScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('1');

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return FAQ_LIST;
    return FAQ_LIST.filter(
      (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleOpenWhatsApp = async () => {
    const message = encodeURIComponent('Halo Tim Bantuan Vehigo, saya memerlukan bantuan terkait aplikasi.');
    const waUrl = `https://wa.me/${CS_WHATSAPP_NUMBER}?text=${message}`;

    try {
      await Linking.openURL(waUrl);
    } catch {
      Alert.alert('Gagal Membuka WhatsApp', `Silakan hubungi WhatsApp kami langsung di +${CS_WHATSAPP_NUMBER}`);
    }
  };

  const handleOpenEmail = async () => {
    const mailUrl = `mailto:${CS_EMAIL}?subject=${encodeURIComponent('Pusat Bantuan Vehigo')}`;
    try {
      await Linking.openURL(mailUrl);
    } catch {
      Alert.alert('Gagal Membuka Email', `Silakan kirim pesan ke email: ${CS_EMAIL}`);
    }
  };

  return (
    <Screen scroll>
      <AppHeader title="Pusat Bantuan" onBack={() => navigation.goBack()} />

      {/* Hero CTA Contact Card */}
      <Card style={styles.contactCard}>
        <Text style={styles.contactTitle}>Butuh bantuan lebih lanjut?</Text>
        <Text style={styles.contactSubtitle}>
          Tim dukungan pelanggan Vehigo siap membantu kendala operasional dan transaksi Anda.
        </Text>
        <View style={styles.contactActions}>
          <Pressable style={styles.actionButtonWa} onPress={handleOpenWhatsApp}>
            <MessageCircle size={18} color={colors.surface} />
            <Text style={styles.actionWaText}>WhatsApp CS</Text>
          </Pressable>
          <Pressable style={styles.actionButtonEmail} onPress={handleOpenEmail}>
            <Mail size={18} color={colors.primary} />
            <Text style={styles.actionEmailText}>Kirim Email</Text>
          </Pressable>
        </View>
      </Card>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <TextField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari kendala, cara booking, dll..."
        />
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.faqSectionTitle}>Pertanyaan yang Sering Diajukan (FAQ)</Text>

        {filteredFaqs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada topik bantuan yang cocok dengan &quot;{searchQuery}&quot;</Text>
          </View>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <Card key={faq.id} style={styles.faqCard}>
                <Pressable
                  style={styles.faqHeader}
                  onPress={() => setExpandedId(isExpanded ? null : faq.id)}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  {isExpanded ? (
                    <ChevronUp size={20} color={colors.text.muted} />
                  ) : (
                    <ChevronDown size={20} color={colors.text.muted} />
                  )}
                </Pressable>
                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </Card>
            );
          })
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contactCard: {
    backgroundColor: colors.primary,
    padding: spacing.base,
    borderRadius: 20,
    marginTop: spacing.sm,
  },
  contactTitle: {
    ...typography.h3,
    color: colors.surface,
  },
  contactSubtitle: {
    ...typography.bodySm,
    color: colors.surface,
    opacity: 0.85,
    marginTop: 4,
    lineHeight: 18,
  },
  contactActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  actionButtonWa: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionWaText: {
    ...typography.button,
    color: colors.surface,
    fontSize: 13,
  },
  actionButtonEmail: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionEmailText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 13,
  },
  searchSection: {
    marginTop: spacing.base,
  },
  faqSection: {
    marginTop: spacing.base,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  faqSectionTitle: {
    ...typography.caption,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  faqCard: {
    padding: spacing.base,
    borderRadius: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  faqQuestion: {
    ...typography.h3,
    fontSize: 15,
    flex: 1,
  },
  faqAnswerContainer: {
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.stroke,
    marginVertical: spacing.sm,
  },
  faqAnswer: {
    ...typography.bodySm,
    color: colors.text.muted,
    lineHeight: 20,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodySm,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
