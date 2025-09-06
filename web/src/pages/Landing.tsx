import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Social Media Strategy Assistant
          </h1>
          <Link
            to="/setup"
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Commencer
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Votre Assistant IA pour les Réseaux Sociaux
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Powered by <span className="font-semibold text-primary-600">Blackbox AI</span>
          </p>
          <div className="overflow-hidden whitespace-nowrap">
            <div className="inline-block animate-marquee">
              <span className="text-lg text-gray-500 dark:text-gray-400 mx-4">
                📊 Stratégie personnalisée • 🚀 Posts optimisés • 📈 Analytics avancés • 
                🤖 IA générative • 📅 Calendrier éditorial • 💡 Insights intelligents •
              </span>
              <span className="text-lg text-gray-500 dark:text-gray-400 mx-4">
                📊 Stratégie personnalisée • 🚀 Posts optimisés • 📈 Analytics avancés • 
                🤖 IA générative • 📅 Calendrier éditorial • 💡 Insights intelligents •
              </span>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Étape 1: Profil
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Définissez votre marque et vos objectifs
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Étape 2: Analyse
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Analyse de votre site et concurrence
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Étape 3: Génération
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              IA génère stratégie et contenus
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Étape 4: Optimisation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Suivi et amélioration continue
            </p>
          </div>
        </section>

        <section className="text-center">
          <Link
            to="/setup"
            className="inline-block px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold rounded-lg transition-all transform hover:scale-105"
          >
            Commencer Maintenant
          </Link>
        </section>
      </main>
    </div>
  )
}