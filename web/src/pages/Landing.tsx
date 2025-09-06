import { Link } from 'react-router-dom'
import { usePreferencesStore } from '../stores/preferencesStore'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { CheckCircle, BarChart3, Globe, Brain, Target, Sparkles } from 'lucide-react'

export default function Landing() {
  const { darkMode, toggleDarkMode } = usePreferencesStore()

  const features = [
    {
      icon: <Globe className="w-6 h-6" aria-hidden="true" />,
      title: 'Contexte primaire public',
      description: 'Analyse de votre site et de vos réseaux publics pour comprendre votre voix de marque.'
    },
    {
      icon: <Brain className="w-6 h-6" aria-hidden="true" />,
      title: 'Contexte secondaire interne (démo mock)',
      description: 'Connexion simulée à Notion, Slack, Trello pour suivre la progression réelle.'
    },
    {
      icon: <Target className="w-6 h-6" aria-hidden="true" />,
      title: 'Stratégie personnalisée',
      description: 'Ton par réseau, calendrier éditorial et posts multi-versions.'
    },
    {
      icon: <BarChart3 className="w-6 h-6" aria-hidden="true" />,
      title: 'Analytics & amélioration',
      description: 'Dashboard unifié, insights actionnables et itération continue.'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Analyse publique',
      description: 'On lit votre site et vos réseaux pour capter votre positionnement.'
    },
    {
      number: '02',
      title: 'Connexion outils (mock)',
      description: 'OAuth simulé pour Notion / Slack / Trello pendant la démo.'
    },
    {
      number: '03',
      title: 'Stratégie & posts',
      description: 'Génération multi-canal avec variantes adaptées à X, LinkedIn et Facebook.'
    },
    {
      number: '04',
      title: 'Mesure & amélioration',
      description: 'Analytics consolidé et suggestions d’optimisation.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500"
              aria-hidden="true"
            />
            <span className="font-semibold text-lg">StartPost Agent</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="btn btn-ghost px-2"
              aria-label={darkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
            >
              {darkMode ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
                  <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41m0-14.14-1.41 1.41M6.34 17.66 4.93 19.07" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                </svg>
              )}
            </button>
            <Link to="/setup" aria-label="Aller au setup">
              <Button variant="primary" size="lg">Commencer</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            Community Manager IA pour startups
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Votre CM autonome qui comprend votre startup
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            StartPost Agent analyse votre contexte, propose une stratégie multi-canal
            et améliore vos posts au fil des résultats. OAuth réseaux sociaux
            <span className="font-medium"> simulé pour la démo</span>, intégration prête pour prod.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/setup">
              <Button size="lg" className="px-8 bg-emerald-600 hover:bg-emerald-700">
                Configurer mon agent
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Link to="/app/analytics">
              <Button variant="outline" size="lg" className="px-8 border-emerald-600 text-emerald-700 dark:text-emerald-400">
                Voir le dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Un agent qui comprend votre réalité</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Double contexte pour une communication authentique et alignée
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              variant="bordered"
              className="group hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors"
            >
              <div className="p-6">
                <div
                  className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform"
                  aria-hidden="true"
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Workflow en 4 étapes</h2>
          <p className="text-gray-600 dark:text-gray-400">De la compréhension à l’optimisation continue</p>
        </div>

        <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <li key={step.number} className="relative">
              <div className="text-5xl font-bold text-emerald-100 dark:text-emerald-950 mb-4" aria-hidden="true">
                {step.number}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Two Main Surfaces */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-gray-200 dark:border-gray-800">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Analytics */}
          <div>
            <Badge variant="success" size="lg" className="mb-4">Dashboard Analytics</Badge>
            <h2 className="text-3xl font-bold mb-6">Centralisez vos performances</h2>
            <div className="space-y-4 mb-8">
              {[
                'Graphiques par réseau (X, LinkedIn, Facebook)',
                'KPIs clés : impressions, engagement rate, CTR',
                'Tracking des liens (Bitly mock possible en démo)',
                'Corrélations hashtags, horaires, types de contenu',
                'Insights auto : « chiffres concrets performent mieux »'
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/app/analytics">
              <Button variant="outline" className="border-emerald-600 text-emerald-700 dark:text-emerald-400">
                Explorer le dashboard
              </Button>
            </Link>
          </div>

          {/* Strategy */}
          <div>
            <Badge variant="info" size="lg" className="mb-4">Stratégie & Posts</Badge>
            <h2 className="text-3xl font-bold mb-6">Génération intelligente et adaptative</h2>
            <div className="space-y-4 mb-8">
              {[
                'Stratégie par réseau (ton, fréquence)',
                'Posts multi-versions prêts à publier',
                'Calendrier éditorial (drag & drop)',
                'Adaptation selon milestones internes',
                'Itération basée sur les résultats'
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/app/strategy">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Voir la stratégie</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Intégrations natives</h2>
          <p className="text-gray-600 dark:text-gray-400">OAuth simulé en démo — intégration prête pour prod</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {['X / Twitter', 'LinkedIn', 'Facebook', 'Notion', 'Slack', 'Trello'].map((tool) => (
            <Card key={tool} variant="bordered" className="hover:border-emerald-500 transition-colors">
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 mx-auto mb-3" aria-hidden="true" />
                <span className="text-sm font-medium">{tool}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <Card variant="elevated" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Voir l’agent travailler en live</h2>
            <p className="text-lg mb-8 text-emerald-100">
              Démo avec analyse de votre site, stratégie générée et posts prêts à publier.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/setup">
                <Button size="lg" variant="secondary" className="px-8">Lancer la démo</Button>
              </Link>
              <Link to="/app/strategy">
                <Button size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white hover:text-emerald-600">
                  Voir un exemple
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-emerald-100 text-sm">
              OAuth simulé • Données mock cohérentes • Flux réaliste
            </p>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-teal-500" aria-hidden="true" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 StartPost Agent. Community Manager IA pour startups.
              </span>
            </div>
            <nav aria-label="Liens de pied de page" className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                Documentation
              </a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                API
              </a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
