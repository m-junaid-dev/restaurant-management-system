const Restaurant = require("../models/Restaurant");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const access = require("../services/access.service");
const orderService = require("../services/order.service");
const { ApiError, asyncHandler, send, escapeRegex, parseBool, paginate, dayRange } = require("../utils/helpers");

/* ---------- restaurants ---------- */
exports.list = asyncHandler(async (req, res) => {
  const { search, city, isOpen, isActive, owner } = req.query;
  const filter = {};
  if (owner === "me") {
    if (!req.user) throw new ApiError(401, "Please log in to continue.");
    filter.owner = req.user._id;
  } else if (req.user?.role === "super_admin") {
    const a = parseBool(isActive);
    if (a !== undefined) filter.isActive = a;
  } else filter.isActive = true;
  if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };
  if (city) filter.city = { $regex: `^${escapeRegex(city)}`, $options: "i" };
  const open = parseBool(isOpen);
  if (open !== undefined) filter.isOpen = open;
  send(res, 200, "Restaurants fetched successfully", await paginate(Restaurant, filter, req.query));
});

exports.get = asyncHandler(async (req, res) => {
  const r = await access.getRestaurant(req.params.restaurantId);
  access.assertVisible(req.user, r);
  send(res, 200, "Restaurant fetched successfully", r);
});

exports.create = asyncHandler(async (req, res) => {
  const r = await Restaurant.create({ ...req.body, owner: req.user._id });
  send(res, 201, "Restaurant created successfully", r);
});

exports.update = asyncHandler(async (req, res) => {
  const r = await access.getRestaurant(req.params.restaurantId);
  access.assertManage(req.user, r);
  r.set(req.body); // owner/isActive body se nahi aate (Joi unko hata deta hai)
  await r.save();
  send(res, 200, "Restaurant updated successfully", r);
});

// Delete = deactivate (orders ki history bachi rehti hai)
exports.remove = asyncHandler(async (req, res) => {
  const r = await access.getRestaurant(req.params.restaurantId);
  access.assertManage(req.user, r);
  r.isActive = false;
  await r.save();
  send(res, 200, "Restaurant deactivated successfully", r);
});

/* ---------- categories ---------- */
exports.listCategories = asyncHandler(async (req, res) => {
  const r = await access.getRestaurant(req.params.restaurantId);
  access.assertVisible(req.user, r);
  const filter = { restaurant: r._id };
  if (!access.canManage(req.user, r)) filter.isActive = true;
  send(res, 200, "Categories fetched successfully", await Category.find(filter).sort({ sortOrder: 1, name: 1 }));
});

exports.createCategory = asyncHandler(async (req, res) => {
  const r = await access.getRestaurant(req.params.restaurantId);
  access.assertManage(req.user, r);
  send(res, 201, "Category created successfully", await Category.create({ ...req.body, restaurant: r._id }));
});

const loadCategory = async (req) => {
  const c = await Category.findById(req.params.categoryId);
  if (!c) throw new ApiError(404, "Category not found");
  const r = await access.getRestaurant(c.restaurant);
  return { c, r };
};

exports.getCategory = asyncHandler(async (req, res) => {
  const { c, r } = await loadCategory(req);
  if (!c.isActive && !access.canManage(req.user, r)) throw new ApiError(404, "Category not found");
  send(res, 200, "Category fetched successfully", c);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { c, r } = await loadCategory(req);
  access.assertManage(req.user, r);
  c.set(req.body);
  await c.save();
  send(res, 200, "Category updated successfully", c);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const { c, r } = await loadCategory(req);
  access.assertManage(req.user, r);
  if (await MenuItem.exists({ category: c._id }))
    throw new ApiError(409, "This category still has menu items. Move or delete them first.");
  await c.deleteOne();
  send(res, 200, "Category deleted successfully");
});

/* ---------- menu ---------- */
exports.listMenu = asyncHandler(async (req, res) => {
  const r = await access.getRestaurant(req.params.restaurantId);
  access.assertVisible(req.user, r);
  const { category, search, minPrice, maxPrice, availability } = req.query;
  const filter = { restaurant: r._id };
  if (category) filter.category = category;
  if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice !== undefined && minPrice !== "" && !isNaN(minPrice)) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== "" && !isNaN(maxPrice)) filter.price.$lte = Number(maxPrice);
    if (!Object.keys(filter.price).length) delete filter.price;
  }
  if (parseBool(availability) === true) filter.isAvailable = true;
  send(res, 200, "Menu fetched successfully",
    await paginate(MenuItem, filter, req.query, { sort: { createdAt: 1 }, populate: [{ path: "category", select: "name" }] }));
});

const ensureCategory = async (categoryId, restaurantId) => {
  const c = await Category.findById(categoryId);
  if (!c || String(c.restaurant) !== String(restaurantId)) throw new ApiError(400, "Category does not belong to this restaurant.");
};

exports.createMenuItem = asyncHandler(async (req, res) => {
  const r = await access.getRestaurant(req.params.restaurantId);
  access.assertManage(req.user, r);
  await ensureCategory(req.body.category, r._id);
  send(res, 201, "Menu item created successfully", await MenuItem.create({ ...req.body, restaurant: r._id }));
});

const loadItem = async (req) => {
  const m = await MenuItem.findById(req.params.menuItemId);
  if (!m) throw new ApiError(404, "Menu item not found");
  return { m, r: await access.getRestaurant(m.restaurant) };
};

exports.getMenuItem = asyncHandler(async (req, res) => {
  const { m, r } = await loadItem(req);
  access.assertVisible(req.user, r);
  send(res, 200, "Menu item fetched successfully", await m.populate("category", "name"));
});

exports.updateMenuItem = asyncHandler(async (req, res) => {
  const { m, r } = await loadItem(req);
  access.assertManage(req.user, r);
  if (req.body.category) await ensureCategory(req.body.category, r._id);
  m.set(req.body);
  await m.save();
  send(res, 200, "Menu item updated successfully", m);
});

exports.deleteMenuItem = asyncHandler(async (req, res) => {
  const { m, r } = await loadItem(req);
  access.assertManage(req.user, r);
  await m.deleteOne(); // purane orders mein naam/price ka snapshot hai, wo safe rehte hain
  send(res, 200, "Menu item deleted successfully");
});

exports.setAvailability = asyncHandler(async (req, res) => {
  const { m, r } = await loadItem(req);
  access.assertManage(req.user, r);
  m.isAvailable = req.body.isAvailable;
  await m.save();
  send(res, 200, "Availability updated successfully", m);
});

/* ---------- restaurant orders ---------- */
exports.listOrders = asyncHandler(async (req, res) => {
  const r = await access.getRestaurant(req.params.restaurantId);
  access.assertManage(req.user, r);
  const { status, date, search } = req.query;
  const filter = { restaurant: r._id };
  if (status) filter.orderStatus = status;
  if (date && dayRange(date)) filter.createdAt = dayRange(date);
  if (search) filter.orderNumber = { $regex: escapeRegex(search), $options: "i" };
  const data = await paginate(Order, filter, req.query, { populate: [{ path: "user", select: "name phone" }] });
  const count = (s) => Order.countDocuments({ restaurant: r._id, orderStatus: s });
  const [total, pending, preparing, completed] = await Promise.all([Order.countDocuments({ restaurant: r._id }), count("pending"), count("preparing"), count("delivered")]);
  send(res, 200, "Orders fetched successfully", { ...data, stats: { total, pending, preparing, completed } });
});
