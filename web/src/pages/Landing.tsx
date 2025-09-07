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

  // Données des intégrations avec logos
  const integrations = [
    {
      name: 'X / Twitter',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: 'text-black dark:text-white'
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: 'text-blue-600'
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'text-blue-500'
    },
    {
      name: 'Notion',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
        </svg>
      ),
      color: 'text-gray-900 dark:text-gray-100'
    },
    {
      name: 'Slack',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
        </svg>
      ),
      color: 'text-purple-600'
    },
    {
      name: 'Trello',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .794-.645 1.44-1.44 1.44H15c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.646-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z"/>
        </svg>
      ),
      color: 'text-blue-500'
    }
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
          {integrations.map((integration) => (
            <Card key={integration.name} variant="bordered" className="hover:border-emerald-500 transition-colors">
              <div className="p-6 text-center">
                <div className={`w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 mx-auto mb-3 flex items-center justify-center ${integration.color}`} aria-hidden="true">
                  {integration.icon}
                </div>
                <span className="text-sm font-medium">{integration.name}</span>
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
