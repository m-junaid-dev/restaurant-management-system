import { useState } from "react";
import { label } from "../utils/format";

export function Img({ src, alt = "", className = "", fallback = "🍽️" }) {
  const [bad, setBad] = useState(false);
  if (!src || bad) return <div className={`img-fallback ${className}`} aria-label={alt}>{fallback}</div>;
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBad(true)} />;
}

export const StatusBadge = ({ status }) => <span className={`badge st-${status}`}>{label(status)}</span>;

export const Loading = ({ text = "Loading..." }) => (
  <div className="state" role="status"><div className="spinner" />{text}</div>
);

export const ErrorBox = ({ message, onRetry }) => (
  <div className="state err" role="alert">
    <p>{message}</p>
    {onRetry && <button className="btn ghost" onClick={onRetry}>Try again</button>}
  </div>
);

export const Empty = ({ text, children }) => (
  <div className="state"><p>{text}</p>{children}</div>
);

// q = useFetch ka result. Loading / error / empty teeno states yahan handle hoti hain.
export function Async({ q, empty, emptyText = "Nothing here yet.", children }) {
  if (q.loading && !q.data) return <Loading />;
  if (q.error) return <ErrorBox message={q.error} onRetry={q.reload} />;
  const d = q.data;
  const list = Array.isArray(d) ? d : d?.items;
  if (list && !list.length) return empty || <Empty text={emptyText} />;
  return <div className={q.loading ? "fading" : ""}>{children(d)}</div>;
}

export function Pagination({ data, onChange }) {
  if (!data || !data.totalPages || data.totalPages < 2) return null;
  return (
    <nav className="pager" aria-label="Pagination">
      <button className="btn ghost" disabled={data.page <= 1} onClick={() => onChange(data.page - 1)}>Previous</button>
      <span>Page {data.page} of {data.totalPages}</span>
      <button className="btn ghost" disabled={data.page >= data.totalPages} onClick={() => onChange(data.page + 1)}>Next</button>
    </nav>
  );
}

export function Field({ label: text, children, hint }) {
  return (
    <label className="field">
      <span>{text}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export const PageHead = ({ title, sub, children }) => (
  <div className="page-head">
    <div><h1>{title}</h1>{sub && <p className="muted">{sub}</p>}</div>
    <div className="row">{children}</div>
  </div>
);

export function RestaurantCard({ r }) {
  return (
    <a className="rcard" href={`#/restaurants/${r._id}`}>
      <Img src={r.image} alt={r.name} className="rcard-img" fallback="🍛" />
      <div className="rcard-body">
        <div className="between">
          <h3>{r.name}</h3>
          <span className={`badge ${r.isOpen ? "st-delivered" : "st-cancelled"}`}>{r.isOpen ? "Open" : "Closed"}</span>
        </div>
        <p className="muted clamp">{r.description}</p>
        <p className="small">{r.city}{r.address ? `, ${r.address}` : ""}</p>
        <span className="link">View menu</span>
      </div>
    </a>
  );
}
