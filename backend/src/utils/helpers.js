class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const send = (res, status, message, data = null) => res.status(status).json({ success: true, message, data });
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const parseBool = (v) => (v === "true" || v === true ? true : v === "false" || v === false ? false : undefined);
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

async function paginate(Model, filter, q, { sort = { createdAt: -1 }, populate = [] } = {}) {
  const page = Math.max(parseInt(q.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(q.limit) || 10, 1), 50);
  const [total, items] = await Promise.all([
    Model.countDocuments(filter),
    Model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).populate(populate).lean(),
  ]);
  return { items, page, totalPages: Math.ceil(total / limit), total };
}

function dayRange(dateStr) {
  const start = new Date(dateStr);
  if (isNaN(start)) return null;
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { $gte: start, $lt: end };
}

module.exports = { ApiError, asyncHandler, send, escapeRegex, parseBool, round2, paginate, dayRange };
