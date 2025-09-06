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
      const todayPosts = currentStrategy.calendar.posts
        .filter(post => post.date === selectedDate)
        .map(post => ({
          ...post,
          id: `${post.platform}_${post.date}_${Math.random()}`,
          status: 'draft' as const,
          content: generatePostContent(post),
          scheduledTime: getScheduledTime(post.platform)
        }));
      setProposedPosts(todayPosts);
    }
  }, [currentStrategy, selectedDate]);

  // Générer le contenu d'un post basé sur ses caractéristiques
  const generatePostContent = (post: DailyPost): string => {
    const templates = {
      LinkedIn: [
        `🚀 ${post.key_message}\n\n${post.topic}\n\n#innovation #tech #startup`,
        `Découvrez comment ${post.topic} peut transformer votre business.\n\n${post.key_message}\n\n#business #growth`
      ],
      Facebook: [
        `${post.key_message} 🎯\n\n${post.topic}\n\nQu'en pensez-vous ? Partagez votre avis en commentaire !`,
        `📣 ${post.topic}\n\n${post.key_message}\n\n👉 En savoir plus sur notre site`
      ],
      Twitter: [
        `${post.key_message}\n\n${post.topic}\n\n#tech #innovation`,
        `💡 ${post.topic}\n\n${post.key_message}`
      ]
    };

    const platformTemplates = templates[post.platform as keyof typeof templates] || templates.Twitter;
    return platformTemplates[Math.floor(Math.random() * platformTemplates.length)];
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

    await generateStrategy({
      brand_name: brandIdentity.name,
      positioning: brandIdentity.mission,
      target_audience: brandIdentity.targetAudience,
      value_props: brandIdentity.features,
      start_date: new Date().toISOString().split('T')[0],
      duration_days: 30,
      language: 'fr-FR',
      tone: brandIdentity.voice,
      cta_targets: ['demo', 'newsletter', 'free_trial'],
      startup_name: brandIdentity.startupName || brandIdentity.name,  // Use brand name as fallback
      startup_url: brandIdentity.startupUrl || brandIdentity.website   // Use website as fallback
    });
  };

  const handlePublishToday = async () => {
    await runOrchestration({
      company_name: brandIdentity?.name,
      execute_date: selectedDate,
      dry_run: false,
      startup_name: brandIdentity?.startupName || brandIdentity?.name,  // Use brand name as fallback
      startup_url: brandIdentity?.startupUrl || brandIdentity?.website   // Use website as fallback
    });
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
            onClick={handleExport}
            className="btn btn-outline flex items-center gap-2"
            disabled={!currentStrategy}
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
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
            Générer
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Section Stratégie */}
          <Card className="card-hover">
            <div className="card-body">
              <h3 className="text-lg font-medium mb-2">Stratégie générée</h3>

              {currentStrategy ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Campagne</p>
                      <p className="font-medium">{currentStrategy.campaign_name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Positionnement</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {currentStrategy.positioning}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Audience cible</p>
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
                    Votre stratégie personnalisée apparaîtra ici après génération.
                  </p>
                  <button
                    onClick={handleGenerateStrategy}
                    disabled={loadingGenerate}
                    className="btn btn-primary"
                  >
                    Générer ma stratégie
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
                  <h3 className="text-lg font-medium">Posts proposés</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedDate} • {proposedPosts.length} posts • {approvedCount} approuvés
                  </p>
                </div>
                <button
                  onClick={handleApproveAll}
                  className="btn btn-secondary"
                  disabled={proposedPosts.length === 0}
                >
                  Tout approuver
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
                            {post.status === 'draft' ? 'Brouillon' :
                             post.status === 'approved' ? 'Approuvé' :
                             post.status === 'scheduled' ? 'Programmé' :
                             'Publié'}
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
                                Éditer
                              </button>
                              {post.status !== 'approved' && (
                                <button
                                  onClick={() => handleApprovePost(post.id)}
                                  className="btn btn-outline px-2 py-1 text-xs"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Approuver
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
                    title="Aucun post pour cette date"
                    description="Sélectionnez une autre date ou générez une stratégie"
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
                    Publier {approvedCount} post{approvedCount > 1 ? 's' : ''}
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
                Calendrier éditorial
              </h3>

              {upcomingPosts.length > 0 ? (
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {upcomingPosts.map((post, idx) => {
                    const postDate = new Date(post.date);
                    const dayName = postDate.toLocaleDateString('fr-FR', { weekday: 'long' });
                    const dateStr = postDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

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
                  Aucun post programmé pour les 7 prochains jours
                </p>
              )}

              <div className="mt-4">
                <button
                  className="btn btn-outline w-full text-xs"
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                >
                  Voir aujourd'hui
                </button>
              </div>
            </div>
          </Card>

          {/* Statistiques rapides */}
          <Card className="card-hover">
            <div className="card-body">
              <h3 className="text-lg font-medium mb-4">Statistiques</h3>

              {currentStrategy ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total posts</span>
                    <span className="font-medium">{currentStrategy.calendar.total_posts}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Durée</span>
                    <span className="font-medium">
                      {Math.ceil(
                        (new Date(currentStrategy.calendar.end_date).getTime() -
                         new Date(currentStrategy.calendar.start_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                      )} jours
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

          {/* Raccourcis */}
          <Card className="card-hover">
            <div className="card-body">
              <h3 className="text-lg font-medium mb-4">Raccourcis</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>Générer stratégie</span>
                  <span className="kbd">Ctrl+G</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Approuver tout</span>
                  <span className="kbd">Ctrl+A</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Publier</span>
                  <span className="kbd">Ctrl+Enter</span>
                </li>
              </ul>
            </div>
          </Card>
        </aside>
      </div>

      {/* Actions mobiles */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="btn btn-outline w-full"
            disabled={!currentStrategy}
          >
            Exporter
          </button>
          <button
            onClick={handleGenerateStrategy}
            disabled={loadingGenerate}
            className="btn btn-primary w-full"
          >
            Générer
          </button>
        </div>
      </div>
    </div>
  );
}

export default StrategyEnhanced;
