import { create } from 'zustand';
import { authApi } from '../../infrastructure/api/authApi';
import { apiClient } from '../../infrastructure/api/apiClient';

export const useAuthStore = create((set, get) => ({
  user: null,
  workspaces: [],
  activeWorkspace: null,
  activeRole: 'editor',
  isAuthenticated: !!apiClient.getToken(),
  isLoading: false,
  error: null,

  initialize: async () => {
    const token = apiClient.getToken();
    if (!token) {
      set({ isAuthenticated: false, user: null, workspaces: [] });
      return;
    }

    set({ isLoading: true });
    try {
      const data = await authApi.getMe();
      const defaultWs = data.workspaces?.[0] || null;
      set({
        user: data.user,
        workspaces: data.workspaces || [],
        activeWorkspace: defaultWs,
        activeRole: defaultWs?.role || 'editor',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.warn('Session restoration failed:', err.message);
      authApi.logout();
      set({ isAuthenticated: false, user: null, workspaces: [], isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(email, password);
      // Fetch full profile & workspace list
      const profile = await authApi.getMe();
      const defaultWs = profile.workspaces?.[0] || null;
      set({
        user: profile.user,
        workspaces: profile.workspaces || [],
        activeWorkspace: defaultWs,
        activeRole: defaultWs?.role || 'editor',
        isAuthenticated: true,
        isLoading: false,
      });
      return profile;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.register(name, email, password);
      const defaultWs = data.defaultWorkspace || null;
      set({
        user: data.user,
        workspaces: defaultWs ? [defaultWs] : [],
        activeWorkspace: defaultWs,
        activeRole: 'admin',
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  setActiveWorkspace: (workspaceId) => {
    const ws = get().workspaces.find((w) => w._id === workspaceId);
    if (ws) {
      set({ activeWorkspace: ws, activeRole: ws.role || 'editor' });
    }
  },

  logout: () => {
    authApi.logout();
    set({
      user: null,
      workspaces: [],
      activeWorkspace: null,
      activeRole: 'viewer',
      isAuthenticated: false,
      error: null,
    });
  },
}));
