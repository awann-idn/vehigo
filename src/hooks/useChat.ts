import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createDebouncer } from '../lib/debounce';
import {
  fetchChatThreads,
  fetchChatMessages,
  sendChatMessage,
  subscribeToChatMessages,
  fetchChatThread,
  markChatRead,
} from '../api/chat';
import { ChatMessage } from '../api/types';

export function useChatThreads(userId?: string) {
  return useQuery({
    queryKey: ['chatThreads', userId],
    queryFn: () => fetchChatThreads(userId),
  });
}

export function useChatThread(chatId: string, userId?: string) {
  return useQuery({
    queryKey: ['chatThread', chatId, userId],
    queryFn: () => fetchChatThread(chatId, userId),
    enabled: !!chatId,
  });
}

export function useChatMessages(chatId: string, userId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!chatId) return;
    const refresh = createDebouncer(() => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chatThreads'] });
      queryClient.invalidateQueries({ queryKey: ['chatThread', chatId] });
    });
    const unsubscribe = subscribeToChatMessages(chatId, refresh);
    return () => {
      refresh.cancel();
      unsubscribe();
    };
  }, [chatId, queryClient]);

  const query = useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: () => fetchChatMessages(chatId, userId),
    enabled: !!chatId,
  });

  const messageCount = query.data?.length ?? 0;

  // Pesan baru yang masuk saat layar terbuka langsung ditandai terbaca.
  useEffect(() => {
    if (!chatId || messageCount === 0) return;
    markChatRead(chatId)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['chatThreads'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .catch(() => {});
  }, [chatId, messageCount, queryClient]);

  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chatId,
      senderId,
      body,
      kind,
    }: {
      chatId: string;
      senderId: string;
      body: string;
      kind?: 'text' | 'emergency';
    }) => sendChatMessage(chatId, senderId, body, kind),
    onMutate: async ({ chatId, body }) => {
      await queryClient.cancelQueries({ queryKey: ['chatMessages', chatId] });
      const previous = queryClient.getQueryData<ChatMessage[]>(['chatMessages', chatId]);
      const optimistic: ChatMessage = {
        id: `optimistic-${Date.now()}`,
        fromMe: true,
        text: body,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      };
      queryClient.setQueryData<ChatMessage[]>(['chatMessages', chatId], (current) => [
        ...(current ?? []),
        optimistic,
      ]);
      return { previous, chatId };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['chatMessages', context.chatId], context.previous);
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', vars.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chatThreads'] });
    },
  });
}
