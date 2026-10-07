import { restaurantService } from "../../services/restaurant.service";
import { useMyRestaurant } from "../../hooks/useMyRestaurant";
import { OrdersTable } from "../../components/OrderParts";
import { PageHead } from "../../components/ui";
import Gate from "./Gate";

export default function RestaurantOrders() {
  const mine = useMyRestaurant();
  return (
    <Gate mine={mine}>
      {(r) => (
        <>
          <PageHead title="Orders" sub="Move each order forward as you prepare it." />
          <OrdersTable manage fetcher={(p) => restaurantService.orders(r._id, p)} deps={[r._id]} />
        </>
      )}
    </Gate>
  );
}
