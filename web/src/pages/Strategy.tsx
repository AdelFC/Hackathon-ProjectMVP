export default function Strategy() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Stratégie & Posts
      </h2>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Stratégie générée
            </h3>
            <div className="prose dark:prose-invert">
              <p className="text-gray-600 dark:text-gray-300">
                Votre stratégie personnalisée apparaîtra ici après génération.
              </p>
            </div>
          </div>
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Posts proposés
            </h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">Twitter/X</span>
                  <button className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Éditer
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Exemple de post Twitter généré par l'IA...
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Calendrier éditorial
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Lundi - Twitter - 10h00
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Mercredi - LinkedIn - 14h00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}