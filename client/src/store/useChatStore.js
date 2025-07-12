import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  unreadCounts: {},
  isTyping: false,
  isMessagesLoading: false,
  isUsersLoading: false,

  getUsers: async () => {
    await get().fetchUnreadCounts();
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch {
      toast.error("Error fetching users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data.messages });
    } catch {
      toast.error("Error fetching messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessages: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser, socket } = useAuthStore.getState();

    if (!selectedUser || !authUser) return;

    const payload = {
      ...messageData,
      senderId: authUser.id,
      receiverId: selectedUser._id,
    };

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        payload
      );

      socket.emit("stopTyping", {
        senderId: authUser.id,
        receiverId: selectedUser._id,
      });

      set({ messages: [...messages, res.data.newMessage] });
    } catch {
      toast.error("Error sending message");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    } catch (err) {
      console.error("❌ Failed to delete message:", err);
      toast.error("Error deleting message");
    }
  },

  subscribeToMessages: () => {
    const { socket } = useAuthStore.getState();

    // Clear previous listeners to avoid duplicates
    socket.off("newMessage");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("deleteMessage");
    socket.off("decrementUnread");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, unreadCounts, messages } = get();

      if (!selectedUser || selectedUser._id !== newMessage.senderId) {
        const updated = {
          ...unreadCounts,
          [newMessage.senderId]: (unreadCounts[newMessage.senderId] || 0) + 1,
        };
        set({ unreadCounts: updated });
      } else {
        set({ messages: [...messages, newMessage] });
      }
    });

    socket.on("typing", ({ senderId }) => {
      if (get().selectedUser?._id === senderId) {
        set({ isTyping: true });
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (get().selectedUser?._id === senderId) {
        set({ isTyping: false });
      }
    });

    socket.on("deleteMessage", (deletedMessageId) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== deletedMessageId),
      }));
    });

    socket.on("decrementUnread", ({ senderId }) => {
      const { unreadCounts } = get();
      if (unreadCounts[senderId]) {
        const updated = { ...unreadCounts };
        updated[senderId] = Math.max(0, updated[senderId] - 1);
        if (updated[senderId] === 0) delete updated[senderId];
        set({ unreadCounts: updated });
      }
    });
  },

  unsubscribeToMessages: () => {
    const { socket } = useAuthStore.getState();
    socket.off("newMessage");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("deleteMessage");
    socket.off("decrementUnread");
  },

  fetchUnreadCounts: async () => {
    try {
      const res = await axiosInstance.get("/messages/unread-counts");
      set({ unreadCounts: res.data });
    } catch (err) {
      console.error("Failed to fetch unread counts", err);
    }
  },

  setSelectedUser: async (user) => {
    set({ selectedUser: user });

    set((state) => {
      const updated = { ...state.unreadCounts };
      delete updated[user._id];
      return { unreadCounts: updated };
    });

    await get().getMessages(user._id);
  },

  editMessage: async (messageId, newText) => {
    try {
      const res = await axiosInstance.patch(`/messages/${messageId}`, {
        text: newText,
      });

      const updatedMessage = res.data;

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? updatedMessage : msg
        ),
      }));
    } catch (error) {
      console.error("Failed to edit message", error);
      toast.error("Error editing message");
    }
  },

  addReaction: async (messageId, emoji) => {
    try {
      const res = await axiosInstance.patch(`/messages/${messageId}/reaction`, {
        emoji,
      });

      const updatedMessage = res.data;

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? updatedMessage : msg
        ),
      }));
    } catch (error) {
      console.error("Failed to add reaction", error);
    }
  },
}));
