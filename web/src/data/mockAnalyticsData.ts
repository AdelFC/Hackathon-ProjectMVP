import { KPI, NetworkStats, TimeSeriesData, TopPost, Insight } from '../stores/analyticsStore';

// Generate mock KPIs with realistic values
export const mockKPIs: KPI[] = [
  {
    label: 'Total Impressions',
    value: 125430,
    change: 12.5,
    trend: 'up',
  },
  {
    label: 'Engagement Rate',
    value: 3.8,
    change: 0.5,
    trend: 'up',
  },
  {
    label: 'Total Followers',
    value: 8234,
    change: 248,
    trend: 'up',
  },
  {
    label: 'Click-through Rate',
    value: 2.4,
    change: -0.3,
    trend: 'down',
  },
];

// Network-specific statistics
export const mockNetworkStats: NetworkStats[] = [
  {
    platform: 'linkedin',
    followers: 4523,
    engagement: 4.2,
    reach: 67890,
    posts: 32,
  },
  {
    platform: 'twitter',
    followers: 2456,
    engagement: 3.1,
    reach: 34567,
    posts: 48,
  },
  {
    platform: 'facebook',
    followers: 1255,
    engagement: 3.5,
    reach: 22973,
    posts: 28,
  },
];

// Generate 30 days of time series data
const generateTimeSeriesData = (): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Add some realistic variation
    const baseImpressions = 4000 + Math.random() * 2000;
    const baseEngagement = 2.5 + Math.random() * 1.5;
    const baseClicks = 80 + Math.random() * 40;
    
    // Add weekly patterns (weekends lower)
    const dayOfWeek = date.getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.2;
    
    data.push({
      date: date.toISOString().split('T')[0],
      impressions: Math.round(baseImpressions * weekendFactor),
      engagement: Number((baseEngagement * weekendFactor).toFixed(2)),
      clicks: Math.round(baseClicks * weekendFactor),
    });
  }
  
  return data;
};

export const mockTimeSeriesData = generateTimeSeriesData();

// Top performing posts
export const mockTopPosts: TopPost[] = [
  {
    id: 'post-1',
    platform: 'LinkedIn',
    content: '🚀 Excited to announce our new AI-powered feature that automates content scheduling! Our beta testers have seen a 40% increase in engagement...',
    engagement: 543,
    reach: 12450,
    date: '2025-01-05',
  },
  {
    id: 'post-2',
    platform: 'Twitter',
    content: 'Thread: Why every startup needs a solid content strategy in 2025 🧵\n\n1/ Content is no longer optional - it\'s your primary growth engine...',
    engagement: 421,
    reach: 8932,
    date: '2025-01-04',
  },
  {
    id: 'post-3',
    platform: 'Facebook',
    content: '📊 Case Study: How we helped a B2B SaaS increase their lead generation by 250% in just 3 months using strategic content marketing...',
    engagement: 387,
    reach: 7654,
    date: '2025-01-03',
  },
  {
    id: 'post-4',
    platform: 'LinkedIn',
    content: '💡 The future of work is here, and it\'s powered by AI. Here are 5 ways artificial intelligence is transforming how we collaborate...',
    engagement: 356,
    reach: 6789,
    date: '2025-01-02',
  },
  {
    id: 'post-5',
    platform: 'Twitter',
    content: 'Hot take: Email marketing isn\'t dead, it\'s just been doing push-ups 💪\n\nOur latest campaign hit 42% open rates. Here\'s how...',
    engagement: 298,
    reach: 5432,
    date: '2025-01-01',
  },
];

// AI-generated insights
export const mockInsights: Insight[] = [
  {
    id: 'insight-1',
    type: 'what_works',
    title: 'Video content drives 3x more engagement',
    description: 'Posts with video content are getting 3x more engagement than text-only posts. Consider increasing video production for LinkedIn.',
    priority: 'high',
  },
  {
    id: 'insight-2',
    type: 'what_works',
    title: 'Morning posts perform better',
    description: 'Posts published between 8-10 AM get 45% more impressions. Your audience is most active during morning commute hours.',
    priority: 'high',
  },
  {
    id: 'insight-3',
    type: 'to_test',
    title: 'Try carousel posts on LinkedIn',
    description: 'Carousel posts are trending on LinkedIn with 2.3x higher engagement rates. Test this format with your educational content.',
    priority: 'medium',
  },
  {
    id: 'insight-4',
    type: 'to_test',
    title: 'Experiment with Twitter Spaces',
    description: 'Audio content is gaining traction. Host a weekly Twitter Space to discuss industry trends and engage with your community.',
    priority: 'medium',
  },
  {
    id: 'insight-5',
    type: 'next_action',
    title: 'Optimize hashtag strategy',
    description: 'Your current hashtags have low discovery rates. Research and implement trending industry hashtags to increase reach by up to 30%.',
    priority: 'high',
  },
  {
    id: 'insight-6',
    type: 'next_action',
    title: 'Increase Facebook posting frequency',
    description: 'Facebook engagement is below average. Increase posting frequency from 3 to 5 times per week to maintain audience attention.',
    priority: 'low',
  },
];

// Additional data for charts
export const mockEngagementByPlatform = [
  { platform: 'LinkedIn', value: 42, color: '#0A66C2' },
  { platform: 'Twitter', value: 31, color: '#1DA1F2' },
  { platform: 'Facebook', value: 27, color: '#1877F2' },
];

export const mockContentPerformance = {
  byType: [
    { type: 'Educational', performance: 85 },
    { type: 'Product Updates', performance: 72 },
    { type: 'Behind the Scenes', performance: 68 },
    { type: 'User Stories', performance: 91 },
    { type: 'Industry News', performance: 45 },
  ],
  byFormat: [
    { format: 'Video', engagement: 4.2 },
    { format: 'Carousel', engagement: 3.8 },
    { format: 'Image', engagement: 3.1 },
    { format: 'Text', engagement: 2.4 },
    { format: 'Poll', engagement: 3.5 },
  ],
};

// Weekly performance comparison
export const mockWeeklyComparison = [
  { week: 'Week 1', current: 32450, previous: 28900 },
  { week: 'Week 2', current: 35680, previous: 31200 },
  { week: 'Week 3', current: 38920, previous: 33450 },
  { week: 'Week 4', current: 41230, previous: 35100 },
];

// Audience demographics
export const mockAudienceDemographics = {
  byAge: [
    { range: '18-24', percentage: 12 },
    { range: '25-34', percentage: 35 },
    { range: '35-44', percentage: 28 },
    { range: '45-54', percentage: 18 },
    { range: '55+', percentage: 7 },
  ],
  byLocation: [
    { country: 'United States', percentage: 42 },
    { country: 'United Kingdom', percentage: 18 },
    { country: 'Canada', percentage: 12 },
    { country: 'Australia', percentage: 8 },
    { country: 'France', percentage: 6 },
    { country: 'Others', percentage: 14 },
  ],
  byDevice: [
    { device: 'Mobile', percentage: 67 },
    { device: 'Desktop', percentage: 28 },
    { device: 'Tablet', percentage: 5 },
  ],
};