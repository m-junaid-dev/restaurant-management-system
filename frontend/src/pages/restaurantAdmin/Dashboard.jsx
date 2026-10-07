import { restaurantService } from "../../services/restaurant.service";
import { useFetch } from "../../hooks/hooks";
import { useMyRestaurant } from "../../hooks/useMyRestaurant";
import { Async, PageHead, StatusBadge } from "../../components/ui";
import { dateTime, money } from "../../utils/format";
import Gate from "./Gate";

function Stats({ r }) {
  const q = useFetch(() => restaurantService.orders(r._id, { limit: 5 }), [r._id]);
  return (
    <>
      <PageHead title={r.name} sub="Today at a glance">
        <span className={`badge ${r.isOpen ? "st-delivered" : "st-cancelled"}`}>{r.isOpen ? "Open" : "Closed"}</span>
      </PageHead>
      <Async q={q} emptyText="No orders yet. They will show up here as customers order.">
        {(d) => (
          <>
            <div className="stats">
              {[["Total orders", d.stats?.total], ["Pending", d.stats?.pending], ["Preparing", d.stats?.preparing], ["Completed", d.stats?.completed]].map(([k, v]) => (
                <div className="stat" key={k}><b>{v ?? 0}</b><span>{k}</span></div>
              ))}
            </div>
            <h2>Recent orders</h2>
            {d.items.map((o) => (
              <div key={o._id} className="panel between">
                <span><b>{o.orderNumber}</b> <span className="small">{dateTime(o.createdAt)}</span></span>
                <span>{money(o.total)}</span>
                <StatusBadge status={o.orderStatus} />
              </div>
            ))}
          </>
        )}
      </Async>
    </>
  );
}

export default function Dashboard() {
  const mine = useMyRestaurant();
  return <Gate mine={mine}>{(r) => <Stats r={r} />}</Gate>;
}
