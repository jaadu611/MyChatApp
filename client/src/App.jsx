import { Route, Routes, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import { themeClassMap } from "../src/components/constant";

const App = () => {
  const {
    authUser,
    checkAuth,
    isChecking,
    setOnlineUsers,
    socket,
    connectSocket,
    disconnectSocket,
  } = useAuthStore();

  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authUser) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [authUser]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (socket) {
      socket.on("getOnlineUsers", setOnlineUsers);
      return () => socket.off("getOnlineUsers", setOnlineUsers);
    }
  }, [socket]);

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-gray-900 text-yellow-700">
        <Loader className="w-12 h-12 animate-spin text-yellow-500" />
        <p className="text-lg font-medium animate-pulse">Checking session...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen overflow-hidden ${
        themeClassMap[theme]?.base || "bg-base-300"
      }`}
    >
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <div>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={authUser ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/signup"
            element={authUser ? <Navigate to="/" /> : <Signup />}
          />
        </Routes>
      </div>

      <Toaster />
    </div>
  );
};

export default App;
