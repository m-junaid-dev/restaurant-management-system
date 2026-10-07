const mongoose = require("mongoose");
const env = require("./env");

module.exports = async function connectDB() {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
};
