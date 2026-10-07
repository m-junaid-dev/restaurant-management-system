const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const { ApiError, asyncHandler, send } = require("../utils/helpers");

const sign = (user) => jwt.sign({ id: user._id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (await User.findOne({ email })) throw new ApiError(409, "An account with this email already exists.");
  // Role hamesha customer. Body se role nahi liya jata.
  const user = await User.create({ name, email, password, phone, role: "customer" });
  send(res, 201, "Account created successfully", { token: sign(user), user });
});

exports.login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+password");
  if (!user || !(await user.comparePassword(req.body.password))) throw new ApiError(401, "Incorrect email or password.");
  if (user.isBlocked) throw new ApiError(403, "Your account has been blocked. Contact support.");
  send(res, 200, "Logged in successfully", { token: sign(user), user });
});

// JWT stateless hai, is liye server par kuch delete nahi hota. Frontend token hata deta hai.
exports.logout = (req, res) => send(res, 200, "Logged out successfully");

exports.me = (req, res) => send(res, 200, "Profile fetched", req.user);

exports.updateMe = asyncHandler(async (req, res) => {
  Object.assign(req.user, req.body);
  await req.user.save();
  send(res, 200, "Profile updated", req.user);
});

exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password +passwordChangedAt");
  if (!(await user.comparePassword(req.body.currentPassword))) throw new ApiError(400, "Current password is incorrect.");
  user.password = req.body.newPassword;
  user.passwordChangedAt = new Date(Date.now() - 2000); // puraane tokens band, naya token neeche
  await user.save();
  send(res, 200, "Password changed successfully", { token: sign(user) });
});
