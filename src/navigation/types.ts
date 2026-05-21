import type { QueryResponse } from '@/types/api';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type QueryStackParamList = {
  VehicleForm: undefined;
  AttributeSelector: undefined;
  ScanToSpec: undefined;
  Processing: undefined;
  SpecSheet: { query: QueryResponse } | { queryId: string };
};

export type HistoryStackParamList = {
  HistoryList: undefined;
  HistoryDetail: { queryId: string };
};

export type CompareStackParamList = {
  CompareSelection: undefined;
  CompareResult: { queryIds: string[] };
};

export type AppTabsParamList = {
  HomeTab: undefined;
  QueryTab: undefined;
  HistoryTab: undefined;
  CompareTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
