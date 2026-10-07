import { useState } from "react";
import { Link } from "react-router-dom";
import { orderService } from "../../services/order.service";
import { useFetch } from "../../hooks/hooks";
import { useToast } from "../../context/ToastContext";
import { Async, Empty, PageHead, Pagination, StatusBadge } from "../../components/ui";
import { dateTime, money } from "../../utils/format";

export default function Orders() {
  const [page, setPage] = useState(1);
  const q = useFetch(() => orderService.mine({ page, limit: 8 }), [page]);
  const toast = useToast();
  const cancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try { await orderService.cancel(id); toast("Order cancelled"); q.reload(); } catch (e) { toast(e.message, "error"); }
  };
  return (
    <>
      <PageHead title="My orders" />
      <Async q={q} empty={<Empty text="You have not placed any orders yet."><Link className="btn" to="/restaurants">Find something to eat</Link></Empty>}>
        {(d) => (
          <>
            {d.items.map((o) => (
              <div className="panel order-card" key={o._id}>
                <div className="between">
                  <div><b>{o.orderNumber}</b> <span className="muted">from {o.restaurant?.name}</span></div>
                  <StatusBadge status={o.orderStatus} />
                </div>
                <p className="small">{dateTime(o.createdAt)} · Payment {o.paymentStatus}</p>
                <p>{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</p>
                <div className="between">
                  <b>{money(o.total)}</b>
                  <div className="row">
                    <Link className="btn ghost sm" to={`/customer/orders/${o._id}`}>View order</Link>
                    {["pending", "confirmed"].includes(o.orderStatus) && <button className="btn danger sm" onClick={() => cancel(o._id)}>Cancel</button>}
                  </div>
                </div>
              </div>
            ))}
            <Pagination data={d} onChange={setPage} />
          </>
        )}
      </Async>
    </>
  );
}
