import { Link } from "react-router-dom";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { themeClassMap } from "../constant";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const { theme } = useThemeStore();

  const themeClasses = themeClassMap[theme] || {
    base: "bg-slate-900 text-white",
    primary: "bg-indigo-500",
    secondary: "bg-slate-700",
    accent: "text-green-200",
    border: "border-slate-500",
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 border-b backdrop-blur shadow-sm flex items-center 
        ${themeClasses.base} ${themeClasses.border}`}
    >
      <div className="w-full max-w-[90vw] mx-auto flex items-center justify-between">
        <span className="flex justify-center items-center gap-2">
          <MessageSquare
            size={40}
            className={`h-12 w-12 p-1 rounded-md shadow-sm ${
              themeClasses.accent || "text-indigo-500"
            } ${themeClasses.secondary || "bg-slate-700"}`}
          />

          <Link
            to="/"
            className={`relative bottom-1 text-2xl font-semibold transition-colors duration-200 hover:${themeClasses.accent}`}
          >
            MyChatApp
          </Link>
        </span>

        {authUser && (
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className={`flex items-center gap-1 px-3 py-2 rounded-full transition 
                bg-black/20 hover:bg-black/10`}
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">Profile</span>
            </Link>

            <Link
              to="/settings"
              className={`flex items-center gap-1 px-3 py-2 rounded-full transition 
                bg-black/20 hover:bg-black/10`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </Link>

            <button
              onClick={logout}
              className="p-2 rounded-full text-red-400 hover:text-red-600 bg-black/20 hover:bg-black/30 transition"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
