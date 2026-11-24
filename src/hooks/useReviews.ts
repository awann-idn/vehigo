import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReview, fetchReviews } from '../api/reviews';

export function useReviews(targetType?: 'vehicle' | 'mitra', targetId?: string) {
  return useQuery({
    queryKey: ['reviews', targetType ?? 'all', targetId ?? 'all'],
    queryFn: () => fetchReviews(targetType, targetId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['mitraRating'] });
    },
  });
}
