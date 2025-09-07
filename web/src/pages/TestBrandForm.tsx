import { BrandForm } from '../components/forms/BrandForm';
import { useProjectStore } from '../stores/projectStore';
import { ToastProvider } from '../components/ui/Toast';
import { GlobalHeader } from '../components/GlobalHeader';

export default function TestBrandForm() {
  const { brandIdentity } = useProjectStore();

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <GlobalHeader />
        <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Test du formulaire BrandForm</h1>
          
          <BrandForm 
            onSubmit={() => {
              console.log('Formulaire soumis avec succès!');
              console.log('Données sauvegardées:', brandIdentity);
            }} 
          />

          {brandIdentity && (
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Données sauvegardées dans le store:</h2>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(brandIdentity, null, 2)}
              </pre>
            </div>
          )}
        </div>
        </div>
      </div>
    </ToastProvider>
  );
}