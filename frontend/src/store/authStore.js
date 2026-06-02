import { create } from "zustand";
import { authApi } from "../api/auth";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      await get().fetchProfile();
      set({ isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || "Credenciales incorrectas.";
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  logout: async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) await authApi.logout(refresh);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      set({ user: null, isAuthenticated: false });
    }
  },

  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register(formData);
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const errors = err.response?.data || {};
      set({ error: errors, isLoading: false });
      return { success: false, errors };
    }
  },

  fetchProfile: async () => {
    try {
      const { data } = await authApi.getProfile();
      set({ user: data });
    } catch {
      // token inválido — limpiar
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      set({ isAuthenticated: false, user: null });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
