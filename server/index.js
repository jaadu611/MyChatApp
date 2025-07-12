const express = require("express");

// 🔍 Monkey patch express.Router to catch invalid paths
const originalRouter = express.Router;
express.Router = function (...args) {
  try {
    return originalRouter.apply(this, args);
  } catch (err) {
    console.error("❗ Error while creating a Router:", err.message);
    throw err;
  }
};

const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const connectDB = require("./lib/connect");
const { app, server } = require("./lib/socket");

dotenv.config();

// Middleware
app.use((req, res, next) => {
  try {
    console.log("💥 Incoming request:", req.method, req.url);
    next();
  } catch (err) {
    console.error("🔥 Error before route handler:", err);
    next(err);
  }
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Register Routes
console.log("💡 Registering routes...");
try {
  const { authRoute } = require("./routes/auth.route");
  app.use("/api/auth", authRoute);
} catch (err) {
  console.error("🔥 Failed to register /api/auth route:", err.message);
}

try {
  const messageRouter = require("./routes/message.route");
  app.use("/api/messages", messageRouter);
} catch (err) {
  console.error("🔥 Failed to register /api/messages route:", err.message);
}

const PORT = process.env.PORT || 3000;

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB();
});
