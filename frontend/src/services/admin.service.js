import { api } from "./api";
export const adminService = {
  dashboard: () => api("/admin/dashboard"),
  users: (params) => api("/admin/users", { params }),
  blockUser: (id, isBlocked) => api(`/admin/users/${id}/block`, { method: "PATCH", body: { isBlocked } }),
  restaurants: (params) => api("/admin/restaurants", { params }),
  setRestaurantActive: (id, isActive) => api(`/admin/restaurants/${id}/status`, { method: "PATCH", body: { isActive } }),
  orders: (params) => api("/admin/orders", { params }),
};
