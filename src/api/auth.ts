import { apiClient } from '@/api/client';
import { isMockMode } from '@/api/config';
import { mockAuthApi } from '@/api/mocks';
import type {
  LoginPayload,
  RegisterPayload,
  TokenPair,
  User,
} from '@/types/api';

const realAuthApi = {
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await apiClient.post<User>('/auth/register', payload);
    return data;
  },
  async login(payload: LoginPayload): Promise<TokenPair> {
    const { data } = await apiClient.post<TokenPair>('/auth/login', payload);
    return data;
  },
  async me(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
};

export const authApi = isMockMode ? mockAuthApi : realAuthApi;
