import api from "./axios";

export const authApi = {
  register: (data) => api.post("/auth/register/", data),
  login: (data) => api.post("/auth/login/", data),
  logout: (refresh) => api.post("/auth/logout/", { refresh }),
  verifyEmail: (uidb64, token) => api.get(`/auth/verify-email/${uidb64}/${token}/`),
  resendVerification: (email) => api.post("/auth/resend-verification/", { email }),
  getProfile: () => api.get("/auth/profile/"),
  updateProfile: (data) => api.patch("/auth/profile/", data),
  changePassword: (data) => api.post("/auth/change-password/", data),
};
