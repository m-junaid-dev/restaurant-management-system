import { Link, useParams } from "react-router-dom";
import { orderService } from "../../services/order.service";
import { useFetch } from "../../hooks/hooks";
import { useToast } from "../../context/ToastContext";
import { Async, PageHead, StatusBadge } from "../../components/ui";
import { Timeline } from "../../components/OrderParts";
import { addressText, dateTime, label, money } from "../../utils/format";

export default function OrderDetails() {
  const { orderId } = useParams();
  const q = useFetch(() => orderService.get(orderId), [orderId]);
  const toast = useToast();
  const cancel = async () => {
    if (!window.confirm("Cancel this order?")) return;
    try { await orderService.cancel(orderId); toast("Order cancelled"); q.reload(); } catch (e) { toast(e.message, "error"); }
  };
  return (
    <Async q={q}>
      {(o) => (
        <>
          <PageHead title={`Order ${o.orderNumber}`} sub={`${o.restaurant?.name} · ${dateTime(o.createdAt)}`}>
            <StatusBadge status={o.orderStatus} />
            {["pending", "confirmed"].includes(o.orderStatus) && <button className="btn danger sm" onClick={cancel}>Cancel order</button>}
          </PageHead>
          <div className="panel"><Timeline status={o.orderStatus} /></div>
          <div className="panel">
            <h2>Items</h2>
            <ul className="plain">{o.items.map((i, n) => <li key={n} className="between"><span>{i.quantity} × {i.name} <span className="small">({money(i.price)} each)</span></span><span>{money(i.subtotal)}</span></li>)}</ul>
            <div className="between"><span>Subtotal</span><span>{money(o.subtotal)}</span></div>
            <div className="between"><span>Delivery fee</span><span>{money(o.deliveryFee)}</span></div>
            <div className="between"><span>Discount</span><span>- {money(o.discount)}</span></div>
            <div className="between total"><span>Total</span><span>{money(o.total)}</span></div>
          </div>
          <div className="panel">
            <p><b>Deliver to:</b> {addressText(o.deliveryAddress)}</p>
            <p><b>Phone:</b> {o.phone}</p>
            <p><b>Payment:</b> {label(o.paymentMethod)} ({label(o.paymentStatus)})</p>
            {o.notes && <p><b>Notes:</b> {o.notes}</p>}
          </div>
          <Link className="link" to="/customer/orders">Back to my orders</Link>
        </>
      )}
    </Async>
  );
}
