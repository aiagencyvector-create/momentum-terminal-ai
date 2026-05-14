import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient, clearSupabaseCache } from '../lib/supabase';

type State = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
};

type Actions = {
  initialize: (url: string, anonKey: string) => Promise<void>;
  signInWithOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<State & Actions>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,

  initialize: async (url, anonKey) => {
    clearSupabaseCache();
    const client = getSupabaseClient(url, anonKey);
    const { data } = await client.auth.getSession();
    set({
      session: data.session,
      user: data.session?.user ?? null,
      initialized: true,
    });
    client.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signInWithOtp: async (email) => {
    set({ loading: true });
    try {
      const settings = await window.api.settings.get();
      const client = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async (email, token) => {
    set({ loading: true });
    try {
      const settings = await window.api.settings.get();
      const client = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
      const { data, error } = await client.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) throw error;
      set({ session: data.session, user: data.user });
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    const settings = await window.api.settings.get();
    const client = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
    await client.auth.signOut();
    set({ session: null, user: null });
    void get();
  },
}));
