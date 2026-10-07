const env = require("./config/env");
const connectDB = require("./config/database");
const app = require("./app");

connectDB()
  .then(() => app.listen(env.port, () => console.log(`Server running on port ${env.port}`)))
  .catch((err) => {
    console.error("MongoDB se connect nahi ho saka:", err.message);
    process.exit(1);
  });
