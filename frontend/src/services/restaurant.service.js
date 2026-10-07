import { api } from "./api";
export const restaurantService = {
  list: (params) => api("/restaurants", { params }),
  get: (id) => api(`/restaurants/${id}`),
  create: (body) => api("/restaurants", { method: "POST", body }),
  update: (id, body) => api(`/restaurants/${id}`, { method: "PATCH", body }),
  mine: () => api("/restaurants", { params: { owner: "me", limit: 1 } }),
  orders: (id, params) => api(`/restaurants/${id}/orders`, { params }),
};
export const categoryService = {
  list: (rid) => api(`/restaurants/${rid}/categories`),
  create: (rid, body) => api(`/restaurants/${rid}/categories`, { method: "POST", body }),
  update: (id, body) => api(`/categories/${id}`, { method: "PATCH", body }),
  remove: (id) => api(`/categories/${id}`, { method: "DELETE" }),
};
export const menuService = {
  list: (rid, params) => api(`/restaurants/${rid}/menu`, { params }),
  create: (rid, body) => api(`/restaurants/${rid}/menu`, { method: "POST", body }),
  update: (id, body) => api(`/menu/${id}`, { method: "PATCH", body }),
  remove: (id) => api(`/menu/${id}`, { method: "DELETE" }),
  setAvailability: (id, isAvailable) => api(`/menu/${id}/availability`, { method: "PATCH", body: { isAvailable } }),
};
