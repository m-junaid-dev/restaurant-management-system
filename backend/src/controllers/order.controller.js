const Order = require("../models/Order");
const access = require("../services/access.service");
const orderService = require("../services/order.service");
const { ApiError, asyncHandler, send, paginate } = require("../utils/helpers");

exports.create = asyncHandler(async (req, res) =>
  send(res, 201, "Order placed successfully", await orderService.place(req.user, req.body)));

exports.mine = asyncHandler(async (req, res) =>
  send(res, 200, "Orders fetched successfully",
    await paginate(Order, { user: req.user._id }, req.query, { populate: [{ path: "restaurant", select: "name" }] })));

const load = async (id) => {
  const o = await Order.findById(id).populate(orderService.POPULATE);
  if (!o) throw new ApiError(404, "Order not found");
  return o;
};

// Customer sirf apna order dekh sakta hai, restaurant admin sirf apne restaurant ka
const canView = async (user, order) => {
  if (user.role === "super_admin" || access.sameId(order.user, user._id)) return true;
  const r = await access.getRestaurant(order.restaurant._id);
  return access.canManage(user, r);
};

exports.get = asyncHandler(async (req, res) => {
  const o = await load(req.params.orderId);
  if (!(await canView(req.user, o))) throw new ApiError(403, "You cannot view this order.");
  send(res, 200, "Order fetched successfully", o);
});

exports.cancel = asyncHandler(async (req, res) => {
  const o = await load(req.params.orderId);
  if (!access.sameId(o.user, req.user._id)) throw new ApiError(403, "You can only cancel your own orders.");
  if (!orderService.CUSTOMER_CANCELLABLE.includes(o.orderStatus))
    throw new ApiError(400, `An order that is ${o.orderStatus.replaceAll("_", " ")} can no longer be cancelled.`);
  o.orderStatus = "cancelled";
  await o.save();
  send(res, 200, "Order cancelled successfully", o);
});

exports.setStatus = asyncHandler(async (req, res) => {
  const o = await load(req.params.orderId);
  const r = await access.getRestaurant(o.restaurant._id);
  access.assertManage(req.user, r);
  const next = req.body.orderStatus;
  if (!orderService.canTransition(o.orderStatus, next))
    throw new ApiError(400, `Cannot change an order from ${o.orderStatus.replaceAll("_", " ")} to ${next.replaceAll("_", " ")}.`);
  o.orderStatus = next;
  if (next === "delivered") o.paymentStatus = "paid"; // cash on delivery: delivery par paisa mil gaya
  await o.save();
  send(res, 200, "Order status updated successfully", o);
});
