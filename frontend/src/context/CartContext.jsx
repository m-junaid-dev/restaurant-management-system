import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cartService } from "../services/cart.service";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { idOf } from "../utils/format";

const Ctx = createContext();
export const useCart = () => useContext(Ctx);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const [cart, setCart] = useState(null);

  const refresh = useCallback(async () => {
    if (user?.role !== "customer") return setCart(null);
    try { setCart((await cartService.get()) || null); } catch { setCart(null); }
  }, [user]);
  useEffect(() => { refresh(); }, [refresh]);

  const run = async (fn, okMsg) => {
    try { setCart((await fn()) || null); okMsg && toast(okMsg); return true; }
    catch (e) { toast(e.message, "error"); return false; }
  };

  const add = async (item, restaurantId) => {
    if (!user) return nav("/login", { state: { from: loc.pathname } });
    if (user.role !== "customer") return toast("Only customer accounts can order food.", "error");
    const inCart = cart?.items?.length ? idOf(cart.restaurant) : null;
    if (inCart && inCart !== restaurantId) {
      if (!window.confirm("Your cart contains items from another restaurant. Clear cart and add this item?")) return;
      if (!(await run(() => cartService.clear()))) return;
    }
    run(() => cartService.add(item._id, 1), `${item.name} added to cart`);
  };

  const value = {
    cart, refresh, add,
    count: cart?.items?.reduce((n, i) => n + i.quantity, 0) || 0,
    setQty: (id, q) => run(() => (q < 1 ? cartService.remove(id) : cartService.update(id, q))),
    remove: (id) => run(() => cartService.remove(id), "Item removed"),
    clear: () => run(() => cartService.clear(), "Cart cleared"),
    reset: () => setCart(null),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
