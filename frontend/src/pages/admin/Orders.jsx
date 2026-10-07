import { adminService } from "../../services/admin.service";
import { OrdersTable } from "../../components/OrderParts";
import { PageHead } from "../../components/ui";

export default function AdminOrders() {
  return (
    <>
      <PageHead title="All orders" />
      <OrdersTable showRestaurant fetcher={(p) => adminService.orders(p)} />
    </>
  );
}
