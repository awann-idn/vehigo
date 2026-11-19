import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertTriangle, BellRing, CheckCircle2 } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../features/auth/useAuth';
import { useMarkNotificationRead, useNotifications } from '../../hooks/useNotifications';

type Props = NativeStackScreenProps<RootStackParamList, 'RenterApp'>;

const toneIcon = {
  success: CheckCircle2,
  info: BellRing,
  warning: AlertTriangle,
};

export default function NotificationsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { data: ownerNotifications = [] } = useNotifications(user?.id);
  const markRead = useMarkNotificationRead();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Notifikasi</Text>
        <Text style={styles.subtitle}>Informasi pesanan dan penawaran terbaru</Text>
      </View>

      {ownerNotifications.map((item) => {
        const Icon = toneIcon[item.tone];
        return (
          <Pressable key={item.id} style={styles.card} onPress={() => markRead.mutate(item.id)}>
            <View style={styles.iconBadge}>
              <Icon
                size={18}
                color={
                  item.tone === 'success'
                    ? colors.success
                    : item.tone === 'warning'
                      ? colors.warning
                      : colors.primary
                }
              />
            </View>
            <View style={styles.text}>
              <Text style={styles.time}>{item.time}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.body}</Text>
            </View>
          </Pressable>
        );
      })}
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
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.stroke,
    marginBottom: spacing.md,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  time: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  cardTitle: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  cardBody: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 17,
  },
});
