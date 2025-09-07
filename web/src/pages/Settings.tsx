import { useLanguage } from '../components/GlobalHeader';
import { translations } from '../utils/translations';

export default function Settings() {
  const language = useLanguage();
  const t = translations[language];
  
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{t.app.settings.title}</h2>
        <div className="hidden sm:flex items-center gap-2">
          <button className="btn btn-outline">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
          <button className="btn btn-primary">{t.app.settings.save}</button>
        </div>
      </div>

      <section className="card card-hover">
        <div className="card-body">
          <h3 className="text-lg font-medium mb-4">{t.app.settings.preferences}</h3>
          <div className="space-y-4">
            <div>
              <label className="label">{language === 'fr' ? 'Langue' : 'Language'}</label>
              <select className="field">
                <option>Français</option>
                <option>English</option>
              </select>
            </div>
            <div>
              <label className="label">{language === 'fr' ? 'Fuseau horaire' : 'Timezone'}</label>
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
            {language === 'fr' ? "Ces préférences définissent les formats d'heure et la langue de l'interface." : "These preferences define time formats and the interface language."}
          </p>
        </div>
      </section>

      <section className="card card-hover">
        <div className="card-body">
          <h3 className="text-lg font-medium mb-4">{language === 'fr' ? 'Notifications' : 'Notifications'}</h3>
          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked />
              <span>{language === 'fr' ? 'Alertes par email' : 'Email alerts'}</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked />
              <span>{language === 'fr' ? 'Rappels de publication' : 'Publishing reminders'}</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" />
              <span>{language === 'fr' ? 'Rapports hebdomadaires' : 'Weekly reports'}</span>
            </label>
          </div>
          <div className="divider" />
          <p className="text-xs text-gray-500">
            {language === 'fr' ? 'Vous pouvez ajuster la fréquence des emails à tout moment.' : 'You can adjust email frequency at any time.'}
          </p>
        </div>
      </section>

      <section className="card card-hover">
        <div className="card-body">
          <h3 className="text-lg font-medium mb-4">{language === 'fr' ? 'Clés API' : 'API Keys'}</h3>
          <div className="space-y-4">
            <div>
              <label className="label">{language === 'fr' ? 'Clé' : 'Key'}</label>
              <input type="password" className="field" defaultValue="sk-***************" />
            </div>
            <p className="text-sm text-gray-500">
              {language === 'fr' ? 'Utilisée pour la génération de contenu.' : 'Used for content generation.'}
            </p>
          </div>
        </div>
      </section>

      <div className="sm:hidden flex gap-2">
        <button className="btn btn-outline w-full">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
        <button className="btn btn-primary w-full">{t.app.settings.save}</button>
      </div>
    </div>
  )
}
