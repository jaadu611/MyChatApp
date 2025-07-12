const express = require("express");

const {
  signup,
  login,
  logout,
  userProfile,
  checkAuth,
} = require("../controllers/auth.controller");
const protectRoute = require("../middleware/auth.middleware");

const authRoute = express();

authRoute.post("/signup", signup);
authRoute.post("/login", login);
authRoute.post("/logout", protectRoute, logout);

authRoute.put("/profile", protectRoute, userProfile);

authRoute.get("/check", protectRoute, checkAuth);

module.exports = { authRoute };
