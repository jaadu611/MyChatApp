const express = require("express");

const protectRoute = require("../middleware/auth.middleware");
const {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  deleteMessage,
  getUnreadCounts,
  editMessage,
  addReaction,
} = require("../controllers/message.controller");

const messageRouter = express.Router();

// messageRouter.get("/users", protectRoute, getUsersForSidebar);
// messageRouter.get("/unread-counts", protectRoute, getUnreadCounts);

// messageRouter.get("/:userId", protectRoute, getMessages);
// messageRouter.post("/send/:userId", protectRoute, sendMessage);
// messageRouter.delete("/:messageId", protectRoute, deleteMessage);
// messageRouter.patch("/:messageId", protectRoute, editMessage);
// messageRouter.patch("/:messageId/reaction", protectRoute, addReaction);

module.exports = messageRouter;
