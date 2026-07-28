import { create } from 'zustand';
import { User, Role } from '@/types';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user, isAuthenticated: !!user });
  },

  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  hasRole: (...roles) => {
    const user = get().user;
    return user ? roles.includes(user.role) : false;
  },

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      try {
        const res = await api.get('/auth/profile', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        set({ user: res.data, isAuthenticated: true, isLoading: false });
        return;
      } catch {}
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
