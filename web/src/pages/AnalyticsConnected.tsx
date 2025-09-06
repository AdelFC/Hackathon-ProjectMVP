import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Heart, Share2, MessageCircle } from 'lucide-react';
import { useAnalytics } from '../hooks/useApi';
import { useProjectStore } from '../stores/projectStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, icon }: MetricCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        <div className="text-gray-400">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function AnalyticsConnected() {
  const { brandIdentity } = useProjectStore();
  const { analytics, loading, fetchAnalytics, fetchYesterdayAnalytics } = useAnalytics();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  useEffect(() => {
    // Charger les analytics au montage
    fetchAnalytics(dateRange.start, dateRange.end);
  }, [dateRange.start, dateRange.end, fetchAnalytics]);

  // Calculer les métriques agrégées
  const metrics = analytics ? {
    totalImpressions: analytics.reduce((sum, a) => sum + a.impressions, 0),
    totalEngagements: analytics.reduce((sum, a) => sum + a.engagements, 0),
    totalClicks: analytics.reduce((sum, a) => sum + a.clicks, 0),
    avgEngagementRate: analytics.length > 0 
      ? (analytics.reduce((sum, a) => sum + a.engagement_rate, 0) / analytics.length).toFixed(2)
      : 0,
    totalLikes: analytics.reduce((sum, a) => sum + a.likes, 0),
    totalComments: analytics.reduce((sum, a) => sum + a.comments, 0),
    totalShares: analytics.reduce((sum, a) => sum + a.shares, 0)
  } : null;

  // Filtrer par plateforme
  const filteredAnalytics = selectedPlatform === 'all' 
    ? analytics 
    : analytics?.filter(a => a.platform.toLowerCase() === selectedPlatform);

  // Préparer les données pour les graphiques
  const chartData = filteredAnalytics?.reduce((acc, item) => {
    const date = item.measured_at.split('T')[0];
    const existing = acc.find(d => d.date === date);
    
    if (existing) {
      existing.impressions += item.impressions;
      existing.engagements += item.engagements;
      existing.clicks += item.clicks;
    } else {
      acc.push({
        date,
        impressions: item.impressions,
        engagements: item.engagements,
        clicks: item.clicks
      });
    }
    
    return acc;
  }, [] as any[]) || [];

  // Trier par date
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Données par plateforme
  const platformData = analytics?.reduce((acc, item) => {
    const platform = item.platform;
    if (!acc[platform]) {
      acc[platform] = {
        name: platform,
        posts: 0,
        impressions: 0,
        engagements: 0,
        engagement_rate: 0
      };
    }
    
    acc[platform].posts += 1;
    acc[platform].impressions += item.impressions;
    acc[platform].engagements += item.engagements;
    
    return acc;
  }, {} as Record<string, any>) || {};

  const platformChartData = Object.values(platformData).map(p => ({
    ...p,
    engagement_rate: p.impressions > 0 ? ((p.engagements / p.impressions) * 100).toFixed(2) : 0
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="label">Période</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="field"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="field"
              />
            </div>
          </div>
          
          <div>
            <label className="label">Plateforme</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="field"
            >
              <option value="all">Toutes</option>
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Impressions totales"
          value={metrics?.totalImpressions.toLocaleString() || 0}
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          title="Engagements"
          value={metrics?.totalEngagements.toLocaleString() || 0}
          icon={<Heart className="w-5 h-5" />}
        />
        <MetricCard
          title="Taux d'engagement"
          value={`${metrics?.avgEngagementRate || 0}%`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          title="Clics"
          value={metrics?.totalClicks.toLocaleString() || 0}
          icon={<MessageCircle className="w-5 h-5" />}
        />
      </div>

      {/* Graphiques */}
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Évolution temporelle</TabsTrigger>
          <TabsTrigger value="platforms">Par plateforme</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Évolution des métriques</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
                />
                <Line 
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="#3b82f6" 
                  name="Impressions"
                />
                <Line 
                  type="monotone" 
                  dataKey="engagements" 
                  stroke="#10b981" 
                  name="Engagements"
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#f59e0b" 
                  name="Clics"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="platforms">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance par plateforme</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="impressions" fill="#3b82f6" name="Impressions" />
                <Bar dataKey="engagements" fill="#10b981" name="Engagements" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Détail des engagements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto text-red-500 mb-2" />
                <p className="text-2xl font-bold">{metrics?.totalLikes.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">J'aime</p>
              </div>
              
              <div className="text-center">
                <MessageCircle className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{metrics?.totalComments.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Commentaires</p>
              </div>
              
              <div className="text-center">
                <Share2 className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold">{metrics?.totalShares.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Partages</p>
              </div>
            </div>

            {/* Top posts */}
            <div className="mt-8">
              <h4 className="font-medium mb-4">Top posts</h4>
              <div className="space-y-3">
                {filteredAnalytics?.sort((a, b) => b.engagement_rate - a.engagement_rate)
                  .slice(0, 5)
                  .map((post, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                        <div>
                          <Badge variant="info">{post.platform}</Badge>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {new Date(post.measured_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{post.engagement_rate.toFixed(2)}%</p>
                        <p className="text-xs text-gray-500">
                          {post.engagements} engagements
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}