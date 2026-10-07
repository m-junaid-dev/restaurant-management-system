const cartService = require("../services/cart.service");
const { asyncHandler, send } = require("../utils/helpers");

exports.get = asyncHandler(async (req, res) => send(res, 200, "Cart fetched successfully", await cartService.get(req.user._id)));
exports.add = asyncHandler(async (req, res) =>
  send(res, 200, "Item added to cart", await cartService.add(req.user._id, req.body.menuItemId, req.body.quantity)));
exports.update = asyncHandler(async (req, res) =>
  send(res, 200, "Cart updated", await cartService.setQuantity(req.user._id, req.params.menuItemId, req.body.quantity)));
exports.remove = asyncHandler(async (req, res) =>
  send(res, 200, "Item removed from cart", await cartService.remove(req.user._id, req.params.menuItemId)));
exports.clear = asyncHandler(async (req, res) => send(res, 200, "Cart cleared", await cartService.clear(req.user._id)));
