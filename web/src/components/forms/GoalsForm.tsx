import { useEffect, useMemo, useState } from 'react'
import type { Provider } from '../../stores/integrationStore'
import { useIntegrationStore } from '../../stores/integrationStore'

export type Cadence = 'daily' | 'weekly' | 'biweekly'
export type TargetKpi = 'ER' | 'CTR' | 'growth'

export interface GoalsFormData {
  enabledNetworks: Provider[]
  cadence: Cadence
  targetKpi: TargetKpi
  objectives: string[]
}

interface GoalsFormProps {
  initial?: Partial<GoalsFormData>
  onSubmit: (data: GoalsFormData) => void
  onBack?: () => void
}

const cadenceOptions: { key: Cadence; label: string; hint: string }[] = [
  { key: 'daily', label: '1/jour', hint: 'Rythme soutenu' },
  { key: 'weekly', label: '3/sem.', hint: 'Équilibre' },
  { key: 'biweekly', label: '1/sem.', hint: 'Rythme léger' },
]

const kpiOptions: { key: TargetKpi; label: string; hint: string }[] = [
  { key: 'ER', label: 'Engagement Rate (ER)', hint: 'Likes, commentaires, partages' },
  { key: 'CTR', label: 'Click-Through Rate (CTR)', hint: 'Clics vers vos liens' },
  { key: 'growth', label: 'Follower Growth', hint: 'Croissance de la communauté' },
]

const objectiveOptions = ['Visibilité', 'Leads', 'Communauté', 'Ventes']

export function GoalsForm({ initial, onSubmit, onBack }: GoalsFormProps) {
  const { integrations } = useIntegrationStore()
  const availableProviders = useMemo(() => integrations.map(i => i.provider), [integrations])

  const [enabledNetworks, setEnabledNetworks] = useState<Provider[]>(
    (initial?.enabledNetworks as Provider[]) ??
      (availableProviders.includes('twitter') ? (['twitter'] as Provider[]) : ([] as Provider[]))
  )
  const [cadence, setCadence] = useState<Cadence>(initial?.cadence ?? 'weekly')
  const [targetKpi, setTargetKpi] = useState<TargetKpi>(initial?.targetKpi ?? 'ER')
  const [objectives, setObjectives] = useState<string[]>(initial?.objectives ?? ['Visibilité'])

  // Ensure enabled networks reflect available providers if store updates
  useEffect(() => {
    setEnabledNetworks(prev => prev.filter(p => availableProviders.includes(p)))
  }, [availableProviders])

  const toggleNetwork = (p: Provider) => {
    setEnabledNetworks(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const toggleObjective = (obj: string) => {
    setObjectives(prev =>
      prev.includes(obj) ? prev.filter(x => x !== obj) : [...prev, obj]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      enabledNetworks,
      cadence,
      targetKpi,
      objectives: objectives.length ? objectives : ['Visibilité'],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Réseaux activés */}
      <section>
        <h3 className="text-lg font-medium mb-3">Réseaux activés</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {availableProviders.map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={() => toggleNetwork(provider)}
              className={`w-full rounded-xl border px-4 py-3 text-sm transition ${
                enabledNetworks.includes(provider)
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800'
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
              aria-pressed={enabledNetworks.includes(provider)}
            >
              <span className="capitalize">{provider}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Cadence */}
      <section>
        <h3 className="text-lg font-medium mb-3">Cadence de publication</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cadenceOptions.map(opt => (
            <label key={opt.key} className={`rounded-xl border p-4 cursor-pointer transition ${
              cadence === opt.key
                ? 'border-gray-900 bg-gray-50 dark:bg-gray-800'
                : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="cadence"
                  checked={cadence === opt.key}
                  onChange={() => setCadence(opt.key)}
                />
                <div>
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.hint}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* KPI cible */}
      <section>
        <h3 className="text-lg font-medium mb-3">KPI cible</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {kpiOptions.map(opt => (
            <label key={opt.key} className={`rounded-xl border p-4 cursor-pointer transition ${
              targetKpi === opt.key
                ? 'border-gray-900 bg-gray-50 dark:bg-gray-800'
                : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="kpi"
                  checked={targetKpi === opt.key}
                  onChange={() => setTargetKpi(opt.key)}
                />
                <div>
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.hint}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Objectifs */}
      <section>
        <h3 className="text-lg font-medium mb-3">Objectifs</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {objectiveOptions.map(obj => {
            const active = objectives.includes(obj)
            return (
              <button
                key={obj}
                type="button"
                onClick={() => toggleObjective(obj)}
                className={`w-full rounded-xl border px-4 py-3 text-sm transition ${
                  active
                    ? 'border-gray-900 bg-gray-50 dark:bg-gray-800'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                aria-pressed={active}
              >
                {obj}
              </button>
            )
          })}
        </div>
      </section>

      {/* Actions */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        {onBack && (
          <button type="button" onClick={onBack} className="btn btn-ghost w-full sm:w-auto">
            Précédent
          </button>
        )}
        <button type="submit" className="btn btn-primary w-full sm:w-auto">
          Terminer
        </button>
      </div>
    </form>
  )
}
