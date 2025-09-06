export default function Analytics() {
  const cards = [
    { k: 'Impressions', v: '12.5K', d: '+12%', up: true, data: [10, 18, 14, 22, 28, 26, 32] },
    { k: 'Engagement', v: '3.2%', d: '+5%', up: true, data: [2.0, 2.4, 2.2, 2.8, 3.1, 3.0, 3.2] },
    { k: 'Followers', v: '1,234', d: '+48', up: true, data: [980, 1002, 1040, 1104, 1160, 1190, 1234] },
    { k: 'Clicks', v: '892', d: '-3%', up: false, data: [900, 910, 920, 915, 905, 899, 892] },
  ]

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
            <h3 className="text-lg font-medium mb-4">Performance</h3>
            <div className="h-64 grid place-items-center text-sm text-gray-400 bg-radial bg-grid rounded-xl">
              [Graphique]
            </div>
          </div>
        </section>
        <section className="card card-hover">
          <div className="card-body">
            <h3 className="text-lg font-medium mb-4">Top posts</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span>LinkedIn #1</span>
                <span className="font-medium text-emerald-600">543 vues</span>
              </li>
              <li className="flex justify-between">
                <span>Twitter #3</span>
                <span className="font-medium text-emerald-600">421 vues</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
