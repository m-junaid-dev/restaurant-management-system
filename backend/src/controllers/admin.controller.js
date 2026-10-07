const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const orderService = require("../services/order.service");
const { ApiError, asyncHandler, send, escapeRegex, paginate, dayRange } = require("../utils/helpers");

exports.dashboard = asyncHandler(async (req, res) => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const [totalUsers, totalRestaurants, totalOrders, revenue, todayOrders, pendingOrders, completedOrders] = await Promise.all([
    User.countDocuments(), Restaurant.countDocuments(), Order.countDocuments(),
    Order.aggregate([{ $match: { orderStatus: "delivered" } }, { $group: { _id: null, sum: { $sum: "$total" } } }]),
    Order.countDocuments({ createdAt: { $gte: start } }),
    Order.countDocuments({ orderStatus: "pending" }),
    Order.countDocuments({ orderStatus: "delivered" }),
  ]);
  send(res, 200, "Dashboard fetched successfully", {
    totalUsers, totalRestaurants, totalOrders, totalRevenue: revenue[0]?.sum || 0, todayOrders, pendingOrders, completedOrders,
  });
});

exports.users = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) {
    const rx = { $regex: escapeRegex(req.query.search), $options: "i" };
    filter.$or = [{ name: rx }, { email: rx }];
  }
  if (req.query.role) filter.role = req.query.role;
  send(res, 200, "Users fetched successfully", await paginate(User, filter, req.query));
});

exports.blockUser = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.userId);
  if (!u) throw new ApiError(404, "User not found");
  if (u.role === "super_admin") throw new ApiError(403, "A super admin cannot be blocked.");
  u.isBlocked = req.body.isBlocked;
  await u.save();
  send(res, 200, u.isBlocked ? "User blocked" : "User unblocked", u);
});

exports.restaurants = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) filter.name = { $regex: escapeRegex(req.query.search), $options: "i" };
  send(res, 200, "Restaurants fetched successfully",
    await paginate(Restaurant, filter, req.query, { populate: [{ path: "owner", select: "name email" }] }));
});

exports.setRestaurantStatus = asyncHandler(async (req, res) => {
  const r = await Restaurant.findById(req.params.restaurantId);
  if (!r) throw new ApiError(404, "Restaurant not found");
  r.isActive = req.body.isActive;
  await r.save();
  send(res, 200, r.isActive ? "Restaurant activated" : "Restaurant deactivated", r);
});

exports.orders = asyncHandler(async (req, res) => {
  const { status, date, search } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (date && dayRange(date)) filter.createdAt = dayRange(date);
  if (search) filter.orderNumber = { $regex: escapeRegex(search), $options: "i" };
  send(res, 200, "Orders fetched successfully", await paginate(Order, filter, req.query, { populate: orderService.POPULATE }));
});
