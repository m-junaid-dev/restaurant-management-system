import { useState } from "react";
import { useFetch } from "../hooks/hooks";
import { orderService } from "../services/order.service";
import { useToast } from "../context/ToastContext";
import { Async, Pagination, StatusBadge } from "./ui";
import { FLOW, NEXT_STATUS, dateTime, label, money } from "../utils/format";

export function Timeline({ status }) {
  if (status === "cancelled" || status === "rejected")
    return <div className="alert">This order was {status}.</div>;
  const at = FLOW.indexOf(status);
  return (
    <ol className="timeline">
      {FLOW.map((s, i) => (
        <li key={s} className={i < at ? "done" : i === at ? "now" : ""}><span>{label(s)}</span></li>
      ))}
    </ol>
  );
}

// Restaurant admin aur super admin dono ke orders table ke liye.
// fetcher(params) -> {items,page,totalPages}. manage=true ho to status buttons dikhte hain.
export function OrdersTable({ fetcher, manage = false, showRestaurant = false, deps = [] }) {
  const toast = useToast();
  const [f, setF] = useState({ status: "", date: "", search: "" });
  const [page, setPage] = useState(1);
  const q = useFetch(() => fetcher({ page, limit: 10, ...f }), [page, f, ...deps]);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1); };

  const change = async (id, status) => {
    try { await orderService.setStatus(id, status); toast(`Order marked ${label(status)}`); q.reload(); }
    catch (e) { toast(e.message, "error"); }
  };

  return (
    <>
      <div className="filters">
        <input value={f.search} onChange={set("search")} placeholder="Order number" aria-label="Order number" />
        <select value={f.status} onChange={set("status")} aria-label="Status">
          <option value="">All statuses</option>
          {[...FLOW, "cancelled", "rejected"].map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <input type="date" value={f.date} onChange={set("date")} aria-label="Date" />
      </div>
      <Async q={q} emptyText="No orders match these filters.">
        {(d) => (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Order</th><th>Customer</th>{showRestaurant && <th>Restaurant</th>}<th>Placed</th><th>Total</th><th>Status</th>{manage && <th>Update</th>}</tr></thead>
                <tbody>
                  {d.items.map((o) => (
                    <tr key={o._id}>
                      <td data-label="Order"><b>{o.orderNumber}</b><div className="small">{o.items?.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</div></td>
                      <td data-label="Customer">{o.user?.name || "-"}<div className="small">{o.phone}</div></td>
                      {showRestaurant && <td data-label="Restaurant">{o.restaurant?.name || "-"}</td>}
                      <td data-label="Placed">{dateTime(o.createdAt)}</td>
                      <td data-label="Total">{money(o.total)}<div className="small">{label(o.paymentStatus)}</div></td>
                      <td data-label="Status"><StatusBadge status={o.orderStatus} /></td>
                      {manage && (
                        <td data-label="Update">
                          {NEXT_STATUS[o.orderStatus]
                            ? <div className="row">{NEXT_STATUS[o.orderStatus].map((s) => (
                                <button key={s} className={`btn sm ${["rejected", "cancelled"].includes(s) ? "danger" : ""}`} onClick={() => change(o._id, s)}>{label(s)}</button>
                              ))}</div>
                            : <span className="small">Final</span>}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination data={d} onChange={setPage} />
          </>
        )}
      </Async>
    </>
  );
}
