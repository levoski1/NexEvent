import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AuditLog, PaginatedResponse, ApiResponse } from '@nexevent/shared-types';

export function useQueueMetrics() {
  return useQuery({
    queryKey: ['queue-metrics'],
    queryFn: async () => {
      const { data } = await api.get('/queue/metrics');
      return data.data as { live: Record<string, number>; history: unknown[] };
    },
    refetchInterval: 5000,
  });
}

export function useAuditLogs(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['audit-logs', page, limit],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<AuditLog>>>('/audit', {
        params: { page, limit },
      });
      return data.data!;
    },
  });
}
