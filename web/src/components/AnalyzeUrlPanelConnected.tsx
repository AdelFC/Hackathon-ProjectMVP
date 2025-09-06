import { useState } from 'react'
import { useToast } from './ui/Toast'
import { useLandingPageAnalysis } from '../hooks/useApi'
import { Loader2, Globe, CheckCircle, XCircle } from 'lucide-react'

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

export function AnalyzeUrlPanelConnected({ url, onUrlChange, onAnalysisComplete }: AnalyzeUrlPanelProps) {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const { addToast } = useToast()
  const { loading: isAnalyzing, error, analyzePage } = useLandingPageAnalysis()

  const handleAnalyze = async () => {
    if (!url || !url.startsWith('http')) {
      addToast('Veuillez entrer une URL valide', 'warning')
      return
    }

    try {
      const brandInfo = await analyzePage(url)
      
      if (brandInfo) {
        // Transformer les données du backend au format attendu par le frontend
        const result: AnalysisResult = {
          mission: brandInfo.positioning,
          usp: brandInfo.value_props[0] || '',
          features: brandInfo.value_props,
          audience: brandInfo.target_audience,
          voice: brandInfo.tone
        }
        
        setAnalysisResult(result)
        
        if (onAnalysisComplete) {
          onAnalysisComplete(result)
        }
      }
    } catch (err) {
      console.error('Erreur lors de l\'analyse:', err)
      // L'erreur est déjà gérée par le hook avec un toast
    }
  }

  const getStatusIcon = () => {
    if (isAnalyzing) return <Loader2 className="w-5 h-5 animate-spin" />
    if (error) return <XCircle className="w-5 h-5 text-red-500" />
    if (analysisResult) return <CheckCircle className="w-5 h-5 text-green-500" />
    return <Globe className="w-5 h-5 text-gray-400" />
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {getStatusIcon()}
        <h3 className="text-lg font-semibold">Analyse de Landing Page</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">URL à analyser</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://example.com"
              className="field flex-1"
              disabled={isAnalyzing}
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !url}
              className="btn btn-primary"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyse...
                </>
              ) : (
                'Analyser'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              Erreur lors de l'analyse. Veuillez vérifier l'URL et réessayer.
            </p>
          </div>
        )}

        {analysisResult && !isAnalyzing && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Analyse terminée avec succès
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="label">Mission identifiée</label>
                <p className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  {analysisResult.mission}
                </p>
              </div>

              <div>
                <label className="label">Proposition de valeur unique</label>
                <p className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  {analysisResult.usp}
                </p>
              </div>

              <div>
                <label className="label">Audience cible</label>
                <p className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  {analysisResult.audience}
                </p>
              </div>

              <div>
                <label className="label">Ton de voix</label>
                <p className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  {analysisResult.voice}
                </p>
              </div>

              <div>
                <label className="label">Caractéristiques principales</label>
                <ul className="space-y-2">
                  {analysisResult.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                Ces informations ont été extraites automatiquement. Vous pouvez les modifier dans le formulaire ci-dessous.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}