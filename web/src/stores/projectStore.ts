import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Provider } from './integrationStore';

interface BrandIdentity {
  name: string;
  industry: string;
  website: string;
  startupName?: string;
  startupUrl?: string;
  mission: string;
  targetAudience: string;
  valueProps?: string;
  usp: string;
  voice: string;
  features: string[];
  hashtags?: string[];
  guidelines?: {
    do?: string[];
    dont?: string[];
  };
}

interface ProjectGoals {
  cadence: 'daily' | 'weekly' | 'biweekly';
  objectives: string[]; // e.g. ['Visibilité', 'Leads']
  kpis: ('ER' | 'CTR' | 'growth')[];
  targetKpi: 'ER' | 'CTR' | 'growth';
  enabledNetworks: Provider[]; // réseaux activés pour la stratégie
}

interface ProjectStore {
  brandIdentity: BrandIdentity | null;
  goals: ProjectGoals | null;
  setupCompleted: boolean;
  currentStep: number;

  setBrandIdentity: (brand: BrandIdentity) => void;
  setGoals: (goals: ProjectGoals) => void;
  setCurrentStep: (step: number) => void;
  completeSetup: () => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      brandIdentity: null,
      goals: null,
      setupCompleted: false,
      currentStep: 0,

      setBrandIdentity: (brand) => set({ brandIdentity: brand }),
      setGoals: (goals) => set({ goals }),
      setCurrentStep: (step) => set({ currentStep: step }),
      completeSetup: () => set({ setupCompleted: true }),
      reset: () => set({
        brandIdentity: null,
        goals: null,
        setupCompleted: false,
        currentStep: 0
      }),
    }),
    {
      name: 'project-storage',
    }
  )
);
