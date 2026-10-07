const Restaurant = require("../models/Restaurant");
const { ApiError } = require("../utils/helpers");

const sameId = (a, b) => String(a?._id || a) === String(b?._id || b);
exports.sameId = sameId;

// Restaurant owner ya super admin hi manage kar sakta hai
exports.canManage = (user, restaurant) => !!user && (user.role === "super_admin" || sameId(restaurant.owner, user._id));

exports.getRestaurant = async (id) => {
  const r = await Restaurant.findById(id);
  if (!r) throw new ApiError(404, "Restaurant not found");
  return r;
};

exports.assertManage = (user, restaurant) => {
  if (!exports.canManage(user, restaurant)) throw new ApiError(403, "You can only manage your own restaurant.");
};

// Public ke liye sirf active restaurant dikhta hai
exports.assertVisible = (user, restaurant) => {
  if (!restaurant.isActive && !exports.canManage(user, restaurant)) throw new ApiError(404, "Restaurant not found");
};
