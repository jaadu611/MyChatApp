const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const connectDB = require("./lib/connect");
const { app, server } = require("./lib/socket");
const { authRoute } = require("./routes/auth.route");
const messageRouter = require("./routes/message.route");

dotenv.config();

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

console.log("💡 Registering routes...");

try {
  app.use("/api/auth", authRoute);
  app.use("/api/messages", messageRouter);
} catch (err) {
  console.error("🔥 Route crash:", err);
}

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoute);
app.use("/api/messages", messageRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB();
});
