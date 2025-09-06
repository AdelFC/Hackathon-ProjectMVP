import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import { useIntegrationStore } from '../stores/integrationStore'
import { BrandForm } from '../components/forms/BrandForm'
import { AnalyzeUrlPanel } from '../components/AnalyzeUrlPanel'
import { useToast } from '../components/ui/Toast'

export default function Setup() {
  const navigate = useNavigate()
  const { setGoals, completeSetup, currentStep, setCurrentStep } = useProjectStore()
  const { connect, isConnected } = useIntegrationStore()
  const { addToast } = useToast()
  
  const [formData, setFormData] = useState({
    // Brand Identity
    name: '',
    industry: 'E-commerce',
    website: '',
    mission: '',
    targetAudience: '',
    usp: '',
    voice: '',
    features: [],
    // Goals
    objective: 'Visibilité',
    frequency: '3/sem.'
  })
  
  const step = currentStep || 1
  const total = 4
  
  const handleNext = () => {
    if (step === 1) {
      // BrandForm handles its own submission and calls this function
      // Just move to next step
      setCurrentStep(step + 1)
    } else if (step === 4) {
      // Save goals and complete setup
      const cadenceMap: Record<string, 'daily' | 'weekly' | 'biweekly'> = {
        '1/jour': 'daily',
        '3/sem.': 'weekly',
        '1/sem.': 'biweekly',
        'Perso': 'weekly'
      }
      setGoals({
        cadence: cadenceMap[formData.frequency] || 'weekly',
        objectives: [formData.objective],
        kpis: ['engagement', 'reach', 'conversions']
      })
      completeSetup()
      addToast('Configuration terminée avec succès!', 'success')
      navigate('/app/strategy')
      return
    }
    
    if (step < total) {
      setCurrentStep(step + 1)
    }
  }

  const handleAnalysisComplete = (result: any) => {
    setFormData({
      ...formData,
      mission: result.mission,
      usp: result.usp,
      features: result.features,
      targetAudience: result.audience,
      voice: result.voice
    })
  }
  
  const prev = () => {
    if (step > 1) {
      setCurrentStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="section py-10 max-w-3xl">
        {/* Header + progress */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Configuration</h1>
            <p className="text-xs text-gray-500 mt-1">Paramétrez votre espace en 4 étapes rapides.</p>
          </div>
          <span className="text-sm text-gray-500">Étape {step} / {total}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-6">
          <div
            className="h-2 rounded-full"
            style={{ width: `${(step / total) * 100}%`, backgroundColor: 'rgb(var(--accent-600))' }}
          />
        </div>

        {/* Card content */}
        <div className="card card-hover">
          <div className="card-body">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium mb-4">Identité de marque</h2>
                <BrandForm onSubmit={handleNext} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium">Analyse de votre site</h2>
                <AnalyzeUrlPanel
                  url={formData.website}
                  onUrlChange={(url) => setFormData({...formData, website: url})}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium">Connexion réseaux sociaux</h2>
                {[
                  { name: 'Twitter / X', provider: 'twitter' as const },
                  { name: 'LinkedIn', provider: 'linkedin' as const },
                  { name: 'Facebook', provider: 'facebook' as const }
                ].map((network) => {
                  const connected = isConnected(network.provider)
                  return (
                    <button
                      key={network.name}
                      onClick={() => {
                        if (!connected) {
                          connect(network.provider, {
                            accountName: `@demo_${network.provider}`,
                            scopes: ['read', 'write']
                          })
                        }
                      }}
                      className={`w-full flex items-center justify-between rounded-xl border px-4 py-4 transition ${
                        connected 
                          ? 'border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-800' 
                          : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="font-medium">{network.name}</span>
                      <span className={`text-sm ${connected ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                        {connected ? 'Connecté' : 'Connecter'}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium">Objectifs &amp; cadence</h2>
                <div>
                  <label className="label">Objectif principal</label>
                  <select 
                    className="field"
                    value={formData.objective}
                    onChange={(e) => setFormData({...formData, objective: e.target.value})}
                  >
                    <option>Visibilité</option>
                    <option>Leads</option>
                    <option>Communauté</option>
                    <option>Ventes</option>
                  </select>
                </div>
                <div>
                  <label className="label">Fréquence</label>
                  <select 
                    className="field"
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  >
                    <option>1/jour</option>
                    <option>3/sem.</option>
                    <option>1/sem.</option>
                    <option>Perso</option>
                  </select>
                </div>
              </div>
            )}

            {/* Actions - only show for steps other than 1 (BrandForm has its own submit button) */}
            {step !== 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={prev}
                  className={`btn btn-secondary w-full sm:w-auto ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={step === 1}
                >
                  Précédent
                </button>
                <button
                  onClick={handleNext}
                  className="btn btn-primary btn-lg w-full sm:w-auto"
                >
                  {step === total ? 'Terminer' : 'Suivant'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <p className="text-xs text-gray-500 mt-4">
          Vous pourrez modifier ces réglages à tout moment dans Paramètres.
        </p>
      </div>
    </div>
  )
}
