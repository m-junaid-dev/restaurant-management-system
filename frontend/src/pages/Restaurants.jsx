import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { restaurantService } from "../services/restaurant.service";
import { useFetch, useDebounce } from "../hooks/hooks";
import { Async, Pagination, PageHead, RestaurantCard } from "../components/ui";

export default function Restaurants() {
  const [sp] = useSearchParams();
  const [search, setSearch] = useState(sp.get("search") || "");
  const [city, setCity] = useState("");
  const [isOpen, setIsOpen] = useState("");
  const [page, setPage] = useState(1);
  const s = useDebounce(search), c = useDebounce(city);
  const q = useFetch(() => restaurantService.list({ page, limit: 9, search: s, city: c, isOpen, isActive: true }), [page, s, c, isOpen]);
  const reset = (fn) => (e) => { fn(e.target.value); setPage(1); };

  return (
    <div className="wrap section">
      <PageHead title="Restaurants" sub="Find a kitchen near you." />
      <div className="filters">
        <input value={search} onChange={reset(setSearch)} placeholder="Search by name" aria-label="Search restaurants" />
        <input value={city} onChange={reset(setCity)} placeholder="City, e.g. Karachi" aria-label="City" />
        <select value={isOpen} onChange={reset(setIsOpen)} aria-label="Open status">
          <option value="">Open and closed</option>
          <option value="true">Open now</option>
          <option value="false">Closed</option>
        </select>
      </div>
      <Async q={q} emptyText="No restaurants found. Try a different search.">
        {(d) => (
          <>
            <div className="grid">{d.items.map((r) => <RestaurantCard key={r._id} r={r} />)}</div>
            <Pagination data={d} onChange={setPage} />
          </>
        )}
      </Async>
    </div>
  );
}
