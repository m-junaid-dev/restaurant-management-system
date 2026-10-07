import { NavLink, Outlet, useSearchParams } from "react-router-dom";

// links: [{to, text, end}]. ?restaurant=ID query sidebar links mein carry hoti hai (super admin manage ke liye).
export default function DashLayout({ title, links }) {
  const [sp] = useSearchParams();
  const search = sp.get("restaurant") ? `?restaurant=${sp.get("restaurant")}` : "";
  return (
    <div className="wrap dash">
      <aside className="side">
        <h2>{title}</h2>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to + search} end={l.end}>{l.text}</NavLink>
          ))}
        </nav>
      </aside>
      <section className="dash-main"><Outlet /></section>
    </div>
  );
}
