import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { CheckCircle, Globe, Brain, Target, BarChart3, Sparkles } from 'lucide-react'
import { translations } from '../utils/translations'
import { GlobalHeader, useLanguage } from '../components/GlobalHeader'
import logo from '../assets/logo.png'
import photoRomain from '../assets/medium_rguigneb.jpg'
import photoAdel from '../assets/medium_afodil-c.jpg'
import photoEnzo from '../assets/medium_ennollet.jpg'

// Logos des intégrations - À ajouter plus tard
// import xLogo from '../assets/integrations/x.svg'
// import linkedinLogo from '../assets/integrations/linkedin.svg'
// import facebookLogo from '../assets/integrations/facebook.svg'
// import notionLogo from '../assets/integrations/notion.svg'
// import slackLogo from '../assets/integrations/slack.svg'
// import trelloLogo from '../assets/integrations/trello.svg'

export default function Landing() {
  const language = useLanguage()
  const [showContactModal, setShowContactModal] = useState(false)
  const t = translations[language]

  // Photos des membres de l'équipe
  const teamPhotos = [photoRomain, photoAdel, photoEnzo]

  const features = [
    {
      icon: <Globe className="w-6 h-6" aria-hidden="true" />,
      title: t.features.items[0].title,
      description: t.features.items[0].description
    },
    {
      icon: <Brain className="w-6 h-6" aria-hidden="true" />,
      title: t.features.items[1].title,
      description: t.features.items[1].description,
      hasMock: true,
      mockLabel: t.features.items[1].mockLabel
    },
    {
      icon: <Target className="w-6 h-6" aria-hidden="true" />,
      title: t.features.items[2].title,
      description: t.features.items[2].description
    },
    {
      icon: <BarChart3 className="w-6 h-6" aria-hidden="true" />,
      title: t.features.items[3].title,
      description: t.features.items[3].description
    }
  ]

  const steps = t.workflow.steps.map((step, index) => ({
    number: `0${index + 1}`,
    title: step.title,
    description: step.description,
    hasMock: index === 1,
    mockLabel: index === 1 ? step.mockLabel : undefined
  }))

  // Données des intégrations (logos à ajouter)
  const integrations = [
    'X / Twitter',
    'LinkedIn',
    'Facebook',
    'Notion',
    'Slack',
    'Trello'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Global Header */}
      <GlobalHeader 
        customActions={
          <Button 
            variant="primary"
            size="sm"
            onClick={() => setShowContactModal(true)}
          >
            {t.header.contactUs}
          </Button>
        }
      />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            {t.hero.badge}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            {t.hero.title}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            {t.hero.description}
            <span className="italic"> {t.hero.mockNote}</span>
            {t.hero.productionNote}
          </p>

          <div className="flex justify-center">
            <Link to="/setup">
              <Button size="lg" className="px-8 bg-emerald-600 hover:bg-emerald-700">
                {t.hero.configureAgent}
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Unified Features & Workflow */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t.workflow.title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t.workflow.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card
              key={step.number}
              variant="bordered"
              className="group hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors relative"
            >
              <div className="p-6">
                <div className="text-4xl font-bold text-emerald-100 dark:text-emerald-950 absolute top-2 right-4" aria-hidden="true">
                  {step.number}
                </div>
                <div
                  className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform"
                  aria-hidden="true"
                >
                  {features[index].icon}
                </div>
                <h3 className="font-semibold mb-2">
                  {step.title} {step.hasMock && <span className="italic text-gray-500">{step.mockLabel}</span>}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Two Main Surfaces */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-gray-200 dark:border-gray-800">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Analytics */}
          <div>
            <Badge variant="success" size="lg" className="mb-4">{t.analytics.badge}</Badge>
            <h2 className="text-3xl font-bold mb-6">{t.analytics.title}</h2>
            <div className="space-y-4">
              {t.analytics.items.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.includes('mock') || item.includes('Bitly') ? (
                      <>
                        {item.split('mock')[0]}
                        <span className="italic">mock</span>
                        {item.split('mock')[1]}
                      </>
                    ) : item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy */}
          <div>
            <Badge variant="info" size="lg" className="mb-4">{t.strategy.badge}</Badge>
            <h2 className="text-3xl font-bold mb-6">{t.strategy.title}</h2>
            <div className="space-y-4">
              {t.strategy.items.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t.integrations.title}</h2>
          <p className="text-gray-600 dark:text-gray-400 italic">{t.integrations.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {integrations.map((tool) => (
            <Card key={tool} variant="bordered" className="hover:border-emerald-500 transition-colors">
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 mx-auto mb-3" aria-hidden="true" />
                <span className="text-sm font-medium">{tool}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <img src={logo} alt="StartPost Agent" className="h-6 w-auto" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t.footer.copyright}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.footer.poweredBy}
              </span>
            </div>
            <button
              onClick={() => setShowContactModal(true)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {t.footer.contact}
            </button>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={t.contactModal.title}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">{t.contactModal.subtitle}</p>
          <div className="space-y-3">
            {t.contactModal.team.map((member, index) => (
              <Card key={index} variant="bordered">
                <div className="p-4 flex items-center gap-4">
                  <img 
                    src={teamPhotos[index]} 
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                    <a 
                      href={`mailto:${member.email}`}
                      className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      {member.email}
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowContactModal(false)}
            >
              {t.contactModal.close}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
