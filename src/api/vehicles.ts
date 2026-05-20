import { apiClient } from '@/api/client';
import { isMockMode } from '@/api/config';
import { mockVehiclesApi, seedMockHistory } from '@/api/mocks';
import type { QueryPayload, QueryResponse, QuerySummary } from '@/types/api';

const realVehiclesApi = {
  async query(payload: QueryPayload): Promise<QueryResponse> {
    const { data } = await apiClient.post<QueryResponse>('/vehicles/query', payload);
    return data;
  },
  async list(limit = 50, offset = 0): Promise<QuerySummary[]> {
    const { data } = await apiClient.get<QuerySummary[]>('/vehicles/queries', {
      params: { limit, offset },
    });
    return data;
  },
  async get(id: string): Promise<QueryResponse> {
    const { data } = await apiClient.get<QueryResponse>(`/vehicles/queries/${id}`);
    return data;
  },
};

if (isMockMode) {
  seedMockHistory();
}

export const vehiclesApi = isMockMode ? mockVehiclesApi : realVehiclesApi;
