export default function Strategy() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Stratégie &amp; Posts</h2>
        <div className="hidden sm:flex items-center gap-2">
          <button className="btn btn-outline">Exporter</button>
          <button className="btn btn-primary">Générer</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="card card-hover">
            <div className="card-body">
              <h3 className="text-lg font-medium mb-2">Stratégie générée</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Votre stratégie personnalisée apparaîtra ici après génération.
              </p>
              <div className="divider" />
              <div className="flex flex-wrap gap-2">
                <span className="badge">Audience</span>
                <span className="badge">Canaux</span>
                <span className="badge">Messages clés</span>
              </div>
            </div>
          </section>

          <section className="card card-hover">
            <div className="card-body">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">Posts proposés</h3>
                <button className="btn btn-secondary">Tout approuver</button>
              </div>

              <div className="space-y-4">
                <article className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="badge">Twitter / X</span>
                      <span className="text-xs text-gray-400">Brouillon</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-ghost px-2 py-1 text-xs">Éditer</button>
                      <button className="btn btn-outline px-2 py-1 text-xs">Approuver</button>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Exemple de post généré…
                  </p>
                </article>

                <article className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="badge">LinkedIn</span>
                      <span className="text-xs text-gray-400">Brouillon</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-ghost px-2 py-1 text-xs">Éditer</button>
                      <button className="btn btn-outline px-2 py-1 text-xs">Approuver</button>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Idée de post LinkedIn…
                  </p>
                </article>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card card-hover">
            <div className="card-body">
              <h3 className="text-lg font-medium mb-4">Calendrier éditorial</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 flex items-center justify-between">
                  <span>Lundi — Twitter — 10:00</span>
                  <span className="text-xs badge">Programmé</span>
                </li>
                <li className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 flex items-center justify-between">
                  <span>Mercredi — LinkedIn — 14:00</span>
                  <span className="text-xs badge">À valider</span>
                </li>
              </ul>
            </div>
          </section>
        </aside>
      </div>

      <div className="sm:hidden">
        <div className="flex items-center gap-2">
          <button className="btn btn-outline w-full">Exporter</button>
          <button className="btn btn-primary w-full">Générer</button>
        </div>
      </div>
    </div>
  )
}
