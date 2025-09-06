import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MonthlyPlan, DailyPost } from '../services/api';

interface StrategyStore {
  // État
  activeStrategy: MonthlyPlan | null;
  strategies: MonthlyPlan[];
  lastSync: string | null;
  
  // Actions
  setActiveStrategy: (strategy: MonthlyPlan) => void;
  addStrategy: (strategy: MonthlyPlan) => void;
  updateStrategy: (brandName: string, updates: Partial<MonthlyPlan>) => void;
  removeStrategy: (brandName: string) => void;
  getStrategy: (brandName: string) => MonthlyPlan | undefined;
  getPostsForDate: (date: string) => DailyPost[];
  markSynced: () => void;
  clearStrategies: () => void;
}

export const useStrategyStore = create<StrategyStore>()(
  persist(
    (set, get) => ({
      activeStrategy: null,
      strategies: [],
      lastSync: null,
      
      setActiveStrategy: (strategy) => set({ 
        activeStrategy: strategy,
        strategies: get().strategies.some(s => s.brand_name === strategy.brand_name)
          ? get().strategies.map(s => s.brand_name === strategy.brand_name ? strategy : s)
          : [...get().strategies, strategy]
      }),
      
      addStrategy: (strategy) => set((state) => ({
        strategies: [...state.strategies.filter(s => s.brand_name !== strategy.brand_name), strategy],
        activeStrategy: strategy
      })),
      
      updateStrategy: (brandName, updates) => set((state) => ({
        strategies: state.strategies.map(s => 
          s.brand_name === brandName ? { ...s, ...updates } : s
        ),
        activeStrategy: state.activeStrategy?.brand_name === brandName
          ? { ...state.activeStrategy, ...updates }
          : state.activeStrategy
      })),
      
      removeStrategy: (brandName) => set((state) => ({
        strategies: state.strategies.filter(s => s.brand_name !== brandName),
        activeStrategy: state.activeStrategy?.brand_name === brandName 
          ? null 
          : state.activeStrategy
      })),
      
      getStrategy: (brandName) => {
        return get().strategies.find(s => s.brand_name === brandName);
      },
      
      getPostsForDate: (date) => {
        const strategy = get().activeStrategy;
        if (!strategy) return [];
        
        return strategy.calendar.posts.filter(post => post.date === date);
      },
      
      markSynced: () => set({ 
        lastSync: new Date().toISOString() 
      }),
      
      clearStrategies: () => set({ 
        strategies: [], 
        activeStrategy: null,
        lastSync: null 
      })
    }),
    {
      name: 'strategy-storage',
      partialize: (state) => ({
        activeStrategy: state.activeStrategy,
        strategies: state.strategies,
        lastSync: state.lastSync
      })
    }
  )
);