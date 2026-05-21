import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { apiBaseUrl as resolvedBaseUrl } from '@/api/config';
import { tokenStorage } from '@/storage/tokenStorage';
import type { ApiError, TokenPair } from '@/types/api';

const baseURL: string = resolvedBaseUrl;

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let onAuthFailure: (() => void) | null = null;
export function registerAuthFailureHandler(handler: () => void) {
  onAuthFailure = handler;
}

const REFRESH_PATH = '/auth/refresh';

const rawClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
});

const refreshClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

rawClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<TokenPair | null> | null = null;

async function performRefresh(): Promise<TokenPair | null> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await refreshClient.post<TokenPair>(REFRESH_PATH, {
      refresh_token: refreshToken,
    });
    await tokenStorage.saveTokens(data.access_token, data.refresh_token);
    return data;
  } catch {
    await tokenStorage.clear();
    if (onAuthFailure) onAuthFailure();
    return null;
  }
}

rawClient.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes(REFRESH_PATH)
    ) {
      original._retry = true;
      if (!refreshPromise) refreshPromise = performRefresh();
      const tokens = await refreshPromise;
      refreshPromise = null;
      if (tokens && original.headers) {
        original.headers.Authorization = `Bearer ${tokens.access_token}`;
        return rawClient.request(original);
      }
    }
    return Promise.reject(normalizeError(error));
  },
);

export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: ApiError; detail?: unknown }
      | undefined;
    if (data?.error?.message) return data.error;
    if (typeof data?.detail === 'string') return { message: data.detail };
    if (Array.isArray(data?.detail)) {
      const first = data.detail[0] as { msg?: string } | undefined;
      if (first?.msg) return { message: first.msg };
    }
    if (error.message === 'Network Error') {
      return {
        message:
          'Não conseguimos falar com a API. Verifique se o backend está rodando e o endereço configurado em app.json (extra.apiBaseUrl).',
      };
    }
    return { message: error.message };
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return error as ApiError;
  }
  if (error instanceof Error) return { message: error.message };
  return { message: 'Erro desconhecido' };
}

export const apiClient = rawClient;
export const apiBaseUrl = baseURL;
