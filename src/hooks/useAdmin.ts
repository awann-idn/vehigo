import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAdminOverview, setUserStatus, verifyMitra } from '../api/admin';

export function useAdminOverview(enabled: boolean) {
  return useQuery({
    queryKey: ['adminOverview'],
    queryFn: fetchAdminOverview,
    enabled,
  });
}

export function useVerifyMitra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      verification,
    }: {
      userId: string;
      verification: 'verified' | 'rejected';
    }) => verifyMitra(userId, verification),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminOverview'] }),
  });
}

export function useSetUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'suspended' }) =>
      setUserStatus(userId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminOverview'] }),
  });
}
