import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertTriangle, Send } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { chatMessages, chatThreads } from '../../data/mock';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatDetail'>;

export default function ChatDetailScreen({ navigation, route }: Props) {
  const thread = chatThreads.find((item) => item.id === route.params.id) ?? chatThreads[0];
  const [messages, setMessages] = useState(chatMessages);
  const [draft, setDraft] = useState('');
  const [emergency, setEmergency] = useState(false);

  const send = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `local-${prev.length + 1}`, fromMe: true, text: draft.trim(), time: 'Baru' },
    ]);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={thread.name} onBack={() => navigation.goBack()} />

      <Pressable
        style={[styles.emergency, emergency && styles.emergencyActive]}
        onPress={() => setEmergency((v) => !v)}
      >
        <AlertTriangle size={16} color={emergency ? colors.text.white : colors.danger} />
        <Text style={[styles.emergencyText, emergency && styles.emergencyTextActive]}>
          {emergency ? 'Dering Darurat Aktif — Hubungi 112' : 'Usap ke atas untuk mengaktifkan pesan darurat'}
        </Text>
      </Pressable>

      <View style={styles.messages}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.bubble, message.fromMe ? styles.bubbleMe : styles.bubbleThem]}
          >
            <Text style={[styles.messageText, message.fromMe && styles.messageTextMe]}>
              {message.text}
            </Text>
            <Text style={[styles.time, message.fromMe && styles.timeMe]}>{message.time}</Text>
          </View>
        ))}
      </View>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Tulis pesan..."
          placeholderTextColor={colors.text.muted}
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <Pressable style={styles.send} onPress={send}>
          <Send size={18} color={colors.text.white} />
        </Pressable>
      </View>
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
