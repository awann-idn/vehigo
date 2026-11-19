import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  fetchChatThreads,
  fetchChatMessages,
  sendChatMessage,
  subscribeToChatMessages,
  fetchChatThread,
  markChatRead,
} from '../api/chat';

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
    const unsubscribe = subscribeToChatMessages(chatId, () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chatThreads'] });
      queryClient.invalidateQueries({ queryKey: ['chatThread', chatId] });
    });
    return () => {
      unsubscribe();
    };
  }, [chatId, queryClient]);

  useEffect(() => {
    if (!chatId) return;
    markChatRead(chatId)
      .then(() => queryClient.invalidateQueries({ queryKey: ['chatThreads'] }))
      .catch(() => {});
  }, [chatId, queryClient]);

  return useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: () => fetchChatMessages(chatId, userId),
    enabled: !!chatId,
  });
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
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', vars.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chatThreads'] });
    },
  });
}
