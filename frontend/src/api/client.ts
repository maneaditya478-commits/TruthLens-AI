import axios from 'axios';
import { 
  VerificationReport, 
  HistoryListItem, 
  DashboardStats, 
  SettingsState,
  BenchmarkItem,
  BenchmarkRunResult
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

export const apiService = {
  // Verification
  verifyText: async (payload: {
    input_text: string;
    original_question?: string;
    category: string;
    verification_mode: string;
  }): Promise<VerificationReport> => {
    const res = await api.post('/verify', payload);
    return res.data;
  },

  verifyFile: async (formData: FormData): Promise<VerificationReport> => {
    const res = await api.post('/verify/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Reports & History
  getReport: async (id: string): Promise<VerificationReport> => {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },

  getHistory: async (category?: string, limit: number = 50): Promise<HistoryListItem[]> => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    params.append('limit', limit.toString());
    const res = await api.get(`/history?${params.toString()}`);
    return res.data;
  },

  // Dashboard & Telemetry
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },

  getUsageMetrics: async () => {
    const res = await api.get('/usage');
    return res.data;
  },

  getHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  },

  // Settings & Connectivity
  getSettings: async (): Promise<SettingsState> => {
    const res = await api.get('/settings');
    return res.data;
  },

  updateSettings: async (payload: Partial<SettingsState> & { bifrost_api_key?: string; tavily_api_key?: string }): Promise<SettingsState> => {
    const res = await api.post('/settings', payload);
    return res.data;
  },

  testBifrost: async () => {
    const res = await api.post('/settings/test-bifrost');
    return res.data;
  },

  testTavily: async () => {
    const res = await api.post('/settings/test-tavily');
    return res.data;
  },

  // Benchmark
  getBenchmarkDataset: async (): Promise<BenchmarkItem[]> => {
    const res = await api.get('/benchmark/dataset');
    return res.data;
  },

  runBenchmark: async (sample_size: number = 5): Promise<BenchmarkRunResult> => {
    const res = await api.post(`/benchmark/run?sample_size=${sample_size}`);
    return res.data;
  },
};
