import { adminService } from "../../services/admin.service";
import { useFetch } from "../../hooks/hooks";
import { Async, PageHead } from "../../components/ui";
import { money } from "../../utils/format";

export default function AdminDashboard() {
  const q = useFetch(() => adminService.dashboard());
  return (
    <>
      <PageHead title="Overview" />
      <Async q={{ ...q, data: q.data && { items: [q.data] } }}>
        {() => {
          const d = q.data;
          const rows = [
            ["Total users", d.totalUsers], ["Total restaurants", d.totalRestaurants], ["Total orders", d.totalOrders],
            ["Total revenue", money(d.totalRevenue)], ["Today's orders", d.todayOrders], ["Pending orders", d.pendingOrders], ["Completed orders", d.completedOrders],
          ];
          return <div className="stats">{rows.map(([k, v]) => <div className="stat" key={k}><b>{v ?? 0}</b><span>{k}</span></div>)}</div>;
        }}
      </Async>
    </>
  );
}
