import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createDebouncer } from '../lib/debounce';
import {
  fetchVehicles,
  fetchVehicleById,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  subscribeToVehicles,
} from '../api/vehicles';

export function useVehicles(mitraId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refresh = createDebouncer(() => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    });
    const unsubscribe = subscribeToVehicles(refresh);
    return () => {
      refresh.cancel();
      unsubscribe();
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['vehicles', mitraId ?? 'all'],
    queryFn: () => fetchVehicles(mitraId),
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => fetchVehicleById(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      name: string;
      plate: string;
      year?: number;
      price_per_day: number;
      transmission: string;
    }) => updateVehicle(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useUpdateVehicleStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'tersedia' | 'disewa' | 'maintenance' }) =>
      updateVehicleStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
