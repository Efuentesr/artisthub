import { create } from "zustand";
import { interactionsApi } from "../api/interactions";

const useInteractionsStore = create((set, get) => ({
  interactions: [],
  socialAccounts: [],
  isLoading: false,
  error: null,
  filters: {
    search: "",
    platform: "",
    type: "",
    tag: "",
    status: "",
  },

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  clearFilters: () =>
    set({ filters: { search: "", platform: "", type: "", tag: "", status: "" } }),

  fetchInteractions: async () => {
    set({ isLoading: true, error: null });
    try {
      const params = {};
      const { filters } = get();
      if (filters.search) params.search = filters.search;
      if (filters.platform) params.platform = filters.platform;
      if (filters.type) params.type = filters.type;
      if (filters.tag) params.tag = filters.tag;
      if (filters.status) params.status = filters.status;
      const { data } = await interactionsApi.getInteractions(params);
      set({ interactions: data, isLoading: false });
    } catch {
      set({ error: "Error al cargar interacciones.", isLoading: false });
    }
  },

  fetchSocialAccounts: async () => {
    try {
      const { data } = await interactionsApi.getSocialAccounts();
      set({ socialAccounts: data });
    } catch {
      set({ socialAccounts: [] });
    }
  },

  createInteraction: async (formData) => {
    try {
      const { data } = await interactionsApi.createInteraction(formData);
      set((s) => ({ interactions: [data, ...s.interactions] }));
      return { success: true };
    } catch (err) {
      return { success: false, errors: err.response?.data || {} };
    }
  },

  upsertNote: async (interactionId, noteData) => {
    try {
      const { data } = await interactionsApi.upsertNote(interactionId, noteData);
      set((s) => ({
        interactions: s.interactions.map((i) =>
          i.id === interactionId ? { ...i, note: data } : i
        ),
      }));
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  deleteInteraction: async (id) => {
    try {
      await interactionsApi.deleteInteraction(id);
      set((s) => ({ interactions: s.interactions.filter((i) => i.id !== id) }));
      return { success: true };
    } catch {
      return { success: false };
    }
  },
}));

export default useInteractionsStore;
