import { api } from "./api";
export const cartService = {
  get: () => api("/cart"),
  add: (menuItemId, quantity = 1) => api("/cart/items", { method: "POST", body: { menuItemId, quantity } }),
  update: (menuItemId, quantity) => api(`/cart/items/${menuItemId}`, { method: "PATCH", body: { quantity } }),
  remove: (menuItemId) => api(`/cart/items/${menuItemId}`, { method: "DELETE" }),
  clear: () => api("/cart", { method: "DELETE" }),
};
