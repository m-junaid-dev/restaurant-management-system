import { useState } from "react";
import { useParams } from "react-router-dom";
import { restaurantService, categoryService, menuService } from "../services/restaurant.service";
import { useFetch, useDebounce } from "../hooks/hooks";
import { Async, ErrorBox, Img, Loading, Pagination } from "../components/ui";
import FoodCard from "../components/FoodCard";

export default function RestaurantDetails() {
  const { restaurantId: id } = useParams();
  const info = useFetch(() => restaurantService.get(id), [id]);
  const cats = useFetch(() => categoryService.list(id), [id]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMin] = useState("");
  const [maxPrice, setMax] = useState("");
  const [availability, setAvail] = useState("");
  const [page, setPage] = useState(1);
  const s = useDebounce(search), lo = useDebounce(minPrice), hi = useDebounce(maxPrice);
  const menu = useFetch(
    () => menuService.list(id, { page, limit: 12, search: s, category, minPrice: lo, maxPrice: hi, availability }),
    [id, page, s, category, lo, hi, availability]
  );
  const f = (fn) => (e) => { fn(e.target.value); setPage(1); };

  if (info.loading) return <Loading />;
  if (info.error) return <div className="wrap section"><ErrorBox message={info.error} onRetry={info.reload} /></div>;
  const r = info.data;
  const categories = Array.isArray(cats.data) ? cats.data : cats.data?.items || [];

  return (
    <div className="wrap section">
      <div className="r-head">
        <Img src={r.image} alt={r.name} className="r-cover" fallback="🍛" />
        <div>
          <h1>{r.name}</h1>
          <p className="muted">{r.description}</p>
          <p>{[r.address, r.city].filter(Boolean).join(", ")}</p>
          <p className="small">Open {r.openingTime} to {r.closingTime}</p>
          <span className={`badge ${r.isOpen ? "st-delivered" : "st-cancelled"}`}>{r.isOpen ? "Open now" : "Closed"}</span>
        </div>
      </div>

      <div className="chips tabs" role="tablist">
        <button className={!category ? "on" : ""} onClick={() => { setCategory(""); setPage(1); }}>All</button>
        {categories.map((c) => (
          <button key={c._id} className={category === c._id ? "on" : ""} onClick={() => { setCategory(c._id); setPage(1); }}>{c.name}</button>
        ))}
      </div>

      <div className="filters">
        <input value={search} onChange={f(setSearch)} placeholder="Search the menu" aria-label="Search menu" />
        <input type="number" min="0" value={minPrice} onChange={f(setMin)} placeholder="Min price" aria-label="Minimum price" />
        <input type="number" min="0" value={maxPrice} onChange={f(setMax)} placeholder="Max price" aria-label="Maximum price" />
        <select value={availability} onChange={f(setAvail)} aria-label="Availability">
          <option value="">All items</option>
          <option value="true">Available only</option>
        </select>
      </div>

      <Async q={menu} emptyText="No dishes match your filters.">
        {(d) => (
          <>
            <div className="grid">{d.items.map((m) => <FoodCard key={m._id} item={m} restaurantId={id} />)}</div>
            <Pagination data={d} onChange={setPage} />
          </>
        )}
      </Async>
    </div>
  );
}
