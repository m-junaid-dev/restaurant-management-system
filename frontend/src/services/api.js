// Poore project mein API ka sirf yehi ek URL use hota hai.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "rms_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

export class ApiError extends Error {
  constructor(message, status = 0, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function api(path, { method = "GET", body, params } = {}) {
  let query = "";
  if (params) {
    const clean = Object.entries(params).filter(([, v]) => v !== "" && v != null);
    if (clean.length) query = "?" + new URLSearchParams(clean).toString();
  }
  const headers = { "Content-Type": "application/json" };
  if (getToken()) headers.Authorization = `Bearer ${getToken()}`;
  let res;
  try {
    res = await fetch(API_BASE_URL + path + query, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError("Server se connection nahi ho saka. Backend chal raha hai aur VITE_API_URL sahi hai?");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    if (res.status === 401) window.dispatchEvent(new Event("rms:unauthorized"));
    const detail = Array.isArray(json.errors) && json.errors.length ? " " + json.errors.map((e) => e.message || e).join(", ") : "";
    throw new ApiError((json.message || "Something went wrong.") + detail, res.status, json.errors || []);
  }
  return json.data;
}
