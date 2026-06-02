import api from "./axios";

export const interactionsApi = {
  // Cuentas sociales
  getSocialAccounts: () => api.get("/social-accounts/"),
  createSocialAccount: (data) => api.post("/social-accounts/", data),
  deleteSocialAccount: (id) => api.delete(`/social-accounts/${id}/`),

  // Interacciones
  getInteractions: (params) => api.get("/interactions/", { params }),
  createInteraction: (data) => api.post("/interactions/", data),
  updateInteraction: (id, data) => api.patch(`/interactions/${id}/`, data),
  deleteInteraction: (id) => api.delete(`/interactions/${id}/`),

  // Notas
  upsertNote: (interactionId, data) =>
    api.post(`/interactions/${interactionId}/note/`, data),
};
