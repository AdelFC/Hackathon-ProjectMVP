import { useState, useEffect } from 'react'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Social Media Strategy Assistant
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </header>

        <main className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Welcome to Your AI-Powered Social Media Assistant
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Powered by <span className="font-semibold text-primary-600 dark:text-primary-400">Blackbox AI</span>, 
              this platform helps you create and manage your social media strategy with intelligent automation.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <h3 className="font-semibold text-primary-900 dark:text-primary-300 mb-2">Strategy Generation</h3>
                <p className="text-sm text-primary-700 dark:text-primary-400">
                  AI-powered content strategy tailored to your brand
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">Content Creation</h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Generate engaging posts for all platforms
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Analytics Dashboard</h3>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Track performance and optimize your strategy
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-slide-up">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Start
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Ready to transform your social media presence? Click below to get started with our setup wizard.
            </p>
            <button className="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              Get Started
            </button>
          </div>
        </main>

        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            MVP Hackathon 24h - Powered by Blackbox AI
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App