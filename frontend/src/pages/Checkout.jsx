import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/order.service";
import { useForm } from "../hooks/hooks";
import { Empty, Field } from "../components/ui";
import { Summary } from "./Cart";
import { money } from "../utils/format";

export default function Checkout() {
  const { cart, reset } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const { bind, values } = useForm({ address: "", city: "", postalCode: "", phone: user?.phone || "", notes: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (!cart?.items?.length)
    return <div className="wrap section"><Empty text="Your cart is empty."><Link className="btn" to="/restaurants">Browse restaurants</Link></Empty></div>;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (values.address.trim().length < 5) return setErr("Enter your full delivery address.");
    if (!values.city.trim()) return setErr("Enter your city.");
    if (!values.phone.trim()) return setErr("Enter a phone number we can call.");
    setBusy(true);
    try {
      // Sirf delivery details bheji jati hain. Prices backend khud nikalta hai.
      const order = await orderService.create({
        deliveryAddress: { address: values.address, city: values.city, postalCode: values.postalCode },
        phone: values.phone,
        paymentMethod: "cash_on_delivery",
        notes: values.notes,
      });
      reset();
      nav(`/order-success/${order._id}`, { replace: true });
    } catch (e2) { setErr(e2.message); setBusy(false); }
  };

  return (
    <div className="wrap section">
      <h1>Checkout</h1>
      <div className="two-col">
        <form className="panel" onSubmit={submit} noValidate>
          {err && <div className="alert" role="alert">{err}</div>}
          <Field label="Delivery address"><input autoComplete="street-address" {...bind("address")} /></Field>
          <div className="row2">
            <Field label="City"><input {...bind("city")} /></Field>
            <Field label="Postal code"><input {...bind("postalCode")} /></Field>
          </div>
          <Field label="Phone"><input type="tel" {...bind("phone")} /></Field>
          <Field label="Payment method"><select disabled value="cash_on_delivery"><option value="cash_on_delivery">Cash on delivery</option></select></Field>
          <Field label="Notes for the restaurant (optional)"><textarea rows="3" {...bind("notes")} /></Field>
          <button className="btn full" disabled={busy}>{busy ? "Placing order..." : "Place order"}</button>
        </form>
        <Summary cart={cart}>
          <ul className="plain">
            {cart.items.map((i) => <li key={i.menuItem?._id} className="between small"><span>{i.quantity} × {i.menuItem?.name}</span><span>{money(i.price * i.quantity)}</span></li>)}
          </ul>
        </Summary>
      </div>
    </div>
  );
}
