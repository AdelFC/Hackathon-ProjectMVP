import { create } from 'zustand';

export interface Post {
  id: string;
  platform: 'twitter' | 'linkedin' | 'facebook';
  content: string;
  variations: string[];
  scheduledDate?: Date;
  status: 'draft' | 'scheduled' | 'published';
  media?: string[];
  hashtags?: string[];
  characterCount: number;
}

export interface Strategy {
  toneByNetwork: {
    twitter: string;
    linkedin: string;
    facebook: string;
  };
  themes: string[];
  cadence: string;
  personas: string[];
  generatedAt: Date;
}

interface ContentStore {
  strategy: Strategy | null;
  posts: Post[];
  selectedPostId: string | null;
  isGenerating: boolean;
  
  setStrategy: (strategy: Strategy) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, post: Partial<Post>) => void;
  deletePost: (id: string) => void;
  selectPost: (id: string | null) => void;
  setGenerating: (generating: boolean) => void;
  reorderPosts: (posts: Post[]) => void;
}

export const useContentStore = create<ContentStore>((set) => ({
  strategy: null,
  posts: [],
  selectedPostId: null,
  isGenerating: false,
  
  setStrategy: (strategy) => set({ strategy }),
  addPost: (post) => set((state) => ({ posts: [...state.posts, post] })),
  updatePost: (id, updates) => set((state) => ({
    posts: state.posts.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deletePost: (id) => set((state) => ({
    posts: state.posts.filter(p => p.id !== id)
  })),
  selectPost: (id) => set({ selectedPostId: id }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  reorderPosts: (posts) => set({ posts }),
}));