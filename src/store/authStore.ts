import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface User {
  username: string;
  email: string;
  role: string;
  phoneNumber: string;
  token: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const user = {
          username: data.user.email?.split('@')[0] || '',
          email: data.user.email || '',
          role: 'ADMIN', // You can store this in user metadata
          phoneNumber: '15550001', // You can store this in user metadata
          token: data.session?.access_token || '',
        };
        set({ user, loading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  logout: async () => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));