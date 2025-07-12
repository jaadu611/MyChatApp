import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.NODE_ENV === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isUpdatingProfile: false,
      isChecking: true,
      onlineUsers: [],
      setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),
      socket: null,

      checkAuth: async () => {
        try {
          const res = await axiosInstance.get("/auth/check");
          set({ authUser: res.data });

          get().connectSocket();
        } catch (error) {
          console.warn(
            "⚠️ Auth check failed:",
            error?.response || error.message
          );
          set({ authUser: null });
        } finally {
          set({ isChecking: false });
        }
      },

      signup: async (data) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post("/auth/signup", data);
          set({ authUser: res.data.user });
          toast.success("Signup successfully");

          get().connectSocket();
        } catch (error) {
          console.warn("Signup error:", error);
          throw error;
        } finally {
          set({ isSigningUp: false });
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          set({ authUser: null });

          get().disconnectSocket();
        } catch (error) {
          console.warn("Logout error:", error);
        } finally {
          set({ isChecking: false });
        }
      },

      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", data);
          set({ authUser: res.data.user });

          if (res) {
            get().connectSocket();
          }
        } catch (error) {
          console.warn("Login error:", error);
          throw error;
        } finally {
          set({ isLoggingIn: false });
        }
      },

      updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/auth/profile", data);
          set((state) => ({
            authUser: {
              ...state.authUser,
              ...res.data.user,
            },
          }));
          toast.success("Profile updated successfully!");
        } catch (error) {
          toast.error("Failed to update profile.");
          throw error;
        } finally {
          set({ isUpdatingProfile: false });
        }
      },

      connectSocket: () => {
        const { authUser, socket } = get();
        if (!authUser || socket?.connected) return;

        if (socket) socket.disconnect();

        const newSocket = io(BASE_URL, {
          query: {
            userId: authUser.id,
          },
          withCredentials: true,
        });

        newSocket.on("getOnlineUsers", (userIds) => {
          set({ onlineUsers: userIds });
        });

        set({ socket: newSocket });
      },

      disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) {
          socket.disconnect();
          set({ socket: null, onlineUsers: [] });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ authUser: state.authUser }),
    }
  )
);
