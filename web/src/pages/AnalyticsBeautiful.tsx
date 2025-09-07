import { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ComposedChart, Treemap
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Heart, Share2, MessageCircle, 
  Eye, Calendar, Target, Award, Activity, BarChart3
} from 'lucide-react';

// Generate comprehensive mock data
const generateMockData = () => {
  // Performance over time (30 days)
  const performanceData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    
    return {
      date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      impressions: Math.floor(4000 + Math.random() * 3000 * (isWeekend ? 0.7 : 1.2)),
      engagement: Math.floor(200 + Math.random() * 150 * (isWeekend ? 0.6 : 1.3)),
      clicks: Math.floor(150 + Math.random() * 100 * (isWeekend ? 0.5 : 1.1)),
      followers: Math.floor(50 + Math.random() * 30),
    };
  });

  // Platform distribution
  const platformData = [
    { name: 'LinkedIn', value: 42, color: '#0077B5', engagement: 4.2, growth: 12 },
    { name: 'Twitter', value: 28, color: '#1DA1F2', engagement: 3.1, growth: 8 },
    { name: 'Facebook', value: 30, color: '#1877F2', engagement: 3.8, growth: -2 },
  ];

  // Content performance by type
  const contentTypeData = [
    { type: 'Educational', engagement: 85, reach: 12000, posts: 15 },
    { type: 'Product Updates', engagement: 72, reach: 9500, posts: 12 },
    { type: 'Behind the Scenes', engagement: 68, reach: 8200, posts: 10 },
    { type: 'User Stories', engagement: 91, reach: 15000, posts: 8 },
    { type: 'Industry News', engagement: 45, reach: 5500, posts: 20 },
    { type: 'Tips & Tricks', engagement: 78, reach: 11000, posts: 18 },
  ];

  // Hourly engagement heatmap
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const peakHours = [9, 12, 18, 20];
    const isPeak = peakHours.includes(hour);
    return {
      hour: `${hour}:00`,
      Monday: isPeak ? 80 + Math.random() * 20 : 20 + Math.random() * 30,
      Tuesday: isPeak ? 75 + Math.random() * 25 : 25 + Math.random() * 35,
      Wednesday: isPeak ? 85 + Math.random() * 15 : 30 + Math.random() * 25,
      Thursday: isPeak ? 70 + Math.random() * 30 : 20 + Math.random() * 40,
      Friday: isPeak ? 65 + Math.random() * 35 : 15 + Math.random() * 35,
      Saturday: 30 + Math.random() * 40,
      Sunday: 25 + Math.random() * 35,
    };
  });

  // Top performing posts
  const topPosts = [
    { 
      id: 1, 
      platform: 'LinkedIn', 
      content: '🚀 Announcing our new AI-powered analytics dashboard...', 
      engagement: 1543, 
      reach: 25430,
      type: 'Product Update',
      sentiment: 92
    },
    { 
      id: 2, 
      platform: 'Twitter', 
      content: 'Thread: 10 lessons learned building a startup in 2024...', 
      engagement: 982, 
      reach: 18760,
      type: 'Educational',
      sentiment: 88
    },
    { 
      id: 3, 
      platform: 'Facebook', 
      content: 'Meet our team: Sarah, our lead developer who...', 
      engagement: 756, 
      reach: 14320,
      type: 'Behind the Scenes',
      sentiment: 95
    },
    { 
      id: 4, 
      platform: 'LinkedIn', 
      content: 'Case study: How Company X increased revenue by 300%...', 
      engagement: 698, 
      reach: 12890,
      type: 'User Story',
      sentiment: 90
    },
    { 
      id: 5, 
      platform: 'Twitter', 
      content: 'Quick tip: Use keyboard shortcuts to save 2 hours daily...', 
      engagement: 542, 
      reach: 9870,
      type: 'Tips & Tricks',
      sentiment: 85
    },
  ];

  // Audience demographics
  const audienceAge = [
    { age: '18-24', value: 15, male: 8, female: 7 },
    { age: '25-34', value: 35, male: 20, female: 15 },
    { age: '35-44', value: 28, male: 15, female: 13 },
    { age: '45-54', value: 15, male: 8, female: 7 },
    { age: '55+', value: 7, male: 4, female: 3 },
  ];

  const audienceCountries = [
    { country: 'USA', value: 4200 },
    { country: 'UK', value: 2100 },
    { country: 'Canada', value: 1800 },
    { country: 'Australia', value: 1200 },
    { country: 'France', value: 900 },
    { country: 'Germany', value: 800 },
    { country: 'Others', value: 2000 },
  ];

  // Conversion funnel
  const funnelData = [
    { stage: 'Impressions', value: 125000, color: '#3b82f6' },
    { stage: 'Engagements', value: 8750, color: '#6366f1' },
    { stage: 'Clicks', value: 3125, color: '#8b5cf6' },
    { stage: 'Conversions', value: 156, color: '#a855f7' },
  ];

  // Sentiment analysis
  const sentimentData = [
    { sentiment: 'Positive', value: 68, color: '#10b981' },
    { sentiment: 'Neutral', value: 24, color: '#6b7280' },
    { sentiment: 'Negative', value: 8, color: '#ef4444' },
  ];

  return {
    performanceData,
    platformData,
    contentTypeData,
    hourlyData,
    topPosts,
    audienceAge,
    audienceCountries,
    funnelData,
    sentimentData,
  };
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="font-semibold text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Metric card component
const MetricCard = ({ icon, title, value, change, trend, color }: any) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          <span className="text-sm font-medium">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <p className="text-gray-600 text-sm mb-1">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
    {change && (
      <p className="text-xs text-gray-500 mt-2">{change}</p>
    )}
  </div>
);

export default function AnalyticsBeautiful() {
  const [data, setData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  useEffect(() => {
    setData(generateMockData());
  }, []);

  if (!data) return <div>Loading...</div>;

  // Calculate summary metrics
  const totalImpressions = data.performanceData.reduce((sum: number, d: any) => sum + d.impressions, 0);
  const totalEngagement = data.performanceData.reduce((sum: number, d: any) => sum + d.engagement, 0);
  const totalClicks = data.performanceData.reduce((sum: number, d: any) => sum + d.clicks, 0);
  const totalFollowers = data.performanceData.reduce((sum: number, d: any) => sum + d.followers, 0);
  const avgEngagementRate = ((totalEngagement / totalImpressions) * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Analytics</h1>
            <p className="text-gray-600 mt-1">Suivez vos performances sur tous les réseaux sociaux</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<Eye className="w-5 h-5 text-blue-600" />}
            title="Impressions totales"
            value={totalImpressions.toLocaleString()}
            change="vs période précédente"
            trend={12.5}
            color="bg-blue-100"
          />
          <MetricCard
            icon={<Heart className="w-5 h-5 text-red-600" />}
            title="Engagement total"
            value={totalEngagement.toLocaleString()}
            change={`Taux: ${avgEngagementRate}%`}
            trend={8.3}
            color="bg-red-100"
          />
          <MetricCard
            icon={<Users className="w-5 h-5 text-green-600" />}
            title="Nouveaux abonnés"
            value={`+${totalFollowers.toLocaleString()}`}
            change="Croissance 30 jours"
            trend={15.2}
            color="bg-green-100"
          />
          <MetricCard
            icon={<Target className="w-5 h-5 text-purple-600" />}
            title="Taux de clic"
            value={`${((totalClicks / totalImpressions) * 100).toFixed(2)}%`}
            change={`${totalClicks.toLocaleString()} clics`}
            trend={-2.1}
            color="bg-purple-100"
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Performance Trends */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Tendances de performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.performanceData}>
                <defs>
                  <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#impressionsGradient)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#engagementGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.platformData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {data.platformData.map((platform: any) => (
                <div key={platform.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: platform.color }} />
                    <span>{platform.name}</span>
                  </div>
                  <div className="flex gap-4 text-gray-600">
                    <span>{platform.engagement}% eng.</span>
                    <span className={platform.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                      {platform.growth > 0 ? '+' : ''}{platform.growth}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Content Type Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.contentTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="type" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="engagement" fill="#3b82f6" name="Engagement Score" />
              <Line yAxisId="right" type="monotone" dataKey="reach" stroke="#10b981" name="Reach" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Advanced Analytics Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
            <div className="space-y-3">
              {data.funnelData.map((stage: any, index: number) => (
                <div key={stage.stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-gray-600">{stage.value.toLocaleString()}</span>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(stage.value / data.funnelData[0].value) * 100}%`,
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                  {index < data.funnelData.length - 1 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {((stage.value / data.funnelData[0].value) * 100).toFixed(1)}% conversion
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Audience Sentiment</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.sentimentData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {data.sentimentData.map((item: any) => (
                <div key={item.sentiment} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                    <span>{item.sentiment}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audience Demographics */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.audienceAge}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="age" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="male" stackId="a" fill="#3b82f6" />
                <Bar dataKey="female" stackId="a" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Posts */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Top Performing Posts</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-600 border-b">
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">Platform</th>
                  <th className="pb-3">Content</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Engagement</th>
                  <th className="pb-3">Reach</th>
                  <th className="pb-3">Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {data.topPosts.map((post: any, index: number) => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-semibold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.platform === 'LinkedIn' ? 'bg-blue-100 text-blue-700' :
                        post.platform === 'Twitter' ? 'bg-sky-100 text-sky-700' :
                        'bg-indigo-100 text-indigo-700'
                      }`}>
                        {post.platform}
                      </span>
                    </td>
                    <td className="py-3 max-w-xs truncate">{post.content}</td>
                    <td className="py-3 text-sm text-gray-600">{post.type}</td>
                    <td className="py-3 font-medium">{post.engagement.toLocaleString()}</td>
                    <td className="py-3 text-gray-600">{post.reach.toLocaleString()}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[60px]">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${post.sentiment}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{post.sentiment}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={data.audienceCountries}
              dataKey="value"
              aspectRatio={4/3}
              stroke="#fff"
              fill="#3b82f6"
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}