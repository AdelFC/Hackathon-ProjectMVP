import { useEffect, useState } from 'react';
import {
  mockKPIs,
  mockNetworkStats,
  mockTimeSeriesData,
  mockTopPosts,
  mockInsights,
  mockEngagementByPlatform,
  mockContentPerformance,
  mockWeeklyComparison,
  mockAudienceDemographics,
} from '../data/mockAnalyticsData';

export default function AnalyticsEnhanced() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('impressions');

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Create sparkline path
  const createSparkline = (data: number[], width = 120, height = 40) => {
    if (!data.length) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);
    
    return data
      .map((value, i) => {
        const x = i * step;
        const y = height - ((value - min) / range) * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  // Create area chart path
  const createAreaPath = (data: number[], width = 600, height = 200) => {
    if (!data.length) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);
    
    const linePath = data
      .map((value, i) => {
        const x = i * step;
        const y = height - ((value - min) / range) * height * 0.9 - 10;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
    
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with period selector */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockKPIs.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-600">{kpi.label}</p>
              <span className={`text-sm font-medium ${
                kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'} {Math.abs(kpi.change)}%
              </span>
            </div>
            <p className="text-2xl font-bold mb-3">
              {kpi.label.includes('Rate') ? `${kpi.value}%` : formatNumber(kpi.value)}
            </p>
            <svg width="120" height="40" className="w-full">
              <defs>
                <linearGradient id={`gradient-${kpi.label}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={kpi.trend === 'up' ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={kpi.trend === 'up' ? '#10b981' : '#ef4444'} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={createSparkline(mockTimeSeriesData.slice(-7).map(d => d.impressions))}
                fill="none"
                stroke={kpi.trend === 'up' ? '#10b981' : '#ef4444'}
                strokeWidth="2"
              />
              <path
                d={createAreaPath(mockTimeSeriesData.slice(-7).map(d => d.impressions), 120, 40)}
                fill={`url(#gradient-${kpi.label})`}
                opacity="0.3"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Main charts section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Performance over time */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Performance Trends</h3>
            <div className="flex gap-2 mt-2">
              {['impressions', 'engagement', 'clicks'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedMetric === metric
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 relative">
            <svg width="100%" height="100%" viewBox="0 0 600 250" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 50}
                  x2="600"
                  y2={i * 50}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
              {/* Data visualization */}
              <path
                d={createAreaPath(
                  mockTimeSeriesData.map(d => 
                    selectedMetric === 'impressions' ? d.impressions :
                    selectedMetric === 'engagement' ? d.engagement * 1000 :
                    d.clicks
                  ),
                  600,
                  200
                )}
                fill="url(#chartGradient)"
              />
              <path
                d={createSparkline(
                  mockTimeSeriesData.map(d => 
                    selectedMetric === 'impressions' ? d.impressions :
                    selectedMetric === 'engagement' ? d.engagement * 1000 :
                    d.clicks
                  ),
                  600,
                  200
                )}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Platform Performance</h3>
          <div className="space-y-4">
            {mockNetworkStats.map((network) => (
              <div key={network.platform} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      network.platform === 'linkedin' ? 'bg-blue-600' :
                      network.platform === 'twitter' ? 'bg-sky-500' :
                      'bg-blue-800'
                    }`} />
                    <span className="font-medium capitalize">{network.platform}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatNumber(network.reach)} reach
                  </span>
                </div>
                <div className="relative">
                  <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        network.platform === 'linkedin' ? 'bg-blue-600' :
                        network.platform === 'twitter' ? 'bg-sky-500' :
                        'bg-blue-800'
                      }`}
                      style={{ width: `${(network.reach / 70000) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-600">
                    <span>{formatNumber(network.followers)} followers</span>
                    <span>{network.engagement}% engagement</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Posts and Insights */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Posts */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performing Posts</h3>
          <div className="space-y-3">
            {mockTopPosts.map((post, index) => (
              <div key={post.id} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-600">
                  #{index + 1}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      post.platform === 'LinkedIn' ? 'bg-blue-100 text-blue-700' :
                      post.platform === 'Twitter' ? 'bg-sky-100 text-sky-700' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {post.platform}
                    </span>
                    <span className="text-xs text-gray-500">{post.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-600">
                    <span>👁 {formatNumber(post.reach)} views</span>
                    <span>💬 {post.engagement} engagements</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
          <div className="space-y-3">
            {mockInsights.slice(0, 4).map((insight) => (
              <div key={insight.id} className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    insight.type === 'what_works' ? 'bg-green-500' :
                    insight.type === 'to_test' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                      insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {insight.priority} priority
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* By Content Type */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Performance by Content Type</h3>
          <div className="space-y-3">
            {mockContentPerformance.byType.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.type}</span>
                  <span className="text-gray-600">{item.performance}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${item.performance}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Demographics */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Audience Demographics</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {/* Age Distribution */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Age Groups</p>
              <div className="space-y-1">
                {mockAudienceDemographics.byAge.slice(0, 3).map((age) => (
                  <div key={age.range} className="text-xs">
                    <span className="font-medium">{age.percentage}%</span>
                    <span className="text-gray-500 ml-1">{age.range}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Device Usage */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Devices</p>
              <div className="space-y-1">
                {mockAudienceDemographics.byDevice.map((device) => (
                  <div key={device.device} className="text-xs">
                    <span className="font-medium">{device.percentage}%</span>
                    <span className="text-gray-500 ml-1">{device.device}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Top Locations */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Top Locations</p>
              <div className="space-y-1">
                {mockAudienceDemographics.byLocation.slice(0, 3).map((loc) => (
                  <div key={loc.country} className="text-xs">
                    <span className="font-medium">{loc.percentage}%</span>
                    <span className="text-gray-500 ml-1 truncate">{loc.country}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}