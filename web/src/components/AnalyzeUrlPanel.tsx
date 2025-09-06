import { useState } from 'react'
import { useToast } from './ui/Toast'

interface AnalysisResult {
  mission: string
  usp: string
  features: string[]
  audience: string
  voice: string
}

interface AnalyzeUrlPanelProps {
  url: string
  onUrlChange: (url: string) => void
  onAnalysisComplete?: (result: AnalysisResult) => void
}

export function AnalyzeUrlPanel({ url, onUrlChange, onAnalysisComplete }: AnalyzeUrlPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const { addToast } = useToast()

  const handleAnalyze = async () => {
    if (!url || !url.startsWith('http')) {
      addToast('Veuillez entrer une URL valide', 'warning')
      return
    }

    setIsAnalyzing(true)
    addToast('Analyse en cours...', 'info')

    // Simulate API call with mock data
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        mission: "Transformer la façon dont les entreprises gèrent leur présence sur les réseaux sociaux grâce à l'intelligence artificielle",
        usp: "Solution tout-en-un alimentée par l'IA pour automatiser et optimiser votre stratégie social media",
        features: [
          'Génération de contenu par IA',
          'Planification automatique',
          'Analytics en temps réel',
          'Gestion multi-plateformes',
          'Optimisation SEO intégrée'
        ],
        audience: "PME et startups cherchant à maximiser leur impact sur les réseaux sociaux sans équipe dédiée",
        voice: "Professionnel mais accessible, innovant et orienté résultats"
      }

      setAnalysisResult(mockResult)
      setIsAnalyzing(false)
      addToast('Analyse terminée avec succès!', 'success')
      
      if (onAnalysisComplete) {
        onAnalysisComplete(mockResult)
      }
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">URL de votre site web</label>
        <div className="flex gap-2">
          <input
            type="url"
            className="field flex-1"
            placeholder="https://votre-site.com"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            disabled={isAnalyzing}
          />
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !url}
            className="btn btn-primary"
          >
            {isAnalyzing ? 'Analyse...' : 'Analyser'}
          </button>
        </div>
      </div>

      {isAnalyzing && <AnalysisSkeleton />}

      {analysisResult && !isAnalyzing && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
              ✨ Analyse IA complétée
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Nous avons extrait les informations clés de votre site
            </p>
          </div>

          <div className="space-y-3">
            <ResultSection title="Mission" content={analysisResult.mission} />
            <ResultSection title="Proposition de valeur" content={analysisResult.usp} />
            <ResultSection 
              title="Fonctionnalités clés" 
              content={
                <ul className="list-disc list-inside space-y-1">
                  {analysisResult.features.map((f, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-300">{f}</li>
                  ))}
                </ul>
              } 
            />
            <ResultSection title="Audience cible" content={analysisResult.audience} />
            <ResultSection title="Ton de voix" content={analysisResult.voice} />
          </div>
        </div>
      )}

      {!analysisResult && !isAnalyzing && (
        <p className="text-sm text-gray-500">
          Notre IA analysera votre site pour extraire automatiquement les informations clés sur votre marque.
        </p>
      )}
    </div>
  )
}

function ResultSection({ title, content }: { title: string; content: React.ReactNode }) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
        {title}
      </h4>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {typeof content === 'string' ? <p>{content}</p> : content}
      </div>
    </div>
  )
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      ))}
    </div>
  )
}
