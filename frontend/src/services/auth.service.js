import { api } from "./api";
export const authService = {
  register: (body) => api("/auth/register", { method: "POST", body }),
  login: (body) => api("/auth/login", { method: "POST", body }),
  logout: () => api("/auth/logout", { method: "POST" }),
  me: () => api("/users/me"),
  updateMe: (body) => api("/users/me", { method: "PATCH", body }),
  changePassword: (body) => api("/users/change-password", { method: "PATCH", body }),
};
