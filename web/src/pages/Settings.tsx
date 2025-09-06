export default function Settings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Paramètres</h2>
        <div className="hidden sm:flex items-center gap-2">
          <button className="btn btn-outline">Annuler</button>
          <button className="btn btn-primary">Sauvegarder</button>
        </div>
      </div>

      <section className="card card-hover">
        <div className="card-body">
          <h3 className="text-lg font-medium mb-4">Préférences</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Langue</label>
              <select className="field">
                <option>Français</option>
                <option>English</option>
              </select>
            </div>
            <div>
              <label className="label">Fuseau horaire</label>
              <select className="field">
                <option>Europe/Paris</option>
                <option>Europe/London</option>
                <option>America/New_York</option>
                <option>UTC</option>
              </select>
            </div>
          </div>
          <div className="divider" />
          <p className="text-xs text-gray-500">
            Ces préférences définissent les formats d&apos;heure et la langue de l&apos;interface.
          </p>
        </div>
      </section>

      <section className="card card-hover">
        <div className="card-body">
          <h3 className="text-lg font-medium mb-4">Notifications</h3>
          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked />
              <span>Alertes par email</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked />
              <span>Rappels de publication</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" />
              <span>Rapports hebdomadaires</span>
            </label>
          </div>
          <div className="divider" />
          <p className="text-xs text-gray-500">
            Vous pouvez ajuster la fréquence des emails à tout moment.
          </p>
        </div>
      </section>

      <section className="card card-hover">
        <div className="card-body">
          <h3 className="text-lg font-medium mb-4">Clés API</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Clé</label>
              <input type="password" className="field" defaultValue="sk-***************" />
            </div>
            <p className="text-sm text-gray-500">
              Utilisée pour la génération de contenu.
            </p>
          </div>
        </div>
      </section>

      <div className="sm:hidden flex gap-2">
        <button className="btn btn-outline w-full">Annuler</button>
        <button className="btn btn-primary w-full">Sauvegarder</button>
      </div>
    </div>
  )
}
