const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    discountPrice: {
      type: Number,
      min: 0,
      validate: { validator(v) { return v == null || v < this.price; }, message: "discountPrice must be lower than price" },
    },
    image: { type: String, default: "" },
    ingredients: { type: [String], default: [] },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number, min: 1, default: 15 },
  },
  { timestamps: true }
);

// Customer se jo price lete hain wo hamesha yehi hai
menuItemSchema.methods.effectivePrice = function () {
  return this.discountPrice != null && this.discountPrice < this.price ? this.discountPrice : this.price;
};

module.exports = mongoose.model("MenuItem", menuItemSchema);
