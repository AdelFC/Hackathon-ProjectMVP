import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center space-y-4">
        <div className="text-7xl font-bold text-gray-300 dark:text-gray-700">404</div>
        <h2 className="text-xl font-medium">Page non trouvée</h2>
        <p className="text-gray-600 dark:text-gray-400">La page n'existe pas ou a été déplacée.</p>
        <div className="flex justify-center gap-3">
          <Link to="/" className="btn btn-primary">Accueil</Link>
          <Link to="/app/strategy" className="btn btn-ghost">Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
