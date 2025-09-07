import { useState, useEffect } from 'react';
import { RefreshCw, Eye, Send, Edit2, Check, X, Calendar, Download, Clock, ChevronRight } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { useStrategyStore } from '../stores/strategyStore';
import { useStrategyGeneration, useOrchestration, useActiveStrategy } from '../hooks/useApi';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { DailyPost } from '../services/api';
import { useLanguage } from '../components/GlobalHeader';
import { translations } from '../utils/translations';

// Configuration Twitter
const X_API_KEY = "MtUuLR9VGtQNkT3CNBhVFxiJe";
const X_KEY_SECRET = "pSfavIgsWgvdzhUpqr4QyOyb9rhe7stI6Xbr9FTiWvNxB82jmp";
const X_ACCESS_TOKEN = "1964269504189362178-HD0C10A9uKqEyAZTrqZGZC97u9SpeX";
const X_ACCESS_TOKEN_SECRET = "cSmDBplLC5Wwj5Jw0sVRNHVV4YtgKku9tVT36VrrLzB7K";

/**
 * Génère une signature OAuth 1.0a pour Twitter
 * Utilise Web Crypto API au lieu de crypto Node.js
 */
async function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): Promise<string> {
  // Encode les paramètres
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  // Crée la base de signature
  const signatureBase = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  
  // Crée la clé de signature
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  
  // Utilise Web Crypto API pour générer HMAC-SHA1
  const encoder = new TextEncoder();
  const keyData = encoder.encode(signingKey);
  const messageData = encoder.encode(signatureBase);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  
  // Convertit en base64
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * Génère l'en-tête OAuth pour Twitter
 */
async function generateOAuthHeader(
  method: string,
  url: string,
  additionalParams: Record<string, string> = {}
): Promise<string> {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: X_API_KEY,
    oauth_nonce: Math.random().toString(36).substring(2) + Date.now().toString(36),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: X_ACCESS_TOKEN,
    oauth_version: '1.0'
  };
  
  // Combine tous les paramètres pour la signature
  const allParams = { ...oauthParams, ...additionalParams };
  
  // Génère la signature
  const signature = await generateOAuthSignature(
    method,
    url,
    allParams,
    X_KEY_SECRET,
    X_ACCESS_TOKEN_SECRET
  );
  
  // Ajoute la signature aux paramètres OAuth
  oauthParams['oauth_signature'] = signature;
  
  // Construit l'en-tête
  const headerParts = Object.keys(oauthParams)
    .sort()
    .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');
  
  return `OAuth ${headerParts}`;
}

/**
 * Publie un tweet via l'API Twitter v2
 * Utilise un proxy CORS pour contourner les restrictions du navigateur
 */
export async function postToX(text: string): Promise<any> {
  if (!X_API_KEY || !X_KEY_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_TOKEN_SECRET) {
    throw new Error("Les clés Twitter ne sont pas configurées. Veuillez les définir dans le code.");
  }
  
  // Options de proxy CORS (vous pouvez aussi déployer votre propre proxy)
  const corsProxies = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/'
  ];
  
  // Utilise le premier proxy disponible
  const proxy = corsProxies[0];
  const baseUrl = "https://api.twitter.com/2/tweets";
  const url = proxy + encodeURIComponent(baseUrl);
  
  try {
    const authHeader = await generateOAuthHeader("POST", baseUrl);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ text })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Tweet publié avec succès:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.error('Réponse d\'erreur Twitter:', errorText);
      
      // Si c'est un problème CORS, essayer une méthode alternative
      if (response.status === 0 || !response.ok) {
        console.warn('Problème CORS détecté. Tentative avec méthode alternative...');
        return await postToXAlternative(text);
      }
      
      throw new Error(`Erreur Twitter (${response.status}): ${errorText}`);
    }
  } catch (error) {
    console.error('Erreur lors de la publication sur Twitter:', error);
    
    // Tentative avec méthode alternative si échec
    console.warn('Tentative avec méthode alternative...');
    return await postToXAlternative(text);
  }
}

/**
 * Méthode alternative pour poster sur Twitter
 * Utilise une approche différente pour contourner CORS
 */
async function postToXAlternative(text: string): Promise<any> {
  // Méthode 1: Utiliser un service tiers ou une iframe cachée
  // Note: Cette méthode nécessite un backend ou un service externe
  
  // Pour l'instant, on simule un succès pour le développement
  console.warn('Mode simulation: Le tweet n\'a pas été réellement publié (CORS bloqué)');
  console.log('Contenu du tweet:', text);
  
  // Retourne un objet simulé pour ne pas bloquer l'application
  return {
    data: {
      id: 'simulated_' + Date.now(),
      text: text,
      created_at: new Date().toISOString()
    },
    simulated: true,
    message: 'Tweet simulé (CORS bloqué) - Implémentez un backend proxy pour la production'
  };
}

interface ProposedPost extends DailyPost {
  id: string;
  status: 'draft' | 'approved' | 'scheduled' | 'published';
  content?: string;
  scheduledTime?: string;
}

export function StrategyEnhanced() {
  const { brandIdentity, goals } = useProjectStore();
  const {
    activeStrategy: storedStrategy,
    setActiveStrategy,
    markSynced
  } = useStrategyStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [proposedPosts, setProposedPosts] = useState<ProposedPost[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const language = useLanguage();
  const t = translations[language];

  // Hooks API
  const { strategy, loading: loadingGenerate, generateStrategy } = useStrategyGeneration();
  const { loading: loadingOrchestrate, runOrchestration } = useOrchestration();
  const {
    strategy: apiStrategy,
    loading: loadingActive,
    fetchStrategy
  } = useActiveStrategy(brandIdentity?.name || '');

  // Charger la stratégie depuis l'API au montage
  useEffect(() => {
    if (brandIdentity?.name && !storedStrategy) {
      fetchStrategy();
    }
  }, [brandIdentity?.name, storedStrategy, fetchStrategy]);

  // Synchroniser avec le store
  useEffect(() => {
    if (apiStrategy) {
      setActiveStrategy(apiStrategy);
      markSynced();
    }
  }, [apiStrategy, setActiveStrategy, markSynced]);

  useEffect(() => {
    if (strategy) {
      setActiveStrategy(strategy);
      markSynced();
    }
  }, [strategy, setActiveStrategy, markSynced]);

  // Utiliser la stratégie du store en priorité
  const currentStrategy = storedStrategy || strategy || apiStrategy;

  // Générer des posts proposés basés sur la stratégie
  useEffect(() => {
    if (currentStrategy && currentStrategy.calendar.posts) {
      // Filter by enabled platforms from goals
      const enabledPlatforms = goals?.enabledNetworks?.map(n => n.charAt(0).toUpperCase() + n.slice(1)) || [];
      const todayPosts = currentStrategy.calendar.posts
        .filter(post => post.date === selectedDate && 
                (enabledPlatforms.length === 0 || enabledPlatforms.includes(post.platform)))
        .map(post => ({
          ...post,
          id: `${post.platform}_${post.date}_${Math.random()}`,
          status: 'draft' as const,
          content: generatePostContent(post),
          scheduledTime: getScheduledTime(post.platform)
        }));
      setProposedPosts(todayPosts);
    }
  }, [currentStrategy, selectedDate, goals?.enabledNetworks]);

  // Générer le contenu d'un post basé sur ses caractéristiques
  const generatePostContent = (post: DailyPost): string => {
    const brandName = brandIdentity?.name || '';
    const brandVoice = brandIdentity?.voice || 'professional';
    const brandMission = brandIdentity?.mission || '';
    const brandTargetAudience = brandIdentity?.targetAudience || '';
    
    // Extraire les value props correctement
    let brandValueProps: string[] = [];
    if (brandIdentity?.valueProps) {
      if (typeof brandIdentity.valueProps === 'string') {
        brandValueProps = brandIdentity.valueProps.split(',').map(v => v.trim()).filter(v => v);
      } else if (Array.isArray(brandIdentity.valueProps)) {
        brandValueProps = brandIdentity.valueProps;
      }
    }
    const brandFeatures = brandValueProps.join(', ') || 'Innovation, Qualité, Service';
    
    // Utiliser les hashtags du store ou par défaut
    const brandHashtags = Array.isArray(brandIdentity?.hashtags) ? brandIdentity.hashtags : ['#startup', '#innovation', '#tech'];
    const brandGuidelines = brandIdentity?.guidelines || {};
    
    // Extract specific guidelines
    const doGuidelines = brandGuidelines.do || [];
    const dontGuidelines = brandGuidelines.dont || [];
    
    // Create hashtag string - assurer que tous ont le #
    const hashtagString = brandHashtags.map(tag => {
      const cleanTag = tag.replace('#', '').trim();
      return cleanTag ? `#${cleanTag}` : '';
    }).filter(t => t).join(' ') || '#innovation #tech #startup';
    
    // Templates améliorés selon le nouveau prompt stratégique
    const templates = {
      LinkedIn: {
        education: [
          `💡 ${post.topic}\n\n${post.key_message}\n\n${brandName} ${brandMission ? `révolutionne ${brandMission}` : 'transforme votre industrie'} grâce à ${brandFeatures ? brandFeatures.split(',')[0]?.trim() : 'l\'innovation'}.\n\n👉 Qu'en pensez-vous ? Partagez votre expérience en commentaire.\n\n${hashtagString}`,
          `[Insight du jour] ${post.topic}\n\n${post.key_message}\n\nChez ${brandName}, nous croyons que ${brandMission || 'l\'innovation est clé'}.\n\n✅ ${brandFeatures ? brandFeatures.split(',').slice(0, 2).join('\n✅ ') : 'Solutions innovantes'}\n\n${hashtagString}`
        ],
        social_proof: [
          `📊 Case Study: ${post.topic}\n\n${post.key_message}\n\nRésultats concrets avec ${brandName}:\n${brandFeatures ? '→ ' + brandFeatures.split(',')[0] : '→ ROI prouvé'}\n\nDécouvrez comment nous aidons ${brandTargetAudience || 'nos clients'} à exceller.\n\n${hashtagString}`,
          `🎯 ${post.topic}\n\n"${post.key_message}"\n\n- Un client ${brandName} satisfait\n\nRejoignez ${brandTargetAudience || 'des entreprises leaders'} qui nous font confiance.\n\n${hashtagString}`
        ],
        thought_leadership: [
          `🔮 ${post.topic}\n\n${post.key_message}\n\nMon analyse en tant que leader chez ${brandName}:\n\n${brandMission ? `Notre mission de ${brandMission} nous positionne uniquement pour...` : 'L\'avenir appartient à ceux qui innovent...'}\n\nQuel est votre point de vue?\n\n${hashtagString}`
        ]
      },
      Facebook: {
        community: [
          `🙌 ${post.topic}\n\n${post.key_message}\n\n${brandName} c'est avant tout une communauté de ${brandTargetAudience || 'passionnés'}!\n\n💬 Partagez votre histoire avec nous dans les commentaires!\n\n${hashtagString}`,
          `📢 Question du jour: ${post.topic}\n\n${post.key_message}\n\nChez ${brandName}, on veut connaître VOTRE avis!\n\nRéagissez avec:\n❤️ si vous êtes d'accord\n👍 si c'est pertinent\n🤔 si vous voulez en savoir plus\n\n${hashtagString}`
        ],
        product: [
          `✨ Nouveauté ${brandName}!\n\n${post.topic}\n\n${post.key_message}\n\n${brandFeatures ? '🚀 ' + brandFeatures.split(',')[0] : '🚀 Innovation'}\n\n👉 Découvrez comment ${brandMission || 'transformer votre quotidien'}.\n\n${hashtagString}`,
        ],
        behind_the_scenes: [
          `🎬 Dans les coulisses de ${brandName}\n\n${post.topic}\n\n${post.key_message}\n\nNotre équipe travaille chaque jour pour ${brandMission || 'vous servir au mieux'}.\n\n❤️ si vous appréciez la transparence!\n\n${hashtagString}`
        ]
      },
      Twitter: {
        education: [
          `${post.key_message.substring(0, 100)}...\n\n${brandName} tip: ${post.topic.substring(0, 50)}\n\n🧵 Thread 👇\n\n${hashtagString}`,
          `💡 ${post.topic.substring(0, 60)}\n\n${post.key_message.substring(0, 120)}\n\n- L'équipe ${brandName}\n\n${hashtagString}`
        ],
        social_proof: [
          `📈 ${post.topic.substring(0, 50)}\n\n"${post.key_message.substring(0, 100)}"\n\nVia ${brandName}\n\n${hashtagString}`,
        ],
        product: [
          `🚀 ${brandName}: ${post.topic.substring(0, 50)}\n\n${post.key_message.substring(0, 100)}\n\n${hashtagString}`,
        ]
      }
    };

    // Sélectionner le template en fonction de la plateforme ET du pilier
    const platformTemplates = templates[post.platform as keyof typeof templates];
    let availableTemplates: string[] = [];
    
    if (platformTemplates) {
      // Chercher les templates pour le pilier spécifique
      const pillarKey = post.pillar?.toLowerCase().replace(' ', '_') || 'education';
      if (platformTemplates[pillarKey as keyof typeof platformTemplates]) {
        availableTemplates = platformTemplates[pillarKey as keyof typeof platformTemplates] as string[];
      } else {
        // Fallback: prendre le premier pilier disponible
        const firstPillar = Object.keys(platformTemplates)[0];
        availableTemplates = platformTemplates[firstPillar as keyof typeof platformTemplates] as string[];
      }
    }
    
    // Si pas de templates trouvés, utiliser un template par défaut
    if (availableTemplates.length === 0) {
      availableTemplates = [`${post.key_message}\n\n${brandName}: ${post.topic}\n\n${hashtagString}`];
    }
    
    let content = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    
    // Apply voice tone adjustments
    if (brandVoice === 'casual') {
      content = content.replace(/Découvrez/g, 'Check out').replace(/Notre solution/g, 'On a');
    } else if (brandVoice === 'bold') {
      content = content.replace(/peut/g, 'VA').replace(/aide à/g, 'RÉVOLUTIONNE');
    }
    
    return content;
  };

  // Déterminer l'heure de publication optimale par plateforme
  const getScheduledTime = (platform: string): string => {
    const times = {
      LinkedIn: '09:00',
      Facebook: '14:00',
      Twitter: '10:00'
    };
    return times[platform as keyof typeof times] || '12:00';
  };

  const handleGenerateStrategy = async () => {
    if (!brandIdentity || !goals) return;

    // Get enabled platforms from goals - capitalize first letter
    const enabledPlatforms = goals.enabledNetworks?.map(n => {
      // Normalise: linkedin -> LinkedIn, twitter -> Twitter, facebook -> Facebook
      return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
    }) || [];

    // Prepare value propositions array
    const valuePropsArray: string[] = [];
    if (brandIdentity.valueProps) {
      // Si valueProps est une string avec des virgules, on split
      if (typeof brandIdentity.valueProps === 'string') {
        valuePropsArray.push(...brandIdentity.valueProps.split(',').map(v => v.trim()).filter(v => v));
      } else if (Array.isArray(brandIdentity.valueProps)) {
        valuePropsArray.push(...(brandIdentity.valueProps as string[]));
      }
    }
    // Ajouter les features si pas de valueProps
    if (valuePropsArray.length === 0 && Array.isArray(brandIdentity.features)) {
      valuePropsArray.push(...brandIdentity.features.filter(f => !f.startsWith('DO:') && !f.startsWith('DONT:') && !f.startsWith('#')));
    }
    // Valeur par défaut si toujours vide
    if (valuePropsArray.length === 0) {
      valuePropsArray.push('Innovation', 'Qualité', 'Service client');
    }

    await generateStrategy({
      brand_name: brandIdentity.name,
      positioning: brandIdentity.mission,
      target_audience: brandIdentity.targetAudience || 'Startups et PME',
      value_props: valuePropsArray,
      start_date: new Date().toISOString().split('T')[0],
      duration_days: 30,
      language: 'fr-FR',
      tone: brandIdentity.voice || 'professionnel',
      cta_targets: ['demo', 'newsletter', 'free_trial'],
      platforms: enabledPlatforms.length > 0 ? enabledPlatforms : ['LinkedIn', 'Twitter', 'Facebook'],
      startup_name: brandIdentity.startupName || brandIdentity.name,
      startup_url: brandIdentity.startupUrl || brandIdentity.website || ''
    });
  };

  const handlePublishToday = async () => {
    // Get enabled platforms from goals
    const enabledPlatforms = goals?.enabledNetworks || [];
    
    // Publier sur Twitter si activé
    if (enabledPlatforms.includes('twitter')) {
      try {
        // Récupère le contenu des posts approuvés pour aujourd'hui
        const approvedPosts = proposedPosts.filter(p => 
          p.status === 'approved' && 
          p.platform === 'Twitter'
        );
        
        if (approvedPosts.length > 0) {
          // Publie le premier post approuvé
          const postContent = approvedPosts[0].content || approvedPosts[0].key_message;
          console.log("Publication sur Twitter:", postContent);
          
          const result = await postToX(postContent);
          
          if (result.simulated) {
            console.warn("Tweet simulé (CORS bloqué). Pour une vraie publication, utilisez un backend proxy.");
            alert("Tweet simulé (CORS bloqué). Configurez un proxy backend pour publier réellement.");
          } else {
            console.log("Tweet publié avec succès !", result);
            alert("Tweet publié avec succès sur Twitter/X !");
            
            // Marque le post comme publié
            setProposedPosts(prev => prev.map(post =>
              post.id === approvedPosts[0].id 
                ? { ...post, status: 'published' as const }
                : post
            ));
          }
        } else {
          console.log("Aucun post Twitter approuvé pour aujourd'hui");
        }
      } catch (error) {
        console.error("Erreur lors de la publication sur Twitter:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert(`Erreur lors de la publication: ${errorMessage}`);
      }
    }
    
    // Appel à l'orchestration normale pour les autres plateformes
    try {
      await runOrchestration({
        company_name: brandIdentity?.name,
        execute_date: selectedDate,
        dry_run: false,
        platforms: enabledPlatforms.length > 0 ? enabledPlatforms : undefined,
        startup_name: brandIdentity?.startupName || brandIdentity?.name,
        startup_url: brandIdentity?.startupUrl || brandIdentity?.website
      });
      
      console.log("Orchestration complétée");
    } catch (error) {
      console.error("Erreur lors de l'orchestration:", error);
    }
  };

  const handleApprovePost = (postId: string) => {
    setProposedPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, status: 'approved' as const } : post
    ));
  };

  const handleApproveAll = () => {
    setProposedPosts(prev => prev.map(post => ({ ...post, status: 'approved' as const })));
  };

  const handleEditPost = (postId: string) => {
    const post = proposedPosts.find(p => p.id === postId);
    if (post) {
      setEditingPostId(postId);
      setEditContent(post.content || '');
    }
  };

  const handleSaveEdit = (postId: string) => {
    setProposedPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, content: editContent } : post
    ));
    setEditingPostId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent('');
  };

  const handleExport = () => {
    if (!currentStrategy) return;

    const dataStr = JSON.stringify(currentStrategy, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `strategy_${brandIdentity?.name}_${selectedDate}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Obtenir les posts du calendrier pour la sidebar
  const getUpcomingPosts = () => {
    if (!currentStrategy) return [];

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return currentStrategy.calendar.posts
      .filter(post => {
        const postDate = new Date(post.date);
        return postDate >= today && postDate <= nextWeek;
      })
      .slice(0, 5);
  };

  if (loadingActive) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!brandIdentity) {
    return (
      <EmptyState
        title="Configuration requise"
        description="Veuillez d'abord configurer votre profil de marque dans Setup"
      />
    );
  }

  const upcomingPosts = getUpcomingPosts();
  const approvedCount = proposedPosts.filter(p => p.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Stratégie & Posts</h2>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handleGenerateStrategy}
            disabled={loadingGenerate}
            className="btn btn-primary flex items-center gap-2"
          >
            {loadingGenerate ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {t.app.strategy.generateStrategy}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Section Stratégie */}
          <Card className="card-hover">
            <div className="card-body">
              <h3 className="text-lg font-medium mb-2">{language === 'fr' ? 'Stratégie générée' : 'Generated strategy'}</h3>

              {currentStrategy ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Campagne' : 'Campaign'}</p>
                      <p className="font-medium">{currentStrategy.campaign_name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Positionnement' : 'Positioning'}</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {currentStrategy.positioning}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{language === 'fr' ? 'Audience cible' : 'Target audience'}</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {currentStrategy.target_audience}
                      </p>
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="flex flex-wrap gap-2">
                    {currentStrategy.content_pillars.map((pillar, idx) => (
                      <span key={idx} className="badge">{pillar}</span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {language === 'fr' ? 'Votre stratégie personnalisée apparaîtra ici après génération.' : 'Your personalized strategy will appear here after generation.'}
                  </p>
                  <button
                    onClick={handleGenerateStrategy}
                    disabled={loadingGenerate}
                    className="btn btn-primary"
                  >
                    {t.app.strategy.generateStrategy}
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Section Posts proposés */}
          <Card className="card-hover">
            <div className="card-body">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-medium">{t.app.strategy.posts}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedDate} • {proposedPosts.length} posts • {approvedCount} {language === 'fr' ? 'approuvés' : 'approved'}
                  </p>
                </div>
                <button
                  onClick={handleApproveAll}
                  className="btn btn-secondary"
                  disabled={proposedPosts.length === 0}
                >
                  {language === 'fr' ? 'Tout approuver' : 'Approve all'}
                </button>
              </div>

              {/* Sélecteur de date */}
              <div className="mb-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={currentStrategy?.calendar.start_date}
                  max={currentStrategy?.calendar.end_date}
                  className="field"
                />
              </div>

              <div className="space-y-4">
                {proposedPosts.length > 0 ? (
                  proposedPosts.map(post => (
                    <article
                      key={post.id}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            post.platform === 'LinkedIn' ? 'primary' :
                            post.platform === 'Facebook' ? 'info' :
                            'default'
                          }>
                            {post.platform}
                          </Badge>
                          <Badge variant={
                            post.status === 'approved' ? 'success' :
                            post.status === 'scheduled' ? 'warning' :
                            'default'
                          }>
                            {post.status === 'draft' ? t.app.strategy.status.draft :
                             post.status === 'approved' ? t.app.strategy.status.approved :
                             post.status === 'scheduled' ? t.app.strategy.status.scheduled :
                             t.app.strategy.status.published}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {post.scheduledTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingPostId === post.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(post.id)}
                                className="btn btn-ghost px-2 py-1 text-xs"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="btn btn-ghost px-2 py-1 text-xs"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditPost(post.id)}
                                className="btn btn-ghost px-2 py-1 text-xs"
                              >
                                <Edit2 className="w-3 h-3 mr-1" />
                                {t.app.strategy.edit}
                              </button>
                              {post.status !== 'approved' && (
                                <button
                                  onClick={() => handleApprovePost(post.id)}
                                  className="btn btn-outline px-2 py-1 text-xs"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  {t.app.strategy.approve}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {editingPostId === post.id ? (
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="field w-full min-h-[100px]"
                          autoFocus
                        />
                      ) : (
                        <>
                          <p className="text-gray-700 dark:text-gray-300 mb-3">
                            {post.content}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Format: {post.variation.format}</span>
                            <span>CTA: {post.variation.cta_type}</span>
                            {post.image_required && <span>📷 Image requise</span>}
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500">
                              <strong>Message clé:</strong> {post.key_message}
                            </p>
                          </div>
                        </>
                      )}
                    </article>
                  ))
                ) : (
                  <EmptyState
                    title={language === 'fr' ? "Aucun post pour cette date" : "No posts for this date"}
                    description={language === 'fr' ? "Sélectionnez une autre date ou générez une stratégie" : "Select another date or generate a strategy"}
                  />
                )}
              </div>

              {/* Actions de publication */}
              {proposedPosts.length > 0 && approvedCount > 0 && (
                <div className="mt-6 pt-6 border-t flex justify-end gap-2">
                  <button
                    onClick={handlePublishToday}
                    disabled={loadingOrchestrate}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {loadingOrchestrate ? (
                      <Send className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {language === 'fr' ? `Publier ${approvedCount} post${approvedCount > 1 ? 's' : ''}` : `Publish ${approvedCount} post${approvedCount > 1 ? 's' : ''}`}
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Calendrier éditorial */}
          <Card className="card-hover">
            <div className="card-body">
              <h3 className="text-lg font-medium mb-4">
                <Calendar className="w-4 h-4 inline mr-2" />
                {t.app.strategy.calendar}
              </h3>

              {upcomingPosts.length > 0 ? (
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {upcomingPosts.filter(post => {
                    // Filter by enabled platforms
                    const enabledPlatforms = goals?.enabledNetworks?.map(n => n.charAt(0).toUpperCase() + n.slice(1)) || [];
                    return enabledPlatforms.length === 0 || enabledPlatforms.includes(post.platform);
                  }).map((post, idx) => {
                    const postDate = new Date(post.date);
                    const dayName = postDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long' });
                    const dateStr = postDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' });

                    return (
                      <li
                        key={idx}
                        className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        onClick={() => setSelectedDate(post.date)}
                      >
                        <div>
                          <div className="font-medium capitalize">{dayName} {dateStr}</div>
                          <div className="text-xs text-gray-500">
                            {post.platform} • {post.pillar}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  {language === 'fr' ? 'Aucun post programmé pour les 7 prochains jours' : 'No posts scheduled for the next 7 days'}
                </p>
              )}

              <div className="mt-4">
                <button
                  className="btn btn-outline w-full text-xs"
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                >
                  {t.app.strategy.today}
                </button>
              </div>
            </div>
          </Card>

          {/* Statistiques rapides */}
          <Card className="card-hover">
            <div className="card-body">
              <h3 className="text-lg font-medium mb-4">{language === 'fr' ? 'Statistiques' : 'Statistics'}</h3>

              {currentStrategy ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'fr' ? 'Total posts' : 'Total posts'}</span>
                    <span className="font-medium">{currentStrategy.calendar.total_posts}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'fr' ? 'Durée' : 'Duration'}</span>
                    <span className="font-medium">
                      {Math.ceil(
                        (new Date(currentStrategy.calendar.end_date).getTime() -
                         new Date(currentStrategy.calendar.start_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                      )} {language === 'fr' ? 'jours' : 'days'}
                    </span>
                  </div>

                  <div className="divider my-2" />

                  {Object.entries(currentStrategy.calendar.posts_per_platform).map(([platform, count]) => (
                    <div key={platform} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{platform}</span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Générez une stratégie pour voir les statistiques
                </p>
              )}
            </div>
          </Card>
        </aside>
      </div>

      {/* Actions mobiles */}
      <div className="sm:hidden">
        <button
          onClick={handleGenerateStrategy}
          disabled={loadingGenerate}
          className="btn btn-primary w-full"
        >
          {t.app.strategy.generateStrategy}
        </button>
      </div>
    </div>
  );
}

export default StrategyEnhanced;
