export default function Analytics() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Analytics Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Impressions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">12.5K</p>
          <p className="text-sm text-green-600 dark:text-green-400">+12%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Engagement</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">3.2%</p>
          <p className="text-sm text-green-600 dark:text-green-400">+5%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
          <p className="text-sm text-green-600 dark:text-green-400">+48</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Clicks</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">892</p>
          <p className="text-sm text-red-600 dark:text-red-400">-3%</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Timeline
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            [Chart Placeholder]
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Posts
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">Post LinkedIn #1</p>
              <span className="text-sm font-medium text-green-600">543 vues</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">Post Twitter #3</p>
              <span className="text-sm font-medium text-green-600">421 vues</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}