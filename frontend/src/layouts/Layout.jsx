import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth, homeFor } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const { count, reset } = useCart();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const close = () => setOpen(false);
  const out = async () => { await logout(); reset(); close(); nav("/"); };

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <Link to="/" className="logo" onClick={close}>Thaali</Link>
          <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
          <nav className={`nav-links ${open ? "open" : ""}`} onClick={close}>
            <NavLink to="/restaurants">Restaurants</NavLink>
            {user?.role === "customer" && <NavLink to="/cart">Cart{count > 0 && <b className="count">{count}</b>}</NavLink>}
            {user ? (
              <>
                <NavLink to={homeFor(user.role)}>{user.role === "customer" ? "My account" : "Dashboard"}</NavLink>
                <button className="btn ghost" onClick={out}>Log out</button>
              </>
            ) : (
              <>
                <NavLink to="/login">Log in</NavLink>
                <Link className="btn" to="/register">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="footer">
        <div className="wrap between">
          <strong>Thaali</strong>
          <span className="small">Order from local kitchens. Pay cash on delivery.</span>
        </div>
      </footer>
    </>
  );
}
