zimport { useState, ReactNode } from 'react'
import { OAuthConsentModal } from '../components/OAuthConsentModal'
import { useToast } from '../components/ui/Toast'

interface Integration {
  id: string
  name: string
  category: 'social' | 'productivity' | 'analytics'
  description: string
  icon: ReactNode
  color: string
  connected: boolean
  lastSync?: string
  accountName?: string
}

export default function Integrations() {
  const { addToast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'twitter',
      name: 'Twitter / X',
      category: 'social',
      description: 'Publiez et programmez vos tweets',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: 'text-black dark:text-white',
      connected: true,
      lastSync: 'il y a 2 heures',
      accountName: '@demo_user'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      category: 'social',
      description: 'Partagez du contenu professionnel',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: 'text-blue-600',
      connected: true,
      lastSync: 'il y a 1 heure',
      accountName: 'John Doe'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      category: 'social',
      description: 'Gérez vos pages Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'text-blue-500',
      connected: false
    },
    {
      id: 'notion',
      name: 'Notion',
      category: 'productivity',
      description: 'Synchronisez votre calendrier éditorial',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
        </svg>
      ),
      color: 'text-gray-900 dark:text-gray-100',
      connected: false
    },
    {
      id: 'slack',
      name: 'Slack',
      category: 'productivity',
      description: 'Recevez des notifications dans Slack',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
        </svg>
      ),
      color: 'text-purple-600',
      connected: false
    },
    {
      id: 'trello',
      name: 'Trello',
      category: 'productivity',
      description: 'Gérez vos tâches et projets',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .794-.645 1.44-1.44 1.44H15c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.646-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z"/>
        </svg>
      ),
      color: 'text-blue-500',
      connected: false
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      category: 'productivity',
      description: 'Collaborez avec votre équipe',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.625 8.127q-.55 0-1.025-.205-.475-.205-.832-.563-.358-.357-.563-.832Q18 6.053 18 5.502q0-.54.205-1.02t.563-.837q.357-.358.832-.563.475-.205 1.025-.205.54 0 1.02.205t.837.563q.358.357.563.837.205.48.205 1.02 0 .551-.205 1.025-.205.475-.563.832-.357.358-.837.563-.48.205-1.02.205zm0-3.75q-.45 0-.788.337-.337.338-.337.788 0 .45.337.787.338.338.788.338.45 0 .787-.338.338-.337.338-.787 0-.45-.338-.788-.337-.337-.787-.337zM24 10.002v5.578q0 .774-.293 1.46-.293.685-.803 1.194-.51.51-1.195.803-.686.293-1.459.293-.21 0-.42-.026-.21-.025-.42-.079-.21.054-.42.079-.21.026-.42.026-.773 0-1.459-.293-.685-.293-1.194-.803-.51-.51-.803-1.194-.293-.686-.293-1.46V9.002q0-.773.293-1.459.293-.685.803-1.194.51-.51 1.194-.803.686-.293 1.46-.293h6.75q.773 0 1.459.293.685.293 1.195.803.51.51.803 1.194.293.686.293 1.46zm-1.5 0q0-.45-.169-.848-.169-.398-.47-.699-.3-.3-.698-.47-.399-.168-.848-.168h-5.25q-.45 0-.848.169-.398.169-.698.47-.3.3-.47.698-.168.399-.168.848v5.578q0 .45.169.848.169.398.47.699.3.3.698.47.398.168.848.168.45 0 .848-.168.398-.17.698-.47.3-.3.47-.699.169-.398.169-.848v-5.578q0-.45.169-.848.169-.398.47-.699.3-.3.698-.47.398-.168.848-.168.45 0 .848.169.398.169.698.47.3.3.47.698.168.399.168.848v5.578q0 .45.169.848.169.398.47.699.3.3.698.47.398.168.848.168.45 0 .848-.168.399-.17.699-.47.3-.3.47-.699.168-.398.168-.848z"/>
        </svg>
      ),
      color: 'text-indigo-600',
      connected: false
    },
    {
      id: 'bitly',
      name: 'Bitly',
      category: 'analytics',
      description: 'Raccourcissez et suivez vos liens',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.5 10.5h-3v3h3v-3zm0-6h-3v3h3v-3zm-6 6h-3v3h3v-3zm0-6h-3v3h3v-3zm12-3h-15c-1.65 0-3 1.35-3 3v15c0 1.65 1.35 3 3 3h15c1.65 0 3-1.35 3-3v-15c0-1.65-1.35-3-3-3z"/>
        </svg>
      ),
      color: 'text-orange-500',
      connected: false
    }
  ])

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration)
    setModalOpen(true)
  }

  const handleAuthorize = () => {
    if (selectedIntegration) {
      const now = new Date()
      const timeString = `il y a ${Math.floor(Math.random() * 5) + 1} minutes`

      setIntegrations(prev => prev.map(item =>
        item.id === selectedIntegration.id
          ? {
              ...item,
              connected: true,
              lastSync: timeString,
              accountName: `@demo_${item.id}`
            }
          : item
      ))

      addToast(`${selectedIntegration.name} connecté avec succès!`, 'success')
    }
  }

  const handleDeny = () => {
    if (selectedIntegration) {
      addToast(`Connexion à ${selectedIntegration.name} refusée`, 'error')
    }
  }

  const handleDisconnect = (integration: Integration) => {
    setIntegrations(prev => prev.map(item =>
      item.id === integration.id
        ? { ...item, connected: false, lastSync: undefined, accountName: undefined }
        : item
    ))
    addToast(`${integration.name} déconnecté`, 'info')
  }

  const categories = [
    { id: 'social', label: 'Réseaux sociaux', icon: '🌐' },
    { id: 'productivity', label: 'Productivité', icon: '⚡' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Intégrations</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {integrations.filter(i => i.connected).length} / {integrations.length} connectées
          </span>
        </div>
      </div>

      {categories.map(category => {
        const categoryIntegrations = integrations.filter(i => i.category === category.id)

        return (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">{category.icon}</span>
              <h3 className="text-lg font-medium">{category.label}</h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryIntegrations.map((integration) => (
                <div key={integration.id} className="card card-hover">
                  <div className="card-body">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${integration.color}`}>
                          {integration.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          {integration.connected && integration.accountName && (
                            <p className="text-xs text-gray-500">{integration.accountName}</p>
                          )}
                        </div>
                      </div>
                      {integration.connected ? (
                        <span className="badge">Connecté</span>
                      ) : (
                        <span className="badge border-gray-300 text-gray-600 bg-gray-100">Non connecté</span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {integration.description}
                    </p>

                    {integration.connected && (
                      <p className="text-xs text-gray-500 mb-3">
                        Dernière sync: {integration.lastSync}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {integration.connected ? (
                        <>
                          <button className="btn btn-outline text-sm flex-1">
                            Gérer
                          </button>
                          <button
                            onClick={() => handleDisconnect(integration)}
                            className="btn btn-ghost text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Déconnecter
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(integration)}
                          className="btn btn-primary text-sm w-full"
                        >
                          Connecter
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {selectedIntegration && (
        <OAuthConsentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          provider={{
            name: selectedIntegration.name,
            icon: selectedIntegration.icon,
            color: selectedIntegration.color
          }}
          onAuthorize={handleAuthorize}
          onDeny={handleDeny}
        />
      )}
    </div>
  )
}
