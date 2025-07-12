const User = require("../models/user.model");
const Message = require("../models/message.model");
const { io, getReceiverSocketId } = require("../lib/socket");

const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const users = await User.find({ _id: { $ne: userId } })
      .select("-password -__v")
      .sort({ updatedAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.warn("Error fetching users for sidebar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const authUserId = req.user._id;

    await Message.updateMany(
      {
        senderId: userId,
        receiverId: authUserId,
        read: false,
      },
      { $set: { read: true } }
    );

    const messages = await Message.find({
      $or: [
        { senderId: authUserId, receiverId: userId },
        { senderId: userId, receiverId: authUserId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, image, senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ message: "senderId and receiverId are required" });
    }

    const newMessage = new Message({
      text,
      image,
      senderId,
      receiverId,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    console.warn("❌ Error in sendMessage:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const deletedMessage = await Message.findByIdAndDelete(messageId);
    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    const receiverSocketId = getReceiverSocketId(
      deletedMessage.receiverId.toString()
    );
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("deleteMessage", deletedMessage._id);

      if (!deletedMessage.read) {
        io.to(receiverSocketId).emit("decrementUnread", {
          senderId: deletedMessage.senderId.toString(),
        });
      }
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("❌ Delete message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUnreadCounts = async (req, res) => {
  try {
    const authUserId = req.user._id;

    const unread = await Message.aggregate([
      {
        $match: {
          receiverId: authUserId,
          read: false,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {};
    unread.forEach((u) => {
      result[u._id.toString()] = u.count;
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching unread counts", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const editMessage = async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.messageId,
      {
        $set: {
          text: req.body.text,
          isEdited: true,
        },
      },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({ message: "Failed to edit message" });
  }
};

const addReaction = async (req, res) => {
  const { emoji } = req.body;
  const userId = req.user._id; // Assuming protectRoute sets req.user

  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Remove existing reaction by user if any
    message.reactions = message.reactions.filter(
      (r) => r.userId.toString() !== userId.toString()
    );

    // Add new reaction
    message.reactions.push({ emoji, userId });

    await message.save();
    res.status(200).json(message);
  } catch (err) {
    console.error("Reaction error:", err);
    res.status(500).json({ message: "Failed to react to message" });
  }
};

module.exports = {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  deleteMessage,
  getUnreadCounts,
  editMessage,
  addReaction,
};
