import { create } from 'zustand';

export interface KPI {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface NetworkStats {
  platform: 'twitter' | 'linkedin' | 'facebook';
  followers: number;
  engagement: number;
  reach: number;
  posts: number;
}

export interface TimeSeriesData {
  date: string;
  impressions: number;
  engagement: number;
  clicks: number;
}

export interface TopPost {
  id: string;
  platform: string;
  content: string;
  engagement: number;
  reach: number;
  date: string;
}

export interface Insight {
  id: string;
  type: 'what_works' | 'to_test' | 'next_action';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface AnalyticsStore {
  kpis: KPI[];
  networkStats: NetworkStats[];
  timeSeries: TimeSeriesData[];
  topPosts: TopPost[];
  insights: Insight[];
  isLoading: boolean;
  lastUpdated: Date | null;
  
  setKPIs: (kpis: KPI[]) => void;
  setNetworkStats: (stats: NetworkStats[]) => void;
  setTimeSeries: (data: TimeSeriesData[]) => void;
  setTopPosts: (posts: TopPost[]) => void;
  setInsights: (insights: Insight[]) => void;
  setLoading: (loading: boolean) => void;
  refreshData: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  kpis: [],
  networkStats: [],
  timeSeries: [],
  topPosts: [],
  insights: [],
  isLoading: false,
  lastUpdated: null,
  
  setKPIs: (kpis) => set({ kpis }),
  setNetworkStats: (networkStats) => set({ networkStats }),
  setTimeSeries: (timeSeries) => set({ timeSeries }),
  setTopPosts: (topPosts) => set({ topPosts }),
  setInsights: (insights) => set({ insights }),
  setLoading: (isLoading) => set({ isLoading }),
  
  refreshData: async () => {
    set({ isLoading: true });
    // Les données seront chargées via MSW
    setTimeout(() => {
      set({ isLoading: false, lastUpdated: new Date() });
    }, 1000);
  },
}));