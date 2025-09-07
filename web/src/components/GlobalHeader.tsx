import { usePreferencesStore } from '../stores/preferencesStore'
import { Moon, Sun } from 'lucide-react'
import logo from '../assets/logo.png'

export type Language = 'fr' | 'en'

interface GlobalHeaderProps {
  showLogo?: boolean
  title?: string
  customActions?: React.ReactNode
}

export function GlobalHeader({ showLogo = true, title = "StartPost Agent", customActions }: GlobalHeaderProps) {
  const { darkMode, toggleDarkMode, language, toggleLanguage } = usePreferencesStore()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showLogo && (
            <>
              <img src={logo} alt="StartPost Agent" className="h-7 w-auto" />
              <span className="font-semibold text-base">{title}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="btn btn-ghost px-3 py-1 text-sm font-medium"
            aria-label="Toggle language"
          >
            {language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
          </button>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="btn btn-ghost px-2"
            aria-label={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          
          {/* Custom Actions */}
          {customActions}
        </div>
      </div>
    </header>
  )
}

// Hook to use language in components
export function useLanguage() {
  const { language } = usePreferencesStore()
  return language
}