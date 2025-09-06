import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import { useStrategyGeneration } from '../hooks/useApi'
import { useToast } from '../components/ui/Toast'
import { AnalyzeUrlPanelConnected } from '../components/AnalyzeUrlPanelConnected'
import { Check, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react'

interface FormData {
  // Step 1: Analyse
  url: string

  // Step 2: Brand
  brandName: string
  mission: string
  usp: string
  features: string[]
  audience: string
  voice: string
  startupName: string
  startupUrl: string

  // Step 3: Goals
  frequency: string
  objective: string
  platforms: string[]

  // Step 4: Review
  generateStrategy: boolean
}

export function SetupConnected() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { setBrandIdentity, setGoals, completeSetup } = useProjectStore()
  const { generateStrategy, loading: generatingStrategy } = useStrategyGeneration()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    url: '',
    brandName: '',
    mission: '',
    usp: '',
    features: [],
    audience: '',
    voice: '',
    startupName: '',
    startupUrl: '',
    frequency: '3/sem.',
    objective: 'Visibilité',
    platforms: ['LinkedIn', 'Facebook', 'Twitter'],
    generateStrategy: true
  })

  const steps = [
    { id: 1, title: 'Analyse', description: 'Analyser votre site web' },
    { id: 2, title: 'Marque', description: 'Définir votre identité' },
    { id: 3, title: 'Objectifs', description: 'Fixer vos objectifs' },
    { id: 4, title: 'Révision', description: 'Confirmer et générer' }
  ]

  const handleAnalysisComplete = (result: any) => {
    setFormData(prev => ({
      ...prev,
      mission: result.mission,
      usp: result.usp,
      features: result.features,
      audience: result.audience,
      voice: result.voice
    }))
    addToast('Données pré-remplies avec succès', 'success')
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = async () => {
    // Sauvegarder dans le store
    setBrandIdentity({
      name: formData.brandName,
      industry: 'Technology', // Valeur par défaut, à améliorer
      website: formData.url,
      mission: formData.mission,
      targetAudience: formData.audience,
      usp: formData.usp,
      voice: formData.voice,
      features: formData.features
    })

    const cadenceMap: Record<string, 'daily' | 'weekly' | 'biweekly'> = {
      'Quotidien': 'daily',
      '3/sem.': 'weekly',
      '1/sem.': 'biweekly',
      'Perso': 'weekly'
    }

    setGoals({
      cadence: cadenceMap[formData.frequency] || 'weekly',
      objectives: [formData.objective],
      kpis: ['ER', 'CTR', 'growth'],
      targetKpi: 'ER',
      enabledNetworks: formData.platforms.map(p => p.toLowerCase() as any)
    })

    // Si l'utilisateur veut générer une stratégie automatiquement
    if (formData.generateStrategy) {
      try {
        const strategy = await generateStrategy({
          brand_name: formData.brandName,
          positioning: formData.mission,
          target_audience: formData.audience,
          value_props: formData.features,
          start_date: new Date().toISOString().split('T')[0],
          duration_days: 30,
          language: 'fr-FR',
          tone: formData.voice,
          cta_targets: ['demo', 'newsletter', 'free_trial'],
          startup_name: formData.startupName || undefined,
          startup_url: formData.startupUrl || undefined
        })

        if (strategy) {
          addToast('Stratégie générée avec succès!', 'success')
        }
      } catch (error) {
        console.error('Erreur lors de la génération de stratégie:', error)
        addToast('La stratégie sera générée plus tard', 'warning')
      }
    }

    completeSetup()
    navigate('/app/strategy')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : currentStep === step.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }
                `}>
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  h-1 w-16 sm:w-32 mx-2
                  ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="card p-6 sm:p-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Analysez votre site web</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Entrez l'URL de votre site pour extraire automatiquement les informations de votre marque
              </p>
            </div>

            <AnalyzeUrlPanelConnected
              url={formData.url}
              onUrlChange={(url) => setFormData(prev => ({ ...prev, url }))}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Définissez votre identité de marque</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Affinez les informations extraites ou remplissez manuellement
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Nom de la marque</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                  className="field"
                  placeholder="Votre entreprise"
                />
              </div>

              <div>
                <label className="label">Mission</label>
                <textarea
                  value={formData.mission}
                  onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                  className="field"
                  rows={3}
                  placeholder="Votre mission principale"
                />
              </div>

              <div>
                <label className="label">Proposition de valeur unique</label>
                <textarea
                  value={formData.usp}
                  onChange={(e) => setFormData(prev => ({ ...prev, usp: e.target.value }))}
                  className="field"
                  rows={2}
                  placeholder="Ce qui vous différencie"
                />
              </div>

              <div>
                <label className="label">Audience cible</label>
                <input
                  type="text"
                  value={formData.audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                  className="field"
                  placeholder="Votre public cible"
                />
              </div>

              <div>
                <label className="label">Ton de voix</label>
                <input
                  type="text"
                  value={formData.voice}
                  onChange={(e) => setFormData(prev => ({ ...prev, voice: e.target.value }))}
                  className="field"
                  placeholder="Ex: Professionnel, amical, innovant"
                />
              </div>

              <div>
                <label className="label">Nom de la startup (optionnel)</label>
                <input
                  type="text"
                  value={formData.startupName}
                  onChange={(e) => setFormData(prev => ({ ...prev, startupName: e.target.value }))}
                  className="field"
                  placeholder="Nom pour la génération de contenu"
                />
                <p className="text-xs text-gray-500 mt-1">Ce nom sera utilisé dans le contenu généré</p>
              </div>

              <div>
                <label className="label">URL de la startup (optionnel)</label>
                <input
                  type="text"
                  value={formData.startupUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, startupUrl: e.target.value }))}
                  className="field"
                  placeholder="https://mystartup.com"
                />
                <p className="text-xs text-gray-500 mt-1">Pour l'analyse de la landing page</p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Définissez vos objectifs</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Configurez votre stratégie de publication
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Fréquence de publication</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="field"
                >
                  <option>Quotidien</option>
                  <option>3/sem.</option>
                  <option>1/sem.</option>
                  <option>Perso</option>
                </select>
              </div>

              <div>
                <label className="label">Objectif principal</label>
                <select
                  value={formData.objective}
                  onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                  className="field"
                >
                  <option>Visibilité</option>
                  <option>Engagement</option>
                  <option>Leads</option>
                  <option>Conversions</option>
                </select>
              </div>

              <div>
                <label className="label">Plateformes</label>
                <div className="space-y-2">
                  {['LinkedIn', 'Facebook', 'Twitter'].map(platform => (
                    <label key={platform} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              platforms: [...prev.platforms, platform]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              platforms: prev.platforms.filter(p => p !== platform)
                            }))
                          }
                        }}
                        className="rounded"
                      />
                      <span>{platform}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Révision et confirmation</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Vérifiez vos informations avant de générer votre stratégie
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-3">Résumé de votre configuration</h3>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Marque:</span>
                    <span className="ml-2 font-medium">{formData.brandName || 'Non défini'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Audience:</span>
                    <span className="ml-2 font-medium">{formData.audience || 'Non défini'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fréquence:</span>
                    <span className="ml-2 font-medium">{formData.frequency}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Objectif:</span>
                    <span className="ml-2 font-medium">{formData.objective}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Plateformes:</span>
                    <span className="ml-2 font-medium">{formData.platforms.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  id="generateStrategy"
                  checked={formData.generateStrategy}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    generateStrategy: e.target.checked
                  }))}
                  className="rounded"
                />
                <label htmlFor="generateStrategy" className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Générer automatiquement ma stratégie</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Une stratégie complète de 30 jours sera créée basée sur vos informations
                  </p>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="btn btn-secondary"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="btn btn-primary"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={generatingStrategy}
              className="btn btn-primary"
            >
              {generatingStrategy ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Terminer
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
