/**
 * Adaptateur pour transformer les réponses du backend au format attendu par le frontend
 */

import { MonthlyPlan, AnalyticsData } from './api';

/**
 * Transforme les données d'analytics du backend au format frontend
 */
export function transformAnalyticsResponse(backendResponse: any): AnalyticsData[] {
  // Si le backend retourne directement un tableau d'analytics
  if (Array.isArray(backendResponse)) {
    return backendResponse;
  }

  // Si le backend retourne un objet avec des métriques agrégées
  if (backendResponse.metrics) {
    const analyticsData: AnalyticsData[] = [];
    
    // Transformer les métriques par plateforme en tableau d'analytics
    if (backendResponse.metrics.by_platform) {
      Object.entries(backendResponse.metrics.by_platform).forEach(([platform, metrics]: [string, any]) => {
        analyticsData.push({
          post_id: `aggregate_${platform}_${Date.now()}`,
          platform,
          impressions: metrics.impressions || 0,
          engagements: metrics.engagements || 0,
          clicks: metrics.clicks || 0,
          shares: metrics.shares || 0,
          comments: metrics.comments || 0,
          likes: metrics.likes || 0,
          engagement_rate: metrics.impressions > 0 
            ? (metrics.engagements / metrics.impressions * 100) 
            : 0,
          measured_at: new Date().toISOString()
        });
      });
    }

    // Si aucune donnée par plateforme, créer une entrée agrégée
    if (analyticsData.length === 0 && backendResponse.metrics.total_impressions !== undefined) {
      analyticsData.push({
        post_id: `aggregate_all_${Date.now()}`,
        platform: 'All',
        impressions: backendResponse.metrics.total_impressions || 0,
        engagements: backendResponse.metrics.total_engagements || 0,
        clicks: backendResponse.metrics.total_clicks || 0,
        shares: 0,
        comments: 0,
        likes: 0,
        engagement_rate: backendResponse.metrics.average_engagement_rate || 0,
        measured_at: new Date().toISOString()
      });
    }

    return analyticsData;
  }

  // Si le format n'est pas reconnu, retourner un tableau vide
  return [];
}

/**
 * Transforme la réponse d'orchestration du backend
 */
export function transformOrchestrationResponse(backendResponse: any): any {
  // Le backend retourne déjà le bon format pour l'orchestration
  if (backendResponse.results) {
    return backendResponse.results;
  }
  
  // Si c'est un tableau direct
  if (Array.isArray(backendResponse)) {
    return backendResponse;
  }

  // Sinon retourner la réponse telle quelle
  return backendResponse;
}

/**
 * Vérifie si une stratégie est valide et complète
 */
export function isValidStrategy(strategy: any): strategy is MonthlyPlan {
  return strategy && 
    strategy.calendar && 
    strategy.calendar.posts && 
    Array.isArray(strategy.calendar.posts) &&
    strategy.brand_name &&
    strategy.campaign_name;
}

/**
 * Crée une stratégie vide par défaut
 */
export function createEmptyStrategy(): MonthlyPlan {
  return {
    campaign_name: '',
    brand_name: '',
    positioning: '',
    target_audience: '',
    value_propositions: [],
    content_pillars: [],
    editorial_guidelines: {
      tone: '',
      do_list: [],
      dont_list: [],
      language: 'fr-FR',
      brand_voice_attributes: []
    },
    calendar: {
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      posts: [],
      total_posts: 0,
      posts_per_platform: {}
    },
    created_at: new Date().toISOString(),
    version: '1.0'
  };
}