import { useEffect, useState } from 'react'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  return (
    <div className="min-h-screen">
      <header className="section h-14 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <span className="font-semibold">Social Studio</span>
        <button onClick={() => setDarkMode(!darkMode)} className="btn btn-ghost px-2" aria-label="Dark mode">
          {darkMode ? 'Mode clair' : 'Mode sombre'}
        </button>
      </header>

      <main className="section py-12">
        <div className="card"><div className="card-body">
          <h2 className="text-xl font-medium mb-2">Bienvenue</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Interface allégée, sans emojis, avec une hiérarchie typographique nette et des cartes cohérentes.
          </p>
        </div></div>
      </main>
    </div>
  )
}
