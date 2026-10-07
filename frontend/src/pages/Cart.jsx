import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Empty, Img, PageHead } from "../components/ui";
import { idOf, money } from "../utils/format";

export default function Cart() {
  const { cart, setQty, remove, clear } = useCart();
  const nav = useNavigate();
  if (!cart?.items?.length)
    return <div className="wrap section"><Empty text="Your cart is empty."><Link className="btn" to="/restaurants">Browse restaurants</Link></Empty></div>;

  return (
    <div className="wrap section">
      <PageHead title="Your cart" sub={cart.restaurant?.name ? `Ordering from ${cart.restaurant.name}` : ""}>
        <button className="btn ghost" onClick={() => window.confirm("Remove everything from your cart?") && clear()}>Clear cart</button>
      </PageHead>
      <div className="two-col">
        <div className="panel">
          {cart.items.map((i) => {
            const m = i.menuItem || {};
            const id = idOf(m);
            return (
              <div className="cart-row" key={id}>
                <Img src={m.image} alt={m.name} className="thumb" />
                <div className="grow"><b>{m.name}</b><div className="small">{money(i.price)} each</div></div>
                <div className="qty">
                  <button aria-label="Decrease quantity" onClick={() => setQty(id, i.quantity - 1)}>−</button>
                  <span>{i.quantity}</span>
                  <button aria-label="Increase quantity" onClick={() => setQty(id, i.quantity + 1)}>+</button>
                </div>
                <b className="line-total">{money(i.price * i.quantity)}</b>
                <button className="btn ghost sm" onClick={() => remove(id)}>Remove</button>
              </div>
            );
          })}
        </div>
        <Summary cart={cart}>
          <button className="btn full" onClick={() => nav("/checkout")}>Go to checkout</button>
        </Summary>
      </div>
    </div>
  );
}

export function Summary({ cart, children }) {
  return (
    <aside className="panel summary">
      <h2>Summary</h2>
      <div className="between"><span>Subtotal</span><span>{money(cart.subtotal)}</span></div>
      <div className="between"><span>Delivery fee</span><span>{money(cart.deliveryFee)}</span></div>
      <div className="between"><span>Discount</span><span>- {money(cart.discount)}</span></div>
      <div className="between total"><span>Total</span><span>{money(cart.total)}</span></div>
      <p className="small">Final amount is confirmed by the server when you place the order.</p>
      {children}
    </aside>
  );
}
