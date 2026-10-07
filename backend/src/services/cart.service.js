const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");
const { ApiError } = require("../utils/helpers");
const { calculate } = require("./pricing.service");

const present = (id) =>
  Cart.findById(id).populate("restaurant", "name").populate("items.menuItem", "name image isAvailable");

async function findOrCreate(userId) {
  return (await Cart.findOne({ user: userId })) || Cart.create({ user: userId });
}

// Cart ki prices database se dobara match karta hai (agar menu price badal gayi ho)
async function sync(cart) {
  if (cart.items.length) {
    const menu = await MenuItem.find({ _id: { $in: cart.items.map((i) => i.menuItem) } });
    const map = new Map(menu.map((m) => [String(m._id), m]));
    cart.items = cart.items.filter((i) => map.has(String(i.menuItem)));
    cart.items.forEach((i) => { i.price = map.get(String(i.menuItem)).effectivePrice(); });
  }
  if (!cart.items.length) cart.restaurant = null;
  Object.assign(cart, calculate(cart.items));
  await cart.save();
}

exports.get = async (userId) => {
  const cart = await findOrCreate(userId);
  await sync(cart);
  return present(cart._id);
};

exports.add = async (userId, menuItemId, quantity) => {
  const item = await MenuItem.findById(menuItemId).populate("restaurant", "isActive");
  if (!item) throw new ApiError(404, "Menu item not found");
  if (!item.restaurant?.isActive) throw new ApiError(400, "This restaurant is not accepting orders.");
  if (!item.isAvailable) throw new ApiError(400, `${item.name} is currently unavailable.`);

  const cart = await findOrCreate(userId);
  if (cart.items.length && String(cart.restaurant) !== String(item.restaurant._id))
    throw new ApiError(409, "Your cart contains items from another restaurant. Clear the cart first.");

  cart.restaurant = item.restaurant._id;
  const line = cart.items.find((i) => String(i.menuItem) === String(item._id));
  if (line) {
    if (line.quantity + quantity > 50) throw new ApiError(400, "You can order at most 50 of one item.");
    line.quantity += quantity;
  } else cart.items.push({ menuItem: item._id, quantity, price: item.effectivePrice() });
  await sync(cart);
  return present(cart._id);
};

exports.setQuantity = async (userId, menuItemId, quantity) => {
  const cart = await findOrCreate(userId);
  const line = cart.items.find((i) => String(i.menuItem) === String(menuItemId));
  if (!line) throw new ApiError(404, "Item is not in your cart");
  line.quantity = quantity;
  await sync(cart);
  return present(cart._id);
};

exports.remove = async (userId, menuItemId) => {
  const cart = await findOrCreate(userId);
  if (!cart.items.some((i) => String(i.menuItem) === String(menuItemId))) throw new ApiError(404, "Item is not in your cart");
  cart.items = cart.items.filter((i) => String(i.menuItem) !== String(menuItemId));
  await sync(cart);
  return present(cart._id);
};

exports.clear = async (userId) => {
  const cart = await findOrCreate(userId);
  cart.items = [];
  await sync(cart);
  return present(cart._id);
};
