import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { usePreferencesStore } from '../stores/preferencesStore'
import logo from '../assets/logo.png'

export default function AppShell() {
  const navigate = useNavigate()
  const { darkMode, toggleDarkMode, sidebarOpen, toggleSidebar } = usePreferencesStore()
  const [mobileOpen, setMobileOpen] = useState(false)  // mobile drawer (sm-md)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === '1') navigate('/app/strategy')
        if (e.key === '2') navigate('/app/analytics')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  useEffect(() => {
    if (mobileOpen) document.body.classList.add('overflow-hidden')
    else document.body.classList.remove('overflow-hidden')
    return () => document.body.classList.remove('overflow-hidden')
  }, [mobileOpen])

  const nav = [
    {
      to: '/app/strategy',
      label: 'Stratégie',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16M4 12h10M4 17h7" />
        </svg>
      ),
      hotkey: 'Alt+1',
    },
    {
      to: '/app/analytics',
      label: 'Analytics',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="M7 13v5M12 9v9M17 5v13" />
        </svg>
      ),
      hotkey: 'Alt+2',
    },
    {
      to: '/app/integrations',
      label: 'Intégrations',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 7h8M3 7h2m14 0h2M8 17h8M3 17h2m14 0h2" />
        </svg>
      ),
    },
    {
      to: '/app/settings',
      label: 'Paramètres',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.07a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.07a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.02 4.2l.06.06c.49.49 1.2.64 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.07c0 .67.39 1.27 1 1.51h.1c.62.31 1.33.16 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.49.49-.64 1.2-.33 1.82V9c.24.61.84 1 1.51 1H21a2 2 0 1 1 0 4h-.07c-.67 0-1.27.39-1.51 1Z" />
        </svg>
      ),
    },
  ]

  const NavItems = ({ showLabels }: { showLabels: boolean }) => (
    <nav className="p-2">
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active nav-accent' : ''}`
          }
        >
          <span className="flex items-center gap-3">
            <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
            {showLabels && <span>{item.label}</span>}
          </span>
          {showLabels && item.hotkey && <span className="kbd">{item.hotkey}</span>}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="section h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toggleSidebar()
                setMobileOpen((v) => !v)
              }}
              className="btn btn-ghost px-2"
              aria-label="Menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-sidebar"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <img src={logo} alt="Social Studio" className="h-8 w-auto" />
            <span className="font-semibold">Social Studio</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-gray-500">{new Date().toLocaleDateString()}</span>
            <button onClick={toggleDarkMode} className="btn btn-ghost px-2" aria-label="Dark mode">
              {darkMode ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
                  <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41m0-14.14-1.41 1.41M6.34 17.66 4.93 19.07" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <button
          className="backdrop lg:hidden z-40"
          aria-label="Fermer le menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        id="mobile-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800`}
      >
        <div className="p-2 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-1 py-2">
            <span className="font-semibold">Navigation</span>
            <button
              className="btn btn-ghost px-2"
              aria-label="Fermer"
              onClick={() => setMobileOpen(false)}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <NavItems showLabels={true} />
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-60' : 'w-16'
          } hidden lg:block transition-all duration-300 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900`}
          aria-label="Navigation"
        >
          <NavItems showLabels={sidebarOpen} />
        </aside>

        {/* Main */}
        <main className="flex-1 section py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
