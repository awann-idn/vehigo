import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, BellRing, CheckCheck, CheckCircle2 } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../features/auth/useAuth';
import { markAllNotificationsRead } from '../../api/notifications';
import {
  useMarkAllNotificationsRead,
  useMarkLinkRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../hooks/useNotifications';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerApp'>;

const toneIcon = {
  success: CheckCircle2,
  info: BellRing,
  warning: AlertTriangle,
};

export default function OwnerAlertsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { data: ownerNotifications = [], isLoading } = useNotifications(user?.id);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const markLink = useMarkLinkRead();

  const unreadCount = ownerNotifications.filter((n) => !n.read).length;

  const grouped = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 86400000).toDateString();
    return [
      { title: 'HARI INI', items: ownerNotifications.filter((item) => item.createdAt && new Date(item.createdAt).toDateString() === today) },
      { title: 'KEMARIN', items: ownerNotifications.filter((item) => item.createdAt && new Date(item.createdAt).toDateString() === yesterday) },
      { title: 'LAINNYA', items: ownerNotifications.filter((item) => !item.createdAt || ![today, yesterday].includes(new Date(item.createdAt).toDateString())) },
    ].filter((group) => group.items.length > 0);
  }, [ownerNotifications]);

  const queryClient = useQueryClient();

  // Saat tab notifikasi dibuka, tandai semua terbaca sekali.
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      let active = true;
      markAllNotificationsRead(user.id)
        .then(() => {
          if (active) {
            queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          }
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [user, queryClient])
  );

  const openNotification = (item: (typeof ownerNotifications)[number]) => {
    if (!item.read) markRead.mutate(item.id);
    if (item.linkType && item.linkId) {
      markLink.mutate({ linkType: item.linkType, linkId: item.linkId });
      if (item.linkType === 'chat') {
        navigation.navigate('OwnerChatDetail', { id: item.linkId });
      } else {
        navigation.navigate('OwnerOrderDetail', { id: item.linkId });
      }
      return;
    }
    if (item.category === 'chat') {
      (navigation as any).navigate('Pesanan');
    } else {
      (navigation as any).navigate('Pesanan');
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Notifikasi</Text>
            <Text style={styles.subtitle}>Aktivitas terbaru seputar usaha Anda</Text>
          </View>
          {unreadCount > 0 && user?.id ? (
            <Pressable
              style={styles.markAllButton}
              onPress={() => markAllRead.mutate(user.id)}
              disabled={markAllRead.isPending}
            >
              <CheckCheck size={16} color={colors.primary} />
              <Text style={styles.markAllText}>Tandai dibaca</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : ownerNotifications.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="Belum ada notifikasi"
          message="Aktivitas pesanan, pencairan saldo, dan peringatan armada akan tampil di sini."
        />
      ) : (
        <View style={styles.list}>
          {grouped.map((group) => (
            <View key={group.title} style={styles.group}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              {group.items.map((item) => {
            const Icon = toneIcon[item.tone];
            return (
              <Pressable
                key={item.id}
                style={[styles.card, item.read && styles.cardRead]}
                onPress={() => openNotification(item)}
              >
                <View style={[styles.iconBadge, item.read && styles.iconBadgeRead]}>
                  <Icon
                    size={18}
                    color={
                      item.read
                        ? colors.text.muted
                        : item.tone === 'success'
                          ? colors.success
                          : item.tone === 'warning'
                            ? colors.warning
                            : colors.primary
                    }
                  />
                </View>
                <View style={styles.cardText}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.time}>{item.time}</Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={[styles.cardTitle, item.read && styles.cardTitleRead]}>{item.title}</Text>
                  <Text style={[styles.cardBody, item.read && styles.cardBodyRead]}>{item.body}</Text>
                </View>
              </Pressable>
            );
              })}
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.base,
    gap: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.text.muted,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  markAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  group: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  groupTitle: {
    ...typography.label,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  list: {
    gap: spacing.md,
    marginTop: spacing.base,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  cardRead: {
    opacity: 0.7,
    backgroundColor: colors.card,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeRead: {
    backgroundColor: colors.surface,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  time: {
    ...typography.caption,
    color: colors.text.muted,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 16,
  },
  cardTitleRead: {
    color: colors.text.muted,
  },
  cardBody: {
    ...typography.bodySm,
    color: colors.text.muted,
  },
  cardBodyRead: {
    color: colors.text.muted,
  },
});
