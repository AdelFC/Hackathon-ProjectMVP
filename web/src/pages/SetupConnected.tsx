import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'

import { useToast } from '../components/ui/Toast'
import { AnalyzeUrlPanelConnected } from '../components/AnalyzeUrlPanelConnected'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { GlobalHeader, useLanguage } from '../components/GlobalHeader'
import { translations } from '../utils/translations'

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

  // Step 3: Goals
  frequency: string
  objective: string
  platforms: string[]
}

export function SetupConnected() {
  const navigate = useNavigate()
  const language = useLanguage()
  const t = translations[language]
  const { addToast } = useToast()
  const { setBrandIdentity, setGoals, completeSetup } = useProjectStore()


  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    url: '',
    brandName: '',
    mission: '',
    usp: '',
    features: [],
    audience: '',
    voice: '',
    frequency: '3/sem.',
    objective: 'Visibilité',
    platforms: ['LinkedIn', 'Facebook', 'Twitter']
  })

  const steps = [
    { id: 1, title: language === 'fr' ? 'Analyse' : 'Analysis', description: language === 'fr' ? 'Analyser votre site web' : 'Analyze your website' },
    { id: 2, title: language === 'fr' ? 'Marque' : 'Brand', description: language === 'fr' ? 'Définir votre identité' : 'Define your identity' },
    { id: 3, title: language === 'fr' ? 'Objectifs' : 'Goals', description: language === 'fr' ? 'Fixer vos objectifs' : 'Set your goals' },
    { id: 4, title: language === 'fr' ? 'Révision' : 'Review', description: language === 'fr' ? 'Confirmer et générer' : 'Confirm and generate' }
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
    addToast(language === 'fr' ? 'Données pré-remplies avec succès' : 'Data pre-filled successfully', 'success')
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

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.url.trim() !== ''
      case 2:
        return (
          formData.brandName.trim() !== '' &&
          formData.mission.trim() !== '' &&
          formData.usp.trim() !== '' &&
          formData.audience.trim() !== '' &&
          formData.voice.trim() !== ''
        )
      case 3:
        return (
          formData.frequency.trim() !== '' &&
          formData.objective.trim() !== '' &&
          formData.platforms.length > 0
        )
      case 4:
        // Pour la révision, vérifier que les étapes précédentes sont valides
        return isStepValid(1) && isStepValid(2) && isStepValid(3)
      default:
        return false
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

    // Remove automatic strategy generation logic

    completeSetup()
    navigate('/app/strategy')
  }

  return (
    <div className="min-h-screen">
      {/* Global Header */}
      <GlobalHeader />
      
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
              <h2 className="text-2xl font-bold mb-2">{language === 'fr' ? 'Analysez votre site web' : 'Analyze your website'}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr' ? "Entrez l'URL de votre site pour extraire automatiquement les informations de votre marque" : "Enter your website URL to automatically extract your brand information"}
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
              <h2 className="text-2xl font-bold mb-2">{language === 'fr' ? 'Définissez votre identité de marque' : 'Define your brand identity'}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr' ? 'Affinez les informations extraites ou remplissez manuellement' : 'Refine extracted information or fill in manually'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">{language === 'fr' ? 'Nom de la marque' : 'Brand name'}</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                  className="field"
                  placeholder={language === 'fr' ? 'Votre entreprise' : 'Your company'}
                />
              </div>

              <div>
                <label className="label">{language === 'fr' ? 'Mission' : 'Mission'}</label>
                <textarea
                  value={formData.mission}
                  onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                  className="field"
                  rows={3}
                  placeholder={language === 'fr' ? 'Votre mission principale' : 'Your main mission'}
                />
              </div>

              <div>
                <label className="label">{language === 'fr' ? 'Proposition de valeur unique' : 'Unique value proposition'}</label>
                <textarea
                  value={formData.usp}
                  onChange={(e) => setFormData(prev => ({ ...prev, usp: e.target.value }))}
                  className="field"
                  rows={2}
                  placeholder={language === 'fr' ? 'Ce qui vous différencie' : 'What sets you apart'}
                />
              </div>

              <div>
                <label className="label">{language === 'fr' ? 'Audience cible' : 'Target audience'}</label>
                <input
                  type="text"
                  value={formData.audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                  className="field"
                  placeholder={language === 'fr' ? 'Votre public cible' : 'Your target audience'}
                />
              </div>

              <div>
                <label className="label">{language === 'fr' ? 'Ton de voix' : 'Tone of voice'}</label>
                <input
                  type="text"
                  value={formData.voice}
                  onChange={(e) => setFormData(prev => ({ ...prev, voice: e.target.value }))}
                  className="field"
                  placeholder={language === 'fr' ? 'Ex: Professionnel, amical, innovant' : 'E.g: Professional, friendly, innovative'}
                />
              </div>

            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{language === 'fr' ? 'Définissez vos objectifs' : 'Define your goals'}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr' ? 'Configurez votre stratégie de publication' : 'Configure your publishing strategy'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">{language === 'fr' ? 'Fréquence de publication' : 'Publishing frequency'}</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="field"
                >
                  <option value="Quotidien">{language === 'fr' ? 'Quotidien' : 'Daily'}</option>
                  <option value="3/sem.">{language === 'fr' ? '3/sem.' : '3/week'}</option>
                  <option value="1/sem.">{language === 'fr' ? '1/sem.' : '1/week'}</option>
                  <option value="Perso">{language === 'fr' ? 'Perso' : 'Custom'}</option>
                </select>
              </div>

              <div>
                <label className="label">{language === 'fr' ? 'Objectif principal' : 'Main objective'}</label>
                <select
                  value={formData.objective}
                  onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                  className="field"
                >
                  <option value="Visibilité">{language === 'fr' ? 'Visibilité' : 'Visibility'}</option>
                  <option value="Engagement">{language === 'fr' ? 'Engagement' : 'Engagement'}</option>
                  <option value="Leads">{language === 'fr' ? 'Leads' : 'Leads'}</option>
                  <option value="Conversions">{language === 'fr' ? 'Conversions' : 'Conversions'}</option>
                </select>
              </div>

              <div>
                <label className="label">{language === 'fr' ? 'Plateformes' : 'Platforms'}</label>
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
              <h2 className="text-2xl font-bold mb-2">{language === 'fr' ? 'Révision et confirmation' : 'Review and confirmation'}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr' ? 'Vérifiez vos informations avant de générer votre stratégie' : 'Review your information before generating your strategy'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-3">{language === 'fr' ? 'Résumé de votre configuration' : 'Configuration summary'}</h3>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">{language === 'fr' ? 'Marque:' : 'Brand:'}</span>
                    <span className="ml-2 font-medium">{formData.brandName || (language === 'fr' ? 'Non défini' : 'Not defined')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{language === 'fr' ? 'Audience:' : 'Audience:'}</span>
                    <span className="ml-2 font-medium">{formData.audience || (language === 'fr' ? 'Non défini' : 'Not defined')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{language === 'fr' ? 'Fréquence:' : 'Frequency:'}</span>
                    <span className="ml-2 font-medium">{formData.frequency}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{language === 'fr' ? 'Objectif:' : 'Objective:'}</span>
                    <span className="ml-2 font-medium">{formData.objective}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{language === 'fr' ? 'Plateformes:' : 'Platforms:'}</span>
                    <span className="ml-2 font-medium">{formData.platforms.join(', ')}</span>
                  </div>
                </div>
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
            {language === 'fr' ? 'Précédent' : 'Previous'}
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="btn btn-primary"
            >
              {language === 'fr' ? 'Suivant' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!isStepValid(4)}
              className="btn btn-primary"
            >
              <Check className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Terminer' : 'Finish'}
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
