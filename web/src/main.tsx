import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'

// Layouts
import AppShell from './layouts/AppShell'

// Pages
import Landing from './pages/Landing'
import Setup from './pages/Setup'
import Strategy from './pages/Strategy'
import Analytics from './pages/Analytics'
import Integrations from './pages/Integrations'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/setup',
    element: <Setup />,
  },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/strategy" replace />,
      },
      {
        path: 'strategy',
        element: <Strategy />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
      {
        path: 'integrations',
        element: <Integrations />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)