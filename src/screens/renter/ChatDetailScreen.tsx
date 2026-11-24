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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertTriangle, Check, CheckCheck, Send } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../features/auth/useAuth';
import { useChatMessages, useChatThread, useSendMessage } from '../../hooks/useChat';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatDetail'>;

export default function ChatDetailScreen({ navigation, route }: Props) {
  const { user, profile } = useAuth();
  const { data } = useChatMessages(route.params.id, user?.id);
  const { data: thread } = useChatThread(route.params.id, user?.id);
  const sendMessage = useSendMessage();
  const messages = data ?? [];
  const [draft, setDraft] = useState('');
  const [emergency] = useState(false);
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
          body: '🚨 [DARURAT] Penyewa menghubungi Mitra melalui panggilan darurat.',
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
