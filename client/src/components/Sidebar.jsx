import { useThemeStore } from "../store/useThemeStore";
import { themeClassMap } from "../constant/index";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const { theme } = useThemeStore();
  const themeClasses = themeClassMap[theme] || {};
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    unreadCounts,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineUserOnly, setShowOnlineUserOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUser = showOnlineUserOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  useEffect(() => {
    useChatStore.getState().subscribeToMessages();
  }, []);

  if (isUsersLoading) return <SidebarSkeleton />;
  return (
    <aside
      className={`${themeClasses.base} h-full w-20 lg:w-72 border-r-1 border-base-300 flex flex-col transition-all duration-200`}
    >
      <div className="border-b border-base-300 w-full p-3">
        <div className="flex flex-col gap-3">
          {/* Top Row: Contacts + Online Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-6" />
              <span className="font-medium hidden lg:block">Contacts</span>
            </div>

            <span
              className={`text-sm font-medium ${themeClasses.text} opacity-70`}
            >
              Online: {onlineUsers.length - 1}
            </span>
          </div>

          {/* Bottom Row: Toggle */}
          <label
            className={`flex items-center gap-2 cursor-pointer self-start ${themeClasses.text}`}
          >
            <label
              className={`flex items-center gap-2 cursor-pointer self-start ${themeClasses.text}`}
            >
              <span className="text-xs hidden lg:block">Show Online</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showOnlineUserOnly}
                  onChange={(e) => setShowOnlineUserOnly(e.target.checked)}
                />
                <div
                  className="w-[34px] h-[17px] rounded-full bg-gray-300 peer-checked:bg-primary transition-colors"
                  style={{
                    backgroundColor: showOnlineUserOnly
                      ? themeClasses.secondary
                      : undefined,
                  }}
                ></div>
                <div className="absolute left-[3px] top-[3px] w-3 h-3 bg-white rounded-full shadow-md transform peer-checked:translate-x-4 transition-transform"></div>
              </div>
            </label>
          </label>
        </div>
      </div>

      <div className="overflow-y-auto w-full space-y-1 px-1">
        {users.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const unreadCount = unreadCounts?.[user._id] || 0;
          const isSelected = selectedUser?._id === user._id;
          const shouldShow = !showOnlineUserOnly || isOnline;

          return (
            <div
              key={user._id}
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                shouldShow
                  ? "max-h-20 opacity-100 scale-100"
                  : "max-h-0 opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <button
                onClick={() => setSelectedUser(user)}
                className={`w-full p-3 flex items-center gap-3 transition-colors ${
                  isSelected ? "bg-base-100 ring-1 ring-base-100" : ""
                }`}
              >
                {/* Avatar + Status */}
                <div className="relative mx-auto lg:mx-0">
                  <img
                    className="size-12 object-cover rounded-full transition-all duration-300"
                    src={user.profilePicture || "/default-profile.png"}
                    alt={user.name}
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full z-10 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {/* Name and status */}
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">
                    {isOnline ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
