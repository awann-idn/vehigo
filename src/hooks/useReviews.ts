import { useQuery } from '@tanstack/react-query';
import { fetchReviews } from '../api/reviews';

export function useReviews(targetType?: 'vehicle' | 'mitra', targetId?: string) {
  return useQuery({
    queryKey: ['reviews', targetType ?? 'all', targetId ?? 'all'],
    queryFn: () => fetchReviews(targetType, targetId),
  });
}
