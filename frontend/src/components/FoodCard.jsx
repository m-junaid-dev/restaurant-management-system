import { Img } from "./ui";
import { useCart } from "../context/CartContext";
import { money } from "../utils/format";

export default function FoodCard({ item, restaurantId }) {
  const { add } = useCart();
  const hasDiscount = item.discountPrice && item.discountPrice < item.price;
  return (
    <article className={`food ${item.isAvailable ? "" : "off"}`}>
      <Img src={item.image} alt={item.name} className="food-img" />
      <div className="food-body">
        <h3>{item.name}</h3>
        <p className="muted clamp">{item.description}</p>
        {item.ingredients?.length > 0 && <p className="small">Ingredients: {item.ingredients.join(", ")}</p>}
        <p className="small">{item.preparationTime ? `${item.preparationTime} min prep` : ""}</p>
        <div className="between">
          <div className="price">
            {hasDiscount ? <><b>{money(item.discountPrice)}</b> <s>{money(item.price)}</s></> : <b>{money(item.price)}</b>}
          </div>
          <button className="btn" disabled={!item.isAvailable} onClick={() => add(item, restaurantId)}>
            {item.isAvailable ? "Add to cart" : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  );
}
