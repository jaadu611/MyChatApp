import { useThemeStore } from "../store/useThemeStore";
import { THEMES, themeClassMap } from "../constant";

const Settings = () => {
  const { theme, setTheme } = useThemeStore();
  const themeClasses = themeClassMap[theme] || {
    base: "bg-slate-900 text-white",
    primary: "bg-indigo-500",
    secondary: "bg-slate-700",
    accent: "bg-purple-400",
    border: "border-slate-700",
  };

  return (
    <div className="relative top-[80px] h-[calc(100vh-6rem)] max-w-3xl mx-auto px-4 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Choose Theme</h2>

      <div className="flex-1 overflow-auto mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
          {THEMES.map((t) => {
            const themeClasses = themeClassMap[t];
            return (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-md border transition-all flex flex-col items-center p-2 group text-xs ${
                  theme === t
                    ? "border-indigo-500 ring-1 ring-indigo-400"
                    : "border-gray-800 hover:border-green-200"
                }`}
              >
                <div className="grid grid-cols-4 w-full h-6 rounded overflow-hidden">
                  <div className={`${themeClasses.primary} w-full h-full`} />
                  <div className={`${themeClasses.secondary} w-full h-full`} />
                  <div className={`${themeClasses.accent} w-full h-full`} />
                  <div className={`${themeClasses.base} w-full h-full`} />
                </div>
                <p className="mt-1 capitalize text-center filter invert-1 group-hover:text-indigo-300">
                  {t}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={`rounded-md shadow border text-xs transition mt-2 ${
          themeClasses.border || "border-gray-600"
        } ${themeClasses.base}`}
      >
        <div
          className={`w-[70%] px-3 py-2 font-medium text-[14px] border-b flex items-center gap-3 ${
            themeClasses.border || "border-gray-600"
          }`}
        >
          <img
            src="../public/default-profile.png"
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          John Doe
        </div>

        <div className={`px-3 py-2 space-y-2 ${themeClasses.primary}`}>
          <div
            className={`w-fit max-w-[75%] ${
              themeClasses?.base || "bg-gray-100"
            } px-2 py-1.5 rounded`}
          >
            <p className="font-medium">
              Hey! Just wanted to check in on the project update.
            </p>
            <span className="block text-[10px] opacity-60 mt-1 text-right">
              10:45 AM
            </span>
          </div>

          <div className="flex justify-end">
            <div
              className={`w-fit max-w-[75%] ${
                themeClasses?.base || "bg-gray-100"
              } px-2 py-1.5 rounded`}
            >
              <p className="font-medium">
                Hey John! It’s almost done, will share tonight.
              </p>
              <span className="block text-[10px] opacity-60 mt-1">
                10:47 AM
              </span>
            </div>
          </div>

          <div
            className={`w-fit max-w-[75%] ${
              themeClasses?.base || "bg-gray-100"
            } px-2 py-1.5 rounded`}
          >
            <p className="font-medium">Awesome, looking forward to it 🚀</p>
            <span className="block text-[10px] opacity-60 mt-1 text-right">
              10:48 AM
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2 mt-3 border-t border-white/10">
            <input
              type="text"
              placeholder="Type a message..."
              className={`flex-1 px-3 py-1.5 rounded-md text-xs focus:outline-none ${themeClasses?.accent}`}
            />
            <button
              className={`px-3 py-1.5 rounded-md text-xs font-medium hover:opacity-80 ${themeClasses?.base}`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
