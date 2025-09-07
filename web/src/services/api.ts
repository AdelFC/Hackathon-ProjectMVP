import axios, { AxiosInstance } from 'axios';
import { transformAnalyticsResponse, transformOrchestrationResponse, isValidStrategy } from './apiAdapter';
import { generateMockAnalyticsData, getMockYesterdayAnalytics } from './mockApi';

// Configuration de base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Créer une instance axios configurée
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs globalement
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erreur de l'API
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.detail || 'Une erreur est survenue');
    } else if (error.request) {
      // Pas de réponse
      console.error('Network Error:', error.request);
      throw new Error('Impossible de contacter le serveur');
    } else {
      // Erreur de configuration
      console.error('Error:', error.message);
      throw new Error(error.message);
    }
  }
);

// Types basés sur les modèles backend
export interface BrandInfo {
  brand_name: string;
  positioning: string;
  target_audience: string;
  value_props: string[];
  tone: string;
  language?: string;
}

export interface StrategyRequest {
  brand_name: string;
  positioning: string;
  target_audience: string;
  value_props: string[];
  start_date: string;
  duration_days?: number;
  language?: string;
  tone?: string;
  cta_targets: string[];
  startup_name?: string;
  startup_url?: string;
  platforms?: string[];
}

export interface MonthlyPlan {
  campaign_name: string;
  brand_name: string;
  positioning: string;
  target_audience: string;
  value_propositions: string[];
  content_pillars: string[];
  editorial_guidelines: {
    tone: string;
    do_list: string[];
    dont_list: string[];
    language: string;
    brand_voice_attributes: string[];
  };
  calendar: {
    start_date: string;
    end_date: string;
    posts: DailyPost[];
    total_posts: number;
    posts_per_platform: Record<string, number>;
  };
  created_at: string;
  version: string;
}

export interface DailyPost {
  date: string;
  platform: 'LinkedIn' | 'Facebook' | 'Twitter';
  pillar: string;
  topic: string;
  key_message: string;
  variation: {
    angle: string;
    hook_style: string;
    cta_type: string;
    format: string;
  };
  hashtags_count: number;
  image_required: boolean;
}

export interface OrchestratorRequest {
  company_name?: string;
  execute_date?: string;
  force_execution?: boolean;
  dry_run?: boolean;
  platforms?: string[];
  startup_name?: string;
  startup_url?: string;
}

export interface PostingResult {
  success: boolean;
  platform: string;
  post_id?: string;
  post_url?: string;
  error?: string;
  timestamp: string;
}

export interface AnalyticsData {
  post_id: string;
  platform: string;
  impressions: number;
  engagements: number;
  clicks: number;
  shares: number;
  comments: number;
  likes: number;
  engagement_rate: number;
  measured_at: string;
}

// Service API
export const apiService = {
  // Health check
  async healthCheck() {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Strategy endpoints
  async generateStrategy(data: StrategyRequest): Promise<any> {
    const response = await apiClient.post('/strategy/generate', data);
    // Le backend retourne un résumé, pas le plan complet
    // Il faut ensuite récupérer le plan via getActiveStrategy
    if (response.data.success) {
      // Récupérer le plan complet après génération
      const plan = await this.getActiveStrategy(data.brand_name);
      return plan;
    }
    throw new Error('Failed to generate strategy');
  },

  async getActiveStrategy(brandName: string): Promise<MonthlyPlan | null> {
    try {
      const response = await apiClient.get(`/strategy/active/${brandName}`);
      // Le backend retourne { success: true, plan: {...} }
      return response.data.plan || null;
    } catch (error) {
      return null;
    }
  },

  async getPostsForDate(brandName: string, date: string): Promise<DailyPost[]> {
    const response = await apiClient.get(`/strategy/posts/${brandName}/${date}`);
    // Le backend retourne { success: true, posts: [...] }
    return response.data.posts || [];
  },

  // Orchestrator endpoints
  async executeDailyOrchestration(data: OrchestratorRequest): Promise<PostingResult[]> {
    const response = await apiClient.post('/orchestrator/daily', data);
    return transformOrchestrationResponse(response.data);
  },

  async getOrchestratorStatus() {
    const response = await apiClient.get('/orchestrator/status');
    return response.data;
  },

  async retryPost(date: string, platform: string): Promise<PostingResult> {
    const response = await apiClient.post(`/orchestrator/retry/${date}/${platform}`);
    return response.data;
  },

  // Analytics endpoints
  async getPerformanceMetrics(startDate: string, endDate: string, platforms?: string[]): Promise<AnalyticsData[]> {
    try {
      const response = await apiClient.post('/analytics/performance', {
        start_date: startDate,
        end_date: endDate,
        platforms
      });
      return transformAnalyticsResponse(response.data);
    } catch (error) {
      // Return mock data if API fails
      console.log('Using mock analytics data');
      const mockData = generateMockAnalyticsData(startDate, endDate);
      return platforms && platforms.length > 0 
        ? mockData.filter(d => platforms.includes(d.platform.toLowerCase()))
        : mockData;
    }
  },

  async getYesterdayAnalytics(brandName: string): Promise<AnalyticsData[]> {
    try {
      const response = await apiClient.get(`/analytics/yesterday/${brandName}`);
      return transformAnalyticsResponse(response.data.performance || response.data);
    } catch (error) {
      // Return mock data if API fails
      console.log('Using mock yesterday analytics');
      return getMockYesterdayAnalytics(brandName);
    }
  },

  // Utility endpoints
  async getMetrics() {
    const response = await apiClient.get('/metrics');
    return response.data;
  },

  // Landing page analysis (si backend a cet endpoint)
  async analyzeLandingPage(url: string): Promise<BrandInfo> {
    const response = await apiClient.post('/analyze/landing-page', { url });
    return response.data;
  },

  // Test endpoints
  async createSampleStrategy(brandName: string, startupName?: string, startupUrl?: string) {
    const params = new URLSearchParams();
    if (startupName) params.append('startup_name', startupName);
    if (startupUrl) params.append('startup_url', startupUrl);

    const url = params.toString() ? `/test/create-sample-strategy?${params.toString()}` : '/test/create-sample-strategy';
    const response = await apiClient.post(url, { brand_name: brandName });
    return response.data;
  },

  async dryRunOrchestration(date?: string, startupName?: string, startupUrl?: string) {
    const params = new URLSearchParams();
    if (startupName) params.append('startup_name', startupName);
    if (startupUrl) params.append('startup_url', startupUrl);

    const url = params.toString() ? `/test/dry-run-orchestration?${params.toString()}` : '/test/dry-run-orchestration';
    const response = await apiClient.post(url, {
      execute_date: date,
      dry_run: true
    });
    return response.data;
  },

  // Retry post with startup parameters
  async retryPostWithStartup(date: string, platform: string, startupName?: string, startupUrl?: string): Promise<PostingResult> {
    const params = new URLSearchParams();
    if (startupName) params.append('startup_name', startupName);
    if (startupUrl) params.append('startup_url', startupUrl);

    const url = params.toString()
      ? `/orchestrator/retry/${date}/${platform}?${params.toString()}`
      : `/orchestrator/retry/${date}/${platform}`;

    const response = await apiClient.post(url);
    return response.data;
  }
};

export default apiService;
