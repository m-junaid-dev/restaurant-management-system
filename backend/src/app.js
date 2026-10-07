const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const routes = require("./routes");
const { sanitize, notFound, errorHandler } = require("./middleware/common");
const { ApiError } = require("./utils/helpers");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || env.clientUrls.includes(origin)) return cb(null, true);
      cb(new ApiError(403, "This website is not allowed to use the API (CORS)."));
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(sanitize);

app.get("/api/health", (req, res) => res.json({ success: true, message: "API is running", data: null }));
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
