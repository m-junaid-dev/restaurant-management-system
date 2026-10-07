import { useState } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/admin.service";
import { useDebounce, useFetch } from "../../hooks/hooks";
import { useToast } from "../../context/ToastContext";
import { Async, PageHead, Pagination } from "../../components/ui";

export default function AdminRestaurants() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const s = useDebounce(search);
  const q = useFetch(() => adminService.restaurants({ page, limit: 10, search: s }), [page, s]);

  const toggle = async (r) => {
    try { await adminService.setRestaurantActive(r._id, !r.isActive); toast(r.isActive ? "Restaurant deactivated" : "Restaurant activated"); q.reload(); }
    catch (e) { toast(e.message, "error"); }
  };

  return (
    <>
      <PageHead title="Restaurants" />
      <div className="filters"><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search restaurants" aria-label="Search restaurants" /></div>
      <Async q={q} emptyText="No restaurants found.">
        {(d) => (
          <>
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Restaurant</th><th>Owner</th><th>City</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {d.items.map((r) => (
                  <tr key={r._id}>
                    <td data-label="Restaurant"><b>{r.name}</b></td>
                    <td data-label="Owner">{r.owner?.name || "-"}<div className="small">{r.owner?.email}</div></td>
                    <td data-label="City">{r.city}</td>
                    <td data-label="Status"><span className={`badge ${r.isActive ? "st-delivered" : "st-cancelled"}`}>{r.isActive ? "Active" : "Inactive"}</span></td>
                    <td data-label="Actions"><div className="row">
                      <Link className="btn ghost sm" to={`/restaurants/${r._id}`}>View</Link>
                      <Link className="btn ghost sm" to={`/restaurant-admin?restaurant=${r._id}`}>Manage</Link>
                      <button className={`btn sm ${r.isActive ? "danger" : ""}`} onClick={() => toggle(r)}>{r.isActive ? "Deactivate" : "Activate"}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <Pagination data={d} onChange={setPage} />
          </>
        )}
      </Async>
    </>
  );
}
