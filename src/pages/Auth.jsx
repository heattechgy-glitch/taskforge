import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Mail, Lock, AlertCircle } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    // Simulate API call
    setTimeout(() => {
      // Generate fake JWT token
      const fakeToken = btoa(JSON.stringify({
        email,
        userId: Math.random().toString(36).substr(2, 9),
        exp: Date.now() + 24 * 60 * 60 * 1000
      }));
      
      localStorage.setItem("user_token", fakeToken);
      setLoading(false);
      navigate("/");
    }, 1000);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email && validateEmail(value)) {
      setErrors({ ...errors, email: null });
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password && validatePassword(value)) {
      setErrors({ ...errors, password: null });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">TaskForge</h1>
          <p className="text-gray-400">Manage your tasks with ease</p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => {
                setMode("login");
                setErrors({});
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-gray-800 text-[#0ea5e9] border-b-2 border-[#0ea5e9]"
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Login
            </button>
            <button
              onClick={() => {
                setMode("signup");
                setErrors({});
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "bg-gray-800 text-[#0ea5e9] border-b-2 border-[#0ea5e9]"
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  className={`w-full pl-11 pr-4 py-3 bg-gray-800 border ${
                    errors.email ? "border-red-500" : "border-gray-700"
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all`}
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <div className="flex items-center mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3 bg-gray-800 border ${
                    errors.password ? "border-red-500" : "border-gray-700"
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all`}
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <div className="flex items-center mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {mode === "login" ? "Logging in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {mode === "login" ? (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Login
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Sign Up
                    </>
                  )}
                </>
              )}
            </button>

            {mode === "login" && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-[#0ea5e9] hover:text-[#0284c7] transition-colors"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setErrors({});
                }}
                className="text-[#0ea5e9] hover:text-[#0284c7] font-medium transition-colors"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setErrors({});
                }}
                className="text-[#0ea5e9] hover:text-[#0284c7] font-medium transition-colors"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}