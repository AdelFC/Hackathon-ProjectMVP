import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Provider = 'twitter' | 'linkedin' | 'facebook' | 'instagram';

export interface Integration {
  provider: Provider;
  connected: boolean;
  accountName?: string;
  accountId?: string;
  connectedAt?: Date;
  expiresAt?: Date;
  scopes?: string[];
}

interface IntegrationStore {
  integrations: Integration[];
  isConnecting: Provider | null;
  
  connect: (provider: Provider, accountData?: Partial<Integration>) => void;
  disconnect: (provider: Provider) => void;
  setConnecting: (provider: Provider | null) => void;
  getIntegration: (provider: Provider) => Integration | undefined;
  isConnected: (provider: Provider) => boolean;
}

const defaultIntegrations: Integration[] = [
  { provider: 'twitter', connected: false },
  { provider: 'linkedin', connected: false },
  { provider: 'facebook', connected: false },
  { provider: 'instagram', connected: false },
];

export const useIntegrationStore = create<IntegrationStore>()(
  persist(
    (set, get) => ({
      integrations: defaultIntegrations,
      isConnecting: null,
      
      connect: (provider, accountData) => set((state) => ({
        integrations: state.integrations.map(i => 
          i.provider === provider 
            ? { 
                ...i, 
                connected: true, 
                connectedAt: new Date(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
                ...accountData 
              }
            : i
        )
      })),
      
      disconnect: (provider) => set((state) => ({
        integrations: state.integrations.map(i => 
          i.provider === provider 
            ? { provider, connected: false }
            : i
        )
      })),
      
      setConnecting: (provider) => set({ isConnecting: provider }),
      
      getIntegration: (provider) => {
        return get().integrations.find(i => i.provider === provider);
      },
      
      isConnected: (provider) => {
        const integration = get().getIntegration(provider);
        return integration?.connected || false;
      },
    }),
    {
      name: 'integrations-storage',
    }
  )
);