const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const { ApiError, asyncHandler } = require("../utils/helpers");

const readUser = async (req) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  let payload;
  try {
    payload = jwt.verify(header.slice(7), env.jwtSecret);
  } catch (e) {
    throw new ApiError(401, e.name === "TokenExpiredError" ? "Your session has expired. Please log in again." : "Invalid token. Please log in again.");
  }
  const user = await User.findById(payload.id).select("+passwordChangedAt");
  if (!user) throw new ApiError(401, "This account no longer exists.");
  if (user.isBlocked) throw new ApiError(403, "Your account has been blocked. Contact support.");
  if (user.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime())
    throw new ApiError(401, "Password was changed. Please log in again.");
  return user;
};

// Login zaroori
exports.authenticate = asyncHandler(async (req, res, next) => {
  const user = await readUser(req);
  if (!user) throw new ApiError(401, "Please log in to continue.");
  req.user = user;
  next();
});

// Login ho to user attach kar do, na ho to guest chalne do
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  req.user = (await readUser(req)) || null;
  next();
});

exports.authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : next(new ApiError(403, "You do not have permission to do this."));
