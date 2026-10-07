const env = require("../config/env");
const { round2 } = require("../utils/helpers");

// Subtotal + delivery fee - discount = total. Ye sab sirf server par nikalta hai.
exports.calculate = (lines) => {
  const subtotal = round2(lines.reduce((sum, l) => sum + l.price * l.quantity, 0));
  const deliveryFee = subtotal === 0 || subtotal >= env.freeDeliveryAbove ? 0 : env.deliveryFee;
  const discount = 0; // coupons baad mein
  return { subtotal, deliveryFee, discount, total: round2(subtotal + deliveryFee - discount) };
};
