require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();

const required = ["MONGODB_URI", "JWT_SECRET"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Zaroori .env values missing hain: ${missing.join(", ")}`);
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrls: (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((s) => s.trim().replace(/\/$/, "")),
  deliveryFee: Number(process.env.DELIVERY_FEE ?? 150),
  freeDeliveryAbove: Number(process.env.FREE_DELIVERY_ABOVE ?? 2000),
  isProd: process.env.NODE_ENV === "production",
};
