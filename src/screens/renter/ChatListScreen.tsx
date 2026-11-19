import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MessageCircle } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../features/auth/useAuth';
import { useChatThreads } from '../../hooks/useChat';

type Props = NativeStackScreenProps<RootStackParamList, 'RenterApp'>;

export default function ChatListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { data: chatThreads = [] } = useChatThreads(user?.id);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.subtitle}>Obrolan Anda dengan mitra</Text>
      </View>

      <View style={styles.list}>
        {chatThreads.map((thread) => (
          <Pressable
            key={thread.id}
            style={styles.row}
            onPress={() => navigation.navigate('ChatDetail', { id: thread.id })}
          >
            <View style={styles.avatar}>
              <MessageCircle size={20} color={colors.primary} />
              {thread.online ? <View style={styles.online} /> : null}
            </View>
            <View style={styles.text}>
              <Text style={styles.name}>{thread.name}</Text>
              <Text style={styles.last} numberOfLines={1}>
                {thread.lastMessage}
              </Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.time}>{thread.time}</Text>
              {thread.unread > 0 ? (
                <View style={styles.unread}>
                  <Text style={styles.unreadText}>{thread.unread}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.base,
    gap: 2,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.text.muted,
  },
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  online: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  last: {
    ...typography.caption,
    color: colors.text.muted,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  time: {
    ...typography.caption,
    color: colors.text.muted,
  },
  unread: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    ...typography.caption,
    color: colors.text.white,
    fontWeight: '700',
  },
});
