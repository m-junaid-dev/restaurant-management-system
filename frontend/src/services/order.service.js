import { api } from "./api";
export const orderService = {
  create: (body) => api("/orders", { method: "POST", body }),
  mine: (params) => api("/orders/my-orders", { params }),
  get: (id) => api(`/orders/${id}`),
  cancel: (id) => api(`/orders/${id}/cancel`, { method: "PATCH" }),
  setStatus: (id, orderStatus) => api(`/orders/${id}/status`, { method: "PATCH", body: { orderStatus } }),
};
