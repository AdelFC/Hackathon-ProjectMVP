import { mockTimeSeriesData } from '../data/mockAnalyticsData';

// Transform mock data to match API response format
export const generateMockAnalyticsData = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const platforms = ['LinkedIn', 'Facebook', 'Twitter'];
  const analyticsData: any[] = [];
  
  // Generate data for each day in the range
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    
    // Find corresponding data from mockTimeSeriesData or generate new
    const dayData = mockTimeSeriesData.find(d => d.date === dateStr) || {
      impressions: 3000 + Math.random() * 3000,
      engagement: 2 + Math.random() * 3,
      clicks: 50 + Math.random() * 100,
    };
    
    // Create entries for each platform
    platforms.forEach(platform => {
      // Add platform-specific variation
      const platformMultiplier = 
        platform === 'LinkedIn' ? 1.2 :
        platform === 'Twitter' ? 0.8 :
        1.0;
      
      const impressions = Math.round(dayData.impressions * platformMultiplier * (0.8 + Math.random() * 0.4));
      const engagements = Math.round(impressions * (dayData.engagement / 100));
      const clicks = Math.round(dayData.clicks * platformMultiplier * (0.8 + Math.random() * 0.4));
      
      analyticsData.push({
        id: `${platform}-${dateStr}-${Math.random()}`,
        platform,
        impressions,
        engagements,
        clicks,
        likes: Math.round(engagements * 0.6),
        comments: Math.round(engagements * 0.25),
        shares: Math.round(engagements * 0.15),
        engagement_rate: Number(((engagements / impressions) * 100).toFixed(2)),
        measured_at: `${dateStr}T12:00:00Z`,
        post_id: `post-${Math.random().toString(36).substr(2, 9)}`,
        brand_name: 'Demo Brand',
      });
    });
  }
  
  return analyticsData;
};

export const getMockYesterdayAnalytics = (brandName: string) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];
  
  return generateMockAnalyticsData(dateStr, dateStr);
};