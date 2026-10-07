import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService } from "../services/auth.service";
import { getToken, setToken } from "../services/api";

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export const homeFor = (role) =>
  role === "super_admin" ? "/admin" : role === "restaurant_admin" ? "/restaurant-admin" : "/customer/orders";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    authService.me().then(setUser).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onExpired = () => { setToken(null); setUser(null); };
    window.addEventListener("rms:unauthorized", onExpired);
    return () => window.removeEventListener("rms:unauthorized", onExpired);
  }, []);

  const finish = (data) => { setToken(data.token); setUser(data.user); return data.user; };
  const login = useCallback(async (body) => finish(await authService.login(body)), []);
  const register = useCallback(async (body) => finish(await authService.register(body)), []);
  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* token pehle hi expire ho sakta hai */ }
    setToken(null); setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</Ctx.Provider>;
}
