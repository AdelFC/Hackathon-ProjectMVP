import {
  mockKPIs,
  mockNetworkStats,
  mockTimeSeriesData,
  mockTopPosts,
  mockInsights,
  mockEngagementByPlatform,
  mockContentPerformance,
} from '../data/mockAnalyticsData';

export default function Analytics() {
  // Transform KPIs for card display
  const cards = mockKPIs.map(kpi => ({
    k: kpi.label,
    v: kpi.label.includes('Rate') ? `${kpi.value}%` : 
        kpi.value >= 1000 ? `${(kpi.value / 1000).toFixed(1)}K` : kpi.value.toString(),
    d: `${kpi.trend === 'up' ? '+' : ''}${kpi.change}${kpi.label.includes('Followers') ? '' : '%'}`,
    up: kpi.trend === 'up',
    data: mockTimeSeriesData.slice(-7).map(d => 
      kpi.label.includes('Impression') ? d.impressions :
      kpi.label.includes('Engagement') ? d.engagement * 100 :
      kpi.label.includes('Click') ? d.clicks :
      1000 + Math.random() * 500
    )
  }))

  // Builds a simple sparkline path string scaled to width/height
  const spark = (values: number[], width = 120, height = 28) => {
    const min = Math.min(...values)
    const max = Math.max(...values)
    const step = width / (values.length - 1 || 1)
    const norm = (v: number) => {
      if (max === min) return height / 2
      return height - ((v - min) / (max - min)) * height
    }
    return values
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${norm(v)}`)
      .join(' ')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Analytics</h2>

      {/* KPI Cards with sparklines */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((m) => (
          <div key={m.k} className="card card-hover">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500">{m.k}</p>
                  <p className="text-2xl font-semibold">{m.v}</p>
                </div>
                <span className={`text-xs ${m.up ? 'text-emerald-600' : 'text-red-600'}`}>{m.d}</span>
              </div>
              <div className="mt-3">
                <svg width="120" height="28" viewBox="0 0 120 28" className="block">
                  <path d={spark(m.data)} fill="none" stroke="rgb(var(--accent-600))" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts area */}
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="card card-hover">
          <div className="card-body">
            <h3 className="text-lg font-medium mb-4">Performance by Platform</h3>
            <div className="space-y-4">
              {mockNetworkStats.map((network) => (
                <div key={network.platform} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize font-medium">{network.platform}</span>
                    <span className="text-sm text-gray-600">{network.engagement}% engagement</span>
                  </div>
                  <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        network.platform === 'linkedin' ? 'bg-blue-600' :
                        network.platform === 'twitter' ? 'bg-sky-500' :
                        'bg-blue-800'
                      }`}
                      style={{ width: `${(network.reach / 70000) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{network.followers.toLocaleString()} followers</span>
                    <span>{(network.reach / 1000).toFixed(1)}K reach</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="card card-hover">
          <div className="card-body">
            <h3 className="text-lg font-medium mb-4">Top posts</h3>
            <ul className="space-y-3 text-sm">
              {mockTopPosts.slice(0, 5).map((post, index) => (
                <li key={post.id} className="flex justify-between items-start">
                  <div className="flex-grow mr-2">
                    <span className="font-medium">{post.platform} #{index + 1}</span>
                    <p className="text-xs text-gray-600 truncate mt-1">{post.content.substring(0, 50)}...</p>
                  </div>
                  <span className="font-medium text-emerald-600 whitespace-nowrap">
                    {post.engagement} eng.
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* AI Insights Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 card card-hover">
          <div className="card-body">
            <h3 className="text-lg font-medium mb-4">Content Performance Trends</h3>
            <div className="space-y-3">
              {mockContentPerformance.byType.map((item) => (
                <div key={item.type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.type}</span>
                    <span className="text-gray-600">{item.performance}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${item.performance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="card card-hover">
          <div className="card-body">
            <h3 className="text-lg font-medium mb-4">AI Insights</h3>
            <div className="space-y-2">
              {mockInsights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="p-2 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1 ${
                      insight.type === 'what_works' ? 'bg-green-500' :
                      insight.type === 'to_test' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="text-xs">
                      <p className="font-medium">{insight.title}</p>
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-xs ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                        insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {insight.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
