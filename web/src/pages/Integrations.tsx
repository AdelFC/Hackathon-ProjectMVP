export default function Integrations() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Intégrations
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-3xl mr-3">𝕏</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Twitter / X</h3>
                <p className="text-sm text-green-600 dark:text-green-400">Connecté</p>
              </div>
            </div>
            <button className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Gérer
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Dernière sync: il y a 2 heures
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-3xl mr-3">in</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">LinkedIn</h3>
                <p className="text-sm text-green-600 dark:text-green-400">Connecté</p>
              </div>
            </div>
            <button className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Gérer
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Dernière sync: il y a 1 heure
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-3xl mr-3">f</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Facebook</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Non connecté</p>
              </div>
            </div>
            <button className="px-4 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded">
              Connecter
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Cliquez pour connecter votre compte
          </p>
        </div>
      </div>
    </div>
  )
}