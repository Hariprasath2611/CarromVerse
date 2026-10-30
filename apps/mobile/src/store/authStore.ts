import { create } from 'zustand';
import { AuthSessionUser } from '@carromverse/shared-types';
import {
  loginWithEmailPassword,
  logoutUser,
  onAuthStateChangedListener,
  registerWithEmailPassword,
  sendPasswordReset,
} from '../services/firebase/firebase.auth';

interface AuthState {
  user: AuthSessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: () => {
    const unsubscribe = onAuthStateChangedListener((user) => {
      set({
        user,
        isAuthenticated: !!user,
        isInitialized: true,
        isLoading: false,
      });
    });

    return unsubscribe;
  },

  login: async (email, pass) => {
    set({ isLoading: true, error: null });
    try {
      const user = await loginWithEmailPassword(email, pass);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Login failed', isLoading: false });
      throw error;
    }
  },

  register: async (email, pass, username) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await registerWithEmailPassword(email, pass, username);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await logoutUser();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Logout failed', isLoading: false });
      throw error;
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await sendPasswordReset(email);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Password reset failed', isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
