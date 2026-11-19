import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchUnavailableDates,
  fetchVehicleBlocks,
  setVehicleDateBlocked,
} from '../api/availability';

export function useUnavailableDates(vehicleId: string, from: string, to: string) {
  return useQuery({
    queryKey: ['availability', vehicleId, from, to],
    queryFn: () => fetchUnavailableDates(vehicleId, from, to),
    enabled: !!vehicleId && !!from && !!to,
  });
}

export function useVehicleBlocks(vehicleId: string, from: string, to: string) {
  return useQuery({
    queryKey: ['vehicleBlocks', vehicleId, from, to],
    queryFn: () => fetchVehicleBlocks(vehicleId, from, to),
    enabled: !!vehicleId && !!from && !!to,
  });
}

export function useToggleVehicleDate(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, blocked }: { date: string; blocked: boolean }) =>
      setVehicleDateBlocked(vehicleId, date, blocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleBlocks', vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['availability', vehicleId] });
    },
  });
}
