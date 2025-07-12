import { Camera, Mail, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useRef, useState } from "react";
import { useThemeStore } from "../store/useThemeStore";
import { themeClassMap } from "../components/constant";

const Profile = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const { theme } = useThemeStore();
  const themeClasses = themeClassMap[theme] || {
    base: "bg-slate-900 text-white",
    primary: "bg-indigo-500",
    secondary: "bg-slate-700",
    accent: "bg-purple-400",
    border: "border-slate-700",
  };

  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      try {
        setSelectedImage(base64Image);
        await updateProfile({ profilePicture: base64Image });
      } catch (error) {
        console.error("Error updating profile picture:", error);
      }
    };
  };

  return (
    <div
      className={`min-h-screen pt-20 flex justify-center items-start px-4 ${themeClasses.base}`}
    >
      <div
        className={`relative top-[80px] w-full max-w-xl p-8 rounded-2xl shadow-lg space-y-8 transition-all duration-300 ${themeClasses.primary} ${themeClasses.border}`}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-base-content">Profile</h1>
          <p className="opacity-70 mt-2 text-base-content">
            Your profile information
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={
                selectedImage ||
                authUser?.profilePicture ||
                "/default-profile.png"
              }
              alt="Profile"
              className={`w-32 h-32 rounded-full object-cover border-4 transition-all duration-300 ${themeClasses.border}`}
            />
            <div
              className={`absolute bottom-0 right-0 p-2 rounded-full cursor-pointer transition-transform duration-200 shadow-md hover:scale-110 ${
                isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
              } ${themeClasses.accent}`}
              onClick={() => !isUpdatingProfile && fileInputRef.current.click()}
            >
              <Camera className="w-5 h-5 text-white" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="*/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={!authUser || isUpdatingProfile}
            />
          </div>
          <p className="text-sm opacity-60 text-base-content">
            {isUpdatingProfile
              ? "Updating profile picture..."
              : "Click camera icon to update profile picture"}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-sm flex items-center gap-2 text-base-content">
              <User className="w-4 h-4" />
              Full Name
            </div>
            <div
              className={`px-4 py-2.5 rounded-lg border ${themeClasses.base} ${themeClasses.border}`}
            >
              {authUser?.fullName}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm flex items-center gap-2 text-base-content">
              <Mail className="w-4 h-4" />
              Email Address
            </div>
            <div
              className={`px-4 py-2.5 rounded-lg border ${themeClasses.base} ${themeClasses.border}`}
            >
              {authUser?.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
