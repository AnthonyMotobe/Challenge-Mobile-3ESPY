import { apiClient } from '@/api/client';
import { isMockMode } from '@/api/config';
import { mockVehiclesApi, seedMockHistory } from '@/api/mocks';
import type { QueryPayload, QueryResponse, QuerySummary } from '@/types/api';

/**
 * Blinda a resposta da API: tipos de TypeScript somem em runtime, então um
 * payload malformado (`specs` ausente/nulo) quebraria as telas que fazem
 * `query.specs.map(...)`. Garantir o array aqui, na borda, evita o crash.
 */
function ensureQueryShape(raw: QueryResponse): QueryResponse {
  return {
    ...raw,
    specs: Array.isArray(raw?.specs) ? raw.specs : [],
  };
}

const realVehiclesApi = {
  async query(payload: QueryPayload): Promise<QueryResponse> {
    const { data } = await apiClient.post<QueryResponse>('/vehicles/query', payload);
    return ensureQueryShape(data);
  },
  async list(limit = 50, offset = 0): Promise<QuerySummary[]> {
    const { data } = await apiClient.get<QuerySummary[]>('/vehicles/queries', {
      params: { limit, offset },
    });
    return Array.isArray(data) ? data : [];
  },
  async get(id: string): Promise<QueryResponse> {
    const { data } = await apiClient.get<QueryResponse>(`/vehicles/queries/${id}`);
    return ensureQueryShape(data);
  },
};

if (isMockMode) {
  seedMockHistory();
}

export const vehiclesApi = isMockMode ? mockVehiclesApi : realVehiclesApi;
