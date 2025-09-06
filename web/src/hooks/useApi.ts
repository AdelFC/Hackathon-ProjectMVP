import { useState, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';
import apiService, { 
  StrategyRequest, 
  MonthlyPlan, 
  OrchestratorRequest, 
  PostingResult,
  AnalyticsData,
  BrandInfo 
} from '../services/api';

// Hook générique pour les appels API
export function useApiCall<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { addToast } = useToast();

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  return { loading, error, data, execute };
}

// Hook pour la génération de stratégie
export function useStrategyGeneration() {
  const { loading, error, data, execute } = useApiCall<MonthlyPlan>();
  const { addToast } = useToast();

  const generateStrategy = useCallback(async (request: StrategyRequest) => {
    try {
      const result = await execute(() => apiService.generateStrategy(request));
      addToast('Stratégie générée avec succès!', 'success');
      return result;
    } catch (err) {
      // L'erreur est déjà gérée dans useApiCall
      return null;
    }
  }, [execute, addToast]);

  return { 
    loading, 
    error, 
    strategy: data, 
    generateStrategy 
  };
}

// Hook pour l'orchestration quotidienne
export function useOrchestration() {
  const { loading, error, data, execute } = useApiCall<PostingResult[]>();
  const { addToast } = useToast();

  const runOrchestration = useCallback(async (request: OrchestratorRequest) => {
    try {
      const results = await execute(() => apiService.executeDailyOrchestration(request));
      const successCount = results?.filter(r => r.success).length || 0;
      const totalCount = results?.length || 0;
      
      if (successCount === totalCount) {
        addToast(`${totalCount} posts publiés avec succès!`, 'success');
      } else if (successCount > 0) {
        addToast(`${successCount}/${totalCount} posts publiés`, 'warning');
      } else {
        addToast('Échec de la publication', 'error');
      }
      
      return results;
    } catch (err) {
      return null;
    }
  }, [execute, addToast]);

  return { 
    loading, 
    error, 
    results: data, 
    runOrchestration 
  };
}

// Hook pour les analytics
export function useAnalytics() {
  const { loading, error, data, execute } = useApiCall<AnalyticsData[]>();

  const fetchAnalytics = useCallback(async (
    startDate: string, 
    endDate: string, 
    platforms?: string[]
  ) => {
    return execute(() => apiService.getPerformanceMetrics(startDate, endDate, platforms));
  }, [execute]);

  const fetchYesterdayAnalytics = useCallback(async (brandName: string) => {
    return execute(() => apiService.getYesterdayAnalytics(brandName));
  }, [execute]);

  return { 
    loading, 
    error, 
    analytics: data, 
    fetchAnalytics,
    fetchYesterdayAnalytics
  };
}

// Hook pour l'analyse de landing page
export function useLandingPageAnalysis() {
  const { loading, error, data, execute } = useApiCall<BrandInfo>();
  const { addToast } = useToast();

  const analyzePage = useCallback(async (url: string) => {
    try {
      const result = await execute(() => apiService.analyzeLandingPage(url));
      addToast('Analyse terminée avec succès!', 'success');
      return result;
    } catch (err) {
      return null;
    }
  }, [execute, addToast]);

  return { 
    loading, 
    error, 
    brandInfo: data, 
    analyzePage 
  };
}

// Hook pour récupérer la stratégie active
export function useActiveStrategy(brandName: string) {
  const { loading, error, data, execute } = useApiCall<MonthlyPlan | null>();

  const fetchStrategy = useCallback(async () => {
    if (!brandName) return null;
    return execute(() => apiService.getActiveStrategy(brandName));
  }, [brandName, execute]);

  return { 
    loading, 
    error, 
    strategy: data, 
    fetchStrategy 
  };
}

// Hook pour le statut de l'orchestrateur
export function useOrchestratorStatus() {
  const { loading, error, data, execute } = useApiCall();

  const fetchStatus = useCallback(async () => {
    return execute(() => apiService.getOrchestratorStatus());
  }, [execute]);

  return { 
    loading, 
    error, 
    status: data, 
    fetchStatus 
  };
}