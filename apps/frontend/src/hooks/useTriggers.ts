import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Trigger, PaginatedResponse, ApiResponse } from '@nexevent/shared-types';

const TRIGGERS_KEY = 'triggers';

export function useTriggers(page = 1, limit = 20) {
  return useQuery({
    queryKey: [TRIGGERS_KEY, page, limit],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<Trigger>>>('/triggers', {
        params: { page, limit },
      });
      return data.data!;
    },
  });
}

export function useTrigger(id: string) {
  return useQuery({
    queryKey: [TRIGGERS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Trigger>>(`/triggers/${id}`);
      return data.data!;
    },
    enabled: !!id,
  });
}

export function useCreateTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Trigger>) => {
      const { data } = await api.post<ApiResponse<Trigger>>('/triggers', payload);
      return data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [TRIGGERS_KEY] }),
  });
}

export function useUpdateTrigger(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Trigger>) => {
      const { data } = await api.patch<ApiResponse<Trigger>>(`/triggers/${id}`, payload);
      return data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [TRIGGERS_KEY] }),
  });
}

export function useDeleteTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/triggers/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [TRIGGERS_KEY] }),
  });
}

export function usePauseTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.post(`/triggers/${id}/pause`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TRIGGERS_KEY] }),
  });
}

export function useResumeTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.post(`/triggers/${id}/resume`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TRIGGERS_KEY] }),
  });
}
