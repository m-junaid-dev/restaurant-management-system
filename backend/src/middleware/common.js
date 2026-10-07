const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const env = require("../config/env");
const { ApiError } = require("../utils/helpers");

// Joi schema se body/query check
exports.validate = (schema, source = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true, convert: true });
  if (error) {
    const errors = error.details.map((d) => ({ field: d.path.join("."), message: d.message.replace(/"/g, "") }));
    return next(new ApiError(422, "Validation failed", errors));
  }
  req[source] = value;
  next();
};

exports.validateIds = (...names) => (req, res, next) => {
  for (const n of names)
    if (!mongoose.isValidObjectId(req.params[n])) return next(new ApiError(400, `Invalid ${n}`));
  next();
};

// $ aur . wali keys hata deta hai (NoSQL injection se bachao)
const clean = (o) => {
  if (o && typeof o === "object")
    for (const k of Object.keys(o)) {
      if (k.startsWith("$") || k.includes(".")) delete o[k];
      else clean(o[k]);
    }
};
exports.sanitize = (req, res, next) => { clean(req.body); clean(req.query); clean(req.params); next(); };

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => next(new ApiError(429, "Too many attempts. Please try again in a few minutes.")),
});

exports.notFound = (req, res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

exports.errorHandler = (err, req, res, next) => { // eslint-disable-line
  let status = err.status || 500, message = err.message, errors = err.errors || [];
  if (!err.status && err.name === "ValidationError") {
    status = 422; message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === "CastError") { status = 400; message = `Invalid ${err.path}`; errors = []; }
  else if (err.code === 11000) { status = 409; message = `${Object.keys(err.keyValue || {}).join(", ") || "Value"} already exists`; errors = []; }
  else if (err.type === "entity.parse.failed") { status = 400; message = "Request body is not valid JSON"; }
  if (status >= 500) { console.error(err); if (env.isProd) message = "Internal server error"; }
  res.status(status).json({ success: false, message, errors: Array.isArray(errors) ? errors : [] });
};
