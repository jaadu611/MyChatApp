import { UserPlus, Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const validateForm = () => {
    if (!formData.fullName.trim() || !formData.email || !formData.password) {
      toast.error("All fields are required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      toast.error("Invalid email address.");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    signup(formData)
      .then(() => toast.success("Account created successfully!"))
      .catch(() => toast.error("Signup failed. Please try again."));
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center bg-slate-950 px-4 text-slate-900 overflow-hidden">
      <svg
        className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] opacity-10 text-indigo-500 pointer-events-none"
        fill="currentColor"
        viewBox="0 0 200 200"
      >
        <path
          d="M56.1,-59.2C69.4,-47.6,75.5,-23.8,73.3,-2.1C71.2,19.6,60.9,39.2,47.6,52.9C34.2,66.5,17.1,74.2,-3.3,77.1C-23.6,80,-47.2,78.1,-61.1,64.3C-75.1,50.5,-79.5,25.8,-73.6,6.2C-67.6,-13.5,-51.3,-27,-37.3,-40.3C-23.3,-53.6,-11.6,-66.7,5.4,-72.2C22.3,-77.6,44.6,-75.8,56.1,-59.2Z"
          transform="translate(100 100)"
        />
      </svg>

      <div className="bg-white/90 backdrop-blur-md px-6 py-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md z-10">
        <div className="flex justify-center mb-4">
          <UserPlus className="w-12 h-12 text-indigo-600" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          Create Your Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium">Username</label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Enter username"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full p-3 pl-10 rounded-md bg-slate-100 text-slate-900 placeholder:text-slate-400 focus:outline-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={20}
              />
              <input
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-3 pl-10 rounded-md bg-slate-100 text-slate-900 placeholder:text-slate-400 focus:outline-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full p-3 pl-10 pr-10 rounded-md bg-slate-100 text-slate-900 placeholder:text-slate-400 focus:outline-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSigningUp}
            className="w-full bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700 transition"
          >
            {isSigningUp ? "Signing Up..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-700">
          Already have an account?
          <Link to="/login" className="text-indigo-600 ml-1 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
