import { MessageSquare } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { themeClassMap } from "../constant/index";

const NoChatSelected = () => {
  const { theme } = useThemeStore();
  const themeClasses = themeClassMap[theme] || {};

  return (
    <div
      className={`flex flex-col items-center justify-center h-full w-full text-center p-6 
        ${themeClasses.base || "bg-base-100"} ${
        themeClasses.text || "text-base-content"
      } overflow-hidden`}
    >
      <MessageSquare
        className={`w-16 h-16 mb-4 animate-bounce rounded-lg p-2 
          ${themeClasses.accent || "text-indigo-600"}`}
      />
      <h2 className={`text-xl font-semibold ${themeClasses.base}`}>
        No Conversation Selected
      </h2>
      <p className="mt-2 text-sm opacity-70">
        Select a chat to start messaging
      </p>
    </div>
  );
};

export default NoChatSelected;
