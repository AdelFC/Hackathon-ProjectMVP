import { useState } from 'react'
import { AnalyzeUrlPanel } from '../components/AnalyzeUrlPanel'
import { ToastProvider, useToast } from '../components/ui/Toast'

function TestContent() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<any>(null)
  const { addToast } = useToast()

  const handleAnalysisComplete = (analysisResult: any) => {
    setResult(analysisResult)
    addToast('Analyse complétée avec succès!', 'success')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="section py-10 max-w-3xl">
        <h1 className="text-2xl font-semibold mb-6">Test AnalyzeUrlPanel</h1>
        
        <div className="card">
          <div className="card-body">
            <AnalyzeUrlPanel
              url={url}
              onUrlChange={setUrl}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>
        </div>

        {result && (
          <div className="mt-6 card">
            <div className="card-body">
              <h2 className="text-lg font-semibold mb-4">Résultat de l'analyse</h2>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TestAnalyzeUrl() {
  return (
    <ToastProvider>
      <TestContent />
    </ToastProvider>
  )
}
