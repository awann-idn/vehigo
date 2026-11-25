import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertTriangle, Camera, Check, CheckCheck, Image as ImageIcon, Paperclip, Send, ShoppingBag, X } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../features/auth/useAuth';
import { useChatMessages, useChatThread, useSendMessage } from '../../hooks/useChat';
import { pickAndCompressImage, uploadDocument } from '../../lib/storage';
import { useOrder } from '../../hooks/useOrders';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatDetail'>;

export default function ChatDetailScreen({ navigation, route }: Props) {
  const { user, profile } = useAuth();
  const { data } = useChatMessages(route.params.id, user?.id);
  const { data: thread } = useChatThread(route.params.id, user?.id);
  const sendMessage = useSendMessage();
  const messages = data ?? [];
  const [draft, setDraft] = useState('');
  const [emergency] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const { data: order } = useOrder(thread?.orderId ?? '');
  const scrollViewRef = useRef<any>(null);

  const handleEmergencyCall = useCallback(async () => {
    const rawPhone = thread?.phone?.trim();
    if (!rawPhone) {
      Alert.alert(
        'Nomor Tidak Tersedia',
        'Nomor telepon mitra belum terdaftar pada profil akun mitra.',
        [{ text: 'OK' }]
      );
      return;
    }

    const cleaned = rawPhone.replace(/[^\d+]/g, '');
    const telUrl = `tel:${cleaned}`;

    try {
      await Linking.openURL(telUrl);

      if (user) {
        sendMessage.mutate({
          chatId: route.params.id,
          senderId: user.id,
          body: 'ðŸš¨ [DARURAT] Penyewa menghubungi Mitra melalui panggilan darurat.',
          kind: 'emergency',
        });
      }
    } catch (err) {
      Alert.alert('Gagal Melakukan Panggilan', err instanceof Error ? err.message : 'Silakan coba lagi.');
    }
  }, [thread?.phone, user, sendMessage, route.params.id]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy < -20 || (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10)) {
            handleEmergencyCall();
          }
        },
      }),
    [handleEmergencyCall]
  );

  const sendImage = async () => {
    if (!user) {
      Alert.alert('Login diperlukan', 'Silakan login untuk mengirim lampiran.');
      return;
    }
    try {
      setAttachOpen(false);
      const uri = await pickAndCompressImage([4, 3]);
      if (!uri) return;
      setUploadingAttachment(true);
      const upload = await uploadDocument(user.id, 'vehicle', uri);
      await sendMessage.mutateAsync({
        chatId: route.params.id,
        senderId: user.id,
        body: `Lampiran gambar: ${upload.path}`,
        kind: 'image',
      });
      Alert.alert('Terkirim', `Lampiran gambar tercatat dengan path ${upload.path}.`);
    } catch (error) {
      Alert.alert('Gagal mengirim lampiran', error instanceof Error ? error.message : 'Coba lagi.');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const sendOrderCard = async () => {
    if (!user || !order) {
      Alert.alert('Pesanan tidak tersedia', 'Buka chat dari halaman detail pesanan untuk mengirim kartu pesanan.');
      return;
    }
    try {
      setAttachOpen(false);
      await sendMessage.mutateAsync({
        chatId: route.params.id,
        senderId: user.id,
        body: `Pesanan ${order.code} • ${order.vehicle} • ${order.start} – ${order.end}`,
        kind: 'order',
      });
    } catch (error) {
      Alert.alert('Gagal mengirim pesanan', error instanceof Error ? error.message : 'Coba lagi.');
    }
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || sendMessage.isPending) return;
    setDraft('');

    if (!user) {
      Alert.alert('Login diperlukan', 'Silakan login untuk mengirim pesan.');
      return;
    }

    try {
      await sendMessage.mutateAsync({
        chatId: route.params.id,
        senderId: user.id,
        body: emergency ? `[DARURAT] ${text}` : text,
        kind: emergency ? 'emergency' : 'text',
      });
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      setDraft(text);
      Alert.alert('Pesan gagal dikirim', error instanceof Error ? error.message : 'Coba lagi.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={thread?.name ?? 'Chat'} onBack={() => navigation.goBack()} />

      {profile?.role !== 'mitra' ? (
        <View
          {...panResponder.panHandlers}
          style={[styles.emergency, emergency && styles.emergencyActive]}
        >
          <AlertTriangle size={16} color={emergency ? colors.text.white : colors.danger} />
          <Text style={[styles.emergencyText, emergency && styles.emergencyTextActive]}>
            {thread?.phone
              ? `Usap ke atas untuk panggilan darurat (${thread.name})`
              : 'Usap ke atas untuk mengaktifkan panggilan darurat'}
          </Text>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messages}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <Text style={{ ...typography.caption, color: colors.text.muted, textAlign: 'center', marginTop: spacing.xl }}>
              Belum ada pesan. Mulai percakapan dengan mengetik di bawah.
            </Text>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                style={[styles.bubble, message.fromMe ? styles.bubbleMe : styles.bubbleThem]}
              >
                <Text style={[styles.messageText, message.fromMe && styles.messageTextMe]}>
                  {message.text}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.time, message.fromMe && styles.timeMe]}>{message.time}</Text>
                  {message.fromMe ? (
                    message.read ? (
                      <CheckCheck size={12} color={message.fromMe ? 'rgba(255,255,255,0.9)' : colors.text.muted} />
                    ) : (
                      <Check size={12} color={message.fromMe ? 'rgba(255,255,255,0.7)' : colors.text.muted} />
                    )
                  ) : null}
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <Pressable style={styles.attach} onPress={() => setAttachOpen(true)} disabled={uploadingAttachment}>
            <Paperclip size={18} color={colors.primary} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Tulis pesan..."
            placeholderTextColor={colors.text.muted}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <Pressable style={styles.send} onPress={send} disabled={sendMessage.isPending}>
            <Send size={18} color={colors.text.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={attachOpen} transparent animationType="slide" onRequestClose={() => setAttachOpen(false)}>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Kirim Lampiran</Text>
              <Pressable onPress={() => setAttachOpen(false)} hitSlop={10}>
                <X size={20} color={colors.text.primary} />
              </Pressable>
            </View>
            <View style={styles.sheetOptions}>
              <Pressable style={styles.sheetOption} onPress={sendImage}>
                <View style={styles.sheetIcon}><ImageIcon size={22} color={colors.primary} /></View>
                <Text style={styles.sheetLabel}>GAMBAR</Text>
              </Pressable>
              <Pressable style={styles.sheetOption} onPress={sendImage}>
                <View style={styles.sheetIcon}><Camera size={22} color={colors.primary} /></View>
                <Text style={styles.sheetLabel}>KAMERA</Text>
              </Pressable>
              <Pressable style={styles.sheetOption} onPress={sendOrderCard}>
                <View style={styles.sheetIcon}><ShoppingBag size={22} color={colors.primary} /></View>
                <Text style={styles.sheetLabel}>PESANAN</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  emergency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(180,35,24,0.08)',
    marginBottom: spacing.base,
  },
  emergencyActive: {
    backgroundColor: colors.danger,
  },
  emergencyText: {
    ...typography.caption,
    flex: 1,
    color: colors.danger,
    fontWeight: '600',
  },
  emergencyTextActive: {
    color: colors.text.white,
  },
  messages: {
    flex: 1,
    gap: spacing.sm,
  },
  bubble: {
    maxWidth: '82%',
    padding: spacing.md,
    borderRadius: 16,
    gap: 2,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
  },
  messageText: {
    ...typography.bodySm,
    color: colors.text.primary,
  },
  messageTextMe: {
    color: colors.text.white,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 3,
  },
  time: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 9,
    alignSelf: 'flex-end',
  },
  timeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  attach: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,33,56,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { ...typography.h3 },
  sheetOptions: { flexDirection: 'row', justifyContent: 'space-around' },
  sheetOption: { alignItems: 'center', gap: spacing.sm },
  sheetIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetLabel: { ...typography.caption, fontFamily: 'Manrope_800ExtraBold', color: colors.text.primary },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    ...typography.bodySm,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
