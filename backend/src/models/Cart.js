const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", default: null },
    items: [
      {
        _id: false,
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
        quantity: { type: Number, required: true, min: 1, max: 50 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

module.exports = mongoose.model("Cart", cartSchema);
