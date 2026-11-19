import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchMitras,
  fetchMyMitraProfile,
  fetchMitraRating,
  fetchMyPayoutAccount,
  saveMitraRegistration,
  updateMyProfile,
} from '../api/mitras';

export function useMitras() {
  return useQuery({ queryKey: ['mitras'], queryFn: fetchMitras });
}

export function useMyMitraProfile(userId?: string) {
  return useQuery({
    queryKey: ['myMitraProfile', userId],
    queryFn: () => fetchMyMitraProfile(userId as string),
    enabled: !!userId,
  });
}

export function useMitraRating(userId?: string) {
  return useQuery({
    queryKey: ['mitraRating', userId],
    queryFn: () => fetchMitraRating(userId as string),
    enabled: !!userId,
  });
}

export function useMyPayoutAccount(userId?: string) {
  return useQuery({
    queryKey: ['myPayoutAccount', userId],
    queryFn: () => fetchMyPayoutAccount(userId as string),
    enabled: !!userId,
  });
}

export function useUpdateMyProfile() {
  return useMutation({ mutationFn: updateMyProfile });
}

export function useSaveMitraRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveMitraRegistration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMitraProfile'] });
      queryClient.invalidateQueries({ queryKey: ['myPayoutAccount'] });
      queryClient.invalidateQueries({ queryKey: ['mitraRating'] });
      queryClient.invalidateQueries({ queryKey: ['mitras'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
