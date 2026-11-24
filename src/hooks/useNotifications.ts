import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createDebouncer } from '../lib/debounce';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
  markLinkRead,
} from '../api/notifications';
import { NotificationItem } from '../api/types';
import { usePreferencesStore } from '../features/settings/preferencesStore';

export function useNotifications(userId?: string) {
  const queryClient = useQueryClient();
  const orderEnabled = usePreferencesStore((state) => state.order);
  const chatEnabled = usePreferencesStore((state) => state.chat);
  const promoEnabled = usePreferencesStore((state) => state.promo);
  const loaded = usePreferencesStore((state) => state.loaded);

  useEffect(() => {
    if (!userId) return;
    const loadPreferences = usePreferencesStore.getState().load;
    void loadPreferences();
    const refresh = createDebouncer(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    });
    const unsubscribe = subscribeToNotifications(userId, refresh);
    return () => {
      refresh.cancel();
      unsubscribe();
    };
  }, [userId, queryClient]);

  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => fetchNotifications(userId),
    enabled: !!userId,
  });

  const data = query.data?.filter((item) => {
    if (item.category === 'chat') return chatEnabled;
    if (item.category === 'promo') return promoEnabled;
    return orderEnabled;
  });

  return { ...query, data: data && loaded ? data : query.data };
}

export function useUnreadNotificationsCount(userId?: string) {
  // Tanpa subscription sendiri agar tidak membuat channel ganda dengan layar notifikasi.
  const orderEnabled = usePreferencesStore((state) => state.order);
  const chatEnabled = usePreferencesStore((state) => state.chat);
  const promoEnabled = usePreferencesStore((state) => state.promo);
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => fetchNotifications(userId),
    enabled: !!userId,
  });
  return notifications.filter((n) => {
    if (n.read) return false;
    if (n.category === 'chat') return chatEnabled;
    if (n.category === 'promo') return promoEnabled;
    return orderEnabled;
  }).length;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      queryClient.setQueriesData<NotificationItem[]>({ queryKey: ['notifications'] }, (current) =>
        current?.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkLinkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ linkType, linkId }: { linkType: 'chat' | 'order'; linkId: string }) =>
      markLinkRead(linkType, linkId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      queryClient.setQueriesData<NotificationItem[]>({ queryKey: ['notifications'] }, (current) =>
        current?.map((item) => ({ ...item, read: true }))
      );
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
