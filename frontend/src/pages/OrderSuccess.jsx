import { Link, useParams } from "react-router-dom";
import { orderService } from "../services/order.service";
import { useFetch } from "../hooks/hooks";
import { Async, StatusBadge } from "../components/ui";
import { addressText, label, money } from "../utils/format";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const q = useFetch(() => orderService.get(orderId), [orderId]);
  return (
    <div className="wrap narrow section">
      <Async q={q}>
        {(o) => (
          <div className="panel">
            <h1>Order placed</h1>
            <p>Your order number is <b>{o.orderNumber}</b>.</p>
            <p>From <b>{o.restaurant?.name}</b></p>
            <ul className="plain">
              {o.items.map((i, n) => <li key={n} className="between"><span>{i.quantity} × {i.name}</span><span>{money(i.subtotal)}</span></li>)}
            </ul>
            <div className="between total"><span>Total</span><span>{money(o.total)}</span></div>
            <p className="small">Payment: {label(o.paymentMethod)} ({label(o.paymentStatus)})</p>
            <p className="small">Deliver to: {addressText(o.deliveryAddress)}</p>
            <p>Status: <StatusBadge status={o.orderStatus} /></p>
            <div className="row">
              <Link className="btn" to={`/customer/orders/${o._id}`}>Track order</Link>
              <Link className="btn ghost" to="/restaurants">Order more</Link>
            </div>
          </div>
        )}
      </Async>
    </div>
  );
}
