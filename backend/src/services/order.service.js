const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const { ApiError } = require("../utils/helpers");
const { calculate } = require("./pricing.service");

// Kaun sa status kahan se kahan ja sakta hai
const TRANSITIONS = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
  rejected: [],
};
exports.TRANSITIONS = TRANSITIONS;
exports.canTransition = (from, to) => (TRANSITIONS[from] || []).includes(to);
exports.CUSTOMER_CANCELLABLE = ["pending", "confirmed"];

const POPULATE = [{ path: "restaurant", select: "name city address phone" }, { path: "user", select: "name email phone" }];
exports.POPULATE = POPULATE;

const makeOrderNumber = () => `ORD-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, "0")}`;

exports.place = async (user, body) => {
  const cart = await Cart.findOne({ user: user._id });
  if (!cart || !cart.items.length) throw new ApiError(400, "Your cart is empty.");

  const restaurant = await Restaurant.findById(cart.restaurant);
  if (!restaurant || !restaurant.isActive) throw new ApiError(400, "This restaurant is not accepting orders.");
  if (!restaurant.isOpen) throw new ApiError(400, `${restaurant.name} is closed right now.`);

  // Frontend ki koi price nahi maani jati. Sab kuch DB se dobara
  const menu = await MenuItem.find({ _id: { $in: cart.items.map((i) => i.menuItem) } });
  const map = new Map(menu.map((m) => [String(m._id), m]));
  const lines = cart.items.map((i) => {
    const m = map.get(String(i.menuItem));
    if (!m || String(m.restaurant) !== String(restaurant._id))
      throw new ApiError(400, "An item in your cart is no longer on the menu. Please review your cart.");
    if (!m.isAvailable) throw new ApiError(400, `${m.name} is no longer available. Please remove it from your cart.`);
    const price = m.effectivePrice();
    return { menuItem: m._id, name: m.name, price, quantity: i.quantity, subtotal: price * i.quantity };
  });
  const totals = calculate(lines);

  const order = await Order.create({
    orderNumber: makeOrderNumber(),
    user: user._id,
    restaurant: restaurant._id,
    items: lines,
    deliveryAddress: body.deliveryAddress,
    phone: body.phone,
    paymentMethod: body.paymentMethod,
    notes: body.notes || "",
    ...totals,
  });

  cart.items = [];
  cart.restaurant = null;
  Object.assign(cart, calculate([]));
  await cart.save();

  return Order.findById(order._id).populate(POPULATE);
};
