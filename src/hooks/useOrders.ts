import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createDebouncer } from '../lib/debounce';
import {
  fetchOrders,
  fetchOrderById,
  createOrder,
  updateOrderStatus,
  subscribeToOrders,
} from '../api/orders';
import { Database } from '../lib/database.types';

export function useOrders(role?: 'renter' | 'mitra', userId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const refresh = createDebouncer(() => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });
    const unsubscribe = subscribeToOrders(userId, refresh);
    return () => {
      refresh.cancel();
      unsubscribe();
    };
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ['orders', role, userId],
    queryFn: () => fetchOrders(role, userId),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => fetchOrderById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Database['public']['Tables']['orders']['Row']['status'];
    }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
