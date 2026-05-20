import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QueryResponse, QuerySummary } from '@/types/api';

const SUMMARY_KEY = 'ford.history.summary';
const QUERY_PREFIX = 'ford.history.query.';
const SCAN_KEY = 'ford.history.scans';

export interface LocalScanEntry {
  id: string;
  uri: string;
  kind: 'image' | 'pdf';
  filename?: string;
  createdAt: string;
  linkedQueryId?: string;
}

export const historyCache = {
  async saveSummaries(items: QuerySummary[]): Promise<void> {
    await AsyncStorage.setItem(SUMMARY_KEY, JSON.stringify(items));
  },
  async loadSummaries(): Promise<QuerySummary[]> {
    const raw = await AsyncStorage.getItem(SUMMARY_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as QuerySummary[];
    } catch {
      return [];
    }
  },
  async saveQuery(query: QueryResponse): Promise<void> {
    await AsyncStorage.setItem(QUERY_PREFIX + query.id, JSON.stringify(query));
  },
  async loadQuery(id: string): Promise<QueryResponse | null> {
    const raw = await AsyncStorage.getItem(QUERY_PREFIX + id);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as QueryResponse;
    } catch {
      return null;
    }
  },
  async clearAll(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const toRemove = keys.filter(
      (k) => k.startsWith(QUERY_PREFIX) || k === SUMMARY_KEY || k === SCAN_KEY,
    );
    await AsyncStorage.multiRemove(toRemove);
  },
  async saveScans(scans: LocalScanEntry[]): Promise<void> {
    await AsyncStorage.setItem(SCAN_KEY, JSON.stringify(scans));
  },
  async loadScans(): Promise<LocalScanEntry[]> {
    const raw = await AsyncStorage.getItem(SCAN_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as LocalScanEntry[];
    } catch {
      return [];
    }
  },
  async addScan(entry: LocalScanEntry): Promise<LocalScanEntry[]> {
    const scans = await this.loadScans();
    const updated = [entry, ...scans].slice(0, 50);
    await this.saveScans(updated);
    return updated;
  },
};
