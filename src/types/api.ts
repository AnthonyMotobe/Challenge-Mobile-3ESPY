export type Role = 'user' | 'analyst' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  full_name: string | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface QueryPayload {
  brand: string;
  model: string;
  version: string;
  attributes: string[];
}

export interface SpecOut {
  attribute: string;
  value: string | null;
  available: boolean;
  normalized_unit: string | null;
  source_hint: string | null;
}

export interface QueryResponse {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  version: string;
  status: string;
  created_at: string;
  specs: SpecOut[];
}

export interface QuerySummary {
  id: string;
  brand: string;
  model: string;
  version: string;
  status: string;
  created_at: string;
}

export interface ApiError {
  code?: string;
  message: string;
  request_id?: string;
}
