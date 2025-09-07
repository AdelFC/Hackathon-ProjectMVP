import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Eye, Send } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { useStrategyStore } from '../stores/strategyStore';
import { useStrategyGeneration, useOrchestration, useActiveStrategy } from '../hooks/useApi';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { DailyPost } from '../services/api';

export function StrategyConnected() {
  const { brandIdentity, goals } = useProjectStore();
  const {
    activeStrategy: storedStrategy,
    setActiveStrategy,
    markSynced
  } = useStrategyStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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

  // Synchroniser avec le store quand on récupère une stratégie de l'API
  useEffect(() => {
    if (apiStrategy) {
      setActiveStrategy(apiStrategy);
      markSynced();
    }
  }, [apiStrategy, setActiveStrategy, markSynced]);

  // Synchroniser avec le store quand on génère une nouvelle stratégie
  useEffect(() => {
    if (strategy) {
      setActiveStrategy(strategy);
      markSynced();
    }
  }, [strategy, setActiveStrategy, markSynced]);

  // Utiliser la stratégie du store en priorité
  const currentStrategy = storedStrategy || strategy || apiStrategy;

  // Générer le contenu d'un post basé sur ses caractéristiques et les données du formulaire
  const generatePostContent = (post: DailyPost): string => {
    // Extraire les hashtags personnalisés depuis les features
    const customHashtags = brandIdentity?.features
      .filter(f => f.startsWith('#'))
      .map(h => h.replace('#', ''))
      .slice(0, 3) || [];
    
    // Créer des hashtags adaptés au contexte
    const platformHashtags = {
      LinkedIn: [...customHashtags, 'innovation', 'business'].slice(0, 5),
      Facebook: [...customHashtags, 'startup', 'tech'].slice(0, 4),
      Twitter: [...customHashtags, 'tech'].slice(0, 3)
    };
    
    const hashtags = platformHashtags[post.platform as keyof typeof platformHashtags]
      .map(h => `#${h}`)
      .join(' ');
    
    // Templates enrichis avec les données réelles
    const templates = {
      LinkedIn: [
        `🚀 ${post.key_message}\n\n${post.topic}\n\n💡 ${brandIdentity?.usp || ''}\n\n${hashtags}`,
        `Découvrez comment ${post.topic} peut transformer votre business.\n\n${post.key_message}\n\n🎯 Pour: ${brandIdentity?.targetAudience || 'professionnels innovants'}\n\n${hashtags}`
      ],
      Facebook: [
        `${post.key_message} 🎯\n\n${post.topic}\n\n${brandIdentity?.mission || ''}\n\nQu'en pensez-vous ? Partagez votre avis en commentaire !\n\n${hashtags}`,
        `📣 ${post.topic}\n\n${post.key_message}\n\n✨ ${brandIdentity?.usp || ''}\n\n👉 En savoir plus sur notre site\n\n${hashtags}`
      ],
      Twitter: [
        `${post.key_message}\n\n${post.topic}\n\n${hashtags}`,
        `💡 ${post.topic}\n\n${brandIdentity?.name}: ${post.key_message}\n\n${hashtags}`
      ]
    };

    const platformTemplates = templates[post.platform as keyof typeof templates] || templates.Twitter;
    return platformTemplates[Math.floor(Math.random() * platformTemplates.length)];
  };

  const handleGenerateStrategy = async () => {
    if (!brandIdentity || !goals) return;

    // Extraire les vraies propositions de valeur depuis l'USP
    const valuePropositions = brandIdentity.usp 
      ? brandIdentity.usp.split(',').map(v => v.trim()).filter(v => v)
      : brandIdentity.features.filter(f => !f.startsWith('DO:') && !f.startsWith('DONT:') && !f.startsWith('#'));

    // S'assurer que l'audience cible est bien renseignée
    const targetAudience = brandIdentity.targetAudience || 'Entreprises innovantes et startups tech';
    
    // Extraire les hashtags depuis les features
    const hashtags = brandIdentity.features.filter(f => f.startsWith('#')).join(' ');
    
    // Extraire les Do/Don't pour les guidelines éditoriales
    const doList = brandIdentity.features.filter(f => f.startsWith('DO:')).map(f => f.replace('DO:', ''));
    const dontList = brandIdentity.features.filter(f => f.startsWith('DONT:')).map(f => f.replace('DONT:', ''));

    await generateStrategy({
      brand_name: brandIdentity.name,
      positioning: brandIdentity.mission,
      target_audience: targetAudience,
      value_props: valuePropositions.length > 0 ? valuePropositions : [
        'Solution innovante',
        'Gain de temps',
        'Expertise reconnue',
        'Support personnalisé'
      ],
      start_date: new Date().toISOString().split('T')[0],
      duration_days: 30,
      language: 'fr-FR',
      tone: brandIdentity.voice + (hashtags ? `. Hashtags: ${hashtags}` : '') + (doList.length ? `. À faire: ${doList.join(', ')}` : '') + (dontList.length ? `. À éviter: ${dontList.join(', ')}` : ''),
      cta_targets: ['demo', 'newsletter', 'free_trial', 'contact'],
      startup_name: brandIdentity.startupName || brandIdentity.name,  // Use brand name as fallback
      startup_url: brandIdentity.startupUrl || brandIdentity.website,   // Use website as fallback
      platforms: goals?.enabledNetworks?.map(n => n.charAt(0).toUpperCase() + n.slice(1)) || ['LinkedIn', 'Facebook', 'Twitter']
    });
  };

  const handlePublishToday = async () => {
    await runOrchestration({
      company_name: brandIdentity?.name,
      execute_date: selectedDate,
      dry_run: false,
      startup_name: brandIdentity?.startupName || brandIdentity?.name,
      startup_url: brandIdentity?.startupUrl || brandIdentity?.website,
      platforms: goals?.enabledNetworks?.map(n => n.charAt(0).toUpperCase() + n.slice(1)) || ['LinkedIn', 'Facebook', 'Twitter']
    });
  };

  const handleDryRun = async () => {
    await runOrchestration({
      company_name: brandIdentity?.name,
      execute_date: selectedDate,
      dry_run: true,
      startup_name: brandIdentity?.startupName || brandIdentity?.name,
      startup_url: brandIdentity?.startupUrl || brandIdentity?.website,
      platforms: goals?.enabledNetworks?.map(n => n.charAt(0).toUpperCase() + n.slice(1)) || ['LinkedIn', 'Facebook', 'Twitter']
    });
  };

  // Filtrer les posts pour la date sélectionnée ET les plateformes activées
  const enabledPlatforms = goals?.enabledNetworks?.map(n => n.charAt(0).toUpperCase() + n.slice(1)) || [];
  const todayPosts = currentStrategy?.calendar.posts.filter(
    post => post.date === selectedDate && 
            (enabledPlatforms.length === 0 || enabledPlatforms.includes(post.platform))
  ) || [];

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

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{brandIdentity.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {currentStrategy ? 'Stratégie active' : 'Aucune stratégie active'}
            </p>
          </div>

          <div className="flex gap-2">
            {!currentStrategy ? (
              <button
                onClick={handleGenerateStrategy}
                disabled={loadingGenerate}
                className="btn btn-primary"
              >
                {loadingGenerate ? 'Génération...' : 'Générer stratégie'}
              </button>
            ) : (
              <>
                <button
                  onClick={handleDryRun}
                  disabled={loadingOrchestrate}
                  className="btn btn-secondary"
                >
                  Test
                </button>
                <button
                  onClick={handlePublishToday}
                  disabled={loadingOrchestrate}
                  className="btn btn-primary"
                >
                  Publier aujourd'hui
                </button>
              </>
            )}
          </div>
        </div>
      </Card>

      {currentStrategy && (
        <>
          {/* Vue d'ensemble de la stratégie */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Vue d'ensemble</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Campagne</p>
                <p className="font-medium">{currentStrategy.campaign_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Période</p>
                <p className="font-medium">
                  {new Date(currentStrategy.calendar.start_date).toLocaleDateString()} -
                  {new Date(currentStrategy.calendar.end_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total posts</p>
                <p className="font-medium">{currentStrategy.calendar.total_posts}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Piliers de contenu</p>
              <div className="flex flex-wrap gap-2">
                {currentStrategy.content_pillars.map((pillar, idx) => (
                  <Badge key={idx} variant="info">
                    {pillar}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Sélecteur de date */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Calendrier éditorial</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={currentStrategy.calendar.start_date}
                max={currentStrategy.calendar.end_date}
                className="field"
              />
            </div>

            {/* Posts du jour sélectionné */}
            {todayPosts.length > 0 ? (
              <div className="space-y-4">
                {todayPosts.map((post, idx) => (
                  <article key={idx} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/60">
                    {/* Header avec badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          post.platform === 'LinkedIn' ? 'primary' :
                          post.platform === 'Facebook' ? 'info' :
                          'default'
                        }>
                          {post.platform}
                        </Badge>
                        <Badge variant="default">{post.pillar}</Badge>
                      </div>
                    </div>

                    {/* Titre du post */}
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{post.topic}</h4>
                    </div>

                    {/* Contenu généré du post */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        📝 Contenu du post :
                      </h5>
                      <div className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                        {generatePostContent(post)}
                      </div>
                    </div>

                    {/* Métadonnées */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Format: {post.variation.format}</span>
                        <span>CTA: {post.variation.cta_type}</span>
                        {post.image_required && <span>🖼️ Image requise</span>}
                      </div>

                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500">
                          <strong>Message clé:</strong> {post.key_message}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucun post prévu"
                description="Aucun contenu n'est planifié pour cette date"
              />
            )}
          </Card>

          {/* Guidelines éditoriales */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Guidelines éditoriales</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
                  ✓ À faire
                </h4>
                <ul className="space-y-1">
                  {currentStrategy.editorial_guidelines.do_list.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                  ✗ À éviter
                </h4>
                <ul className="space-y-1">
                  {currentStrategy.editorial_guidelines.dont_list.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
