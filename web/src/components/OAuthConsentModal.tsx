import { useState } from 'react'

interface OAuthConsentModalProps {
  isOpen: boolean
  onClose: () => void
  provider: {
    name: string
    icon?: React.ReactNode
    color?: string
  }
  onAuthorize: () => void
  onDeny: () => void
}

export function OAuthConsentModal({ 
  isOpen, 
  onClose, 
  provider, 
  onAuthorize, 
  onDeny 
}: OAuthConsentModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleAuthorize = async () => {
    setIsLoading(true)
    // Simulate OAuth flow delay
    setTimeout(() => {
      onAuthorize()
      setIsLoading(false)
      onClose()
    }, 1500)
  }

  const handleDeny = () => {
    onDeny()
    onClose()
  }

  const permissions = [
    'Accéder à vos informations de profil',
    'Publier du contenu en votre nom',
    'Lire vos statistiques et analytics',
    'Gérer vos publications programmées'
  ]

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {provider.icon && (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {provider.icon}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Connecter {provider.name}
                  </h2>
                  <p className="text-xs text-gray-500">Autorisation requise</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Social Studio demande l'autorisation d'accéder à votre compte {provider.name} pour :
              </p>
              
              <ul className="space-y-2">
                {permissions.map((permission, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{permission}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Connexion sécurisée
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Vos identifiants ne sont jamais stockés. Vous pouvez révoquer l'accès à tout moment.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDeny}
                className="flex-1 btn btn-secondary"
                disabled={isLoading}
              >
                Refuser
              </button>
              <button
                onClick={handleAuthorize}
                className="flex-1 btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Autorisation...
                  </span>
                ) : (
                  'Autoriser'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
