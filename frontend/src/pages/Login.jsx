import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { FiCheckCircle, FiAlertTriangle, FiEye, FiEyeOff } from "react-icons/fi";
import { useLogin } from "../hooks/api/useAuth";
import { useAuthStore } from "../store/useAuthStore";
import Input from "../components/Input";
import Button from "../components/Button";
import Footer from "../components/Footer";

// Fashion graphic assets for background layout
const LEFT_GRAPHIC = "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop";
const RIGHT_GRAPHIC = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get current auth state
  const accessToken = useAuthStore((state) => state.accessToken);

  // Redirection target after successful login
  let from = location.state?.from?.pathname || "/";
  if (from === "/login" || from === "/register") {
    from = "/";
  }

  // Redirect if already logged in
  useEffect(() => {
    if (accessToken) {
      navigate(from, { replace: true });
    }
  }, [accessToken, navigate, from]);

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);

  // Notification Alert state
  const [alert, setAlert] = useState({ type: "", message: "" });

  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert({ type: "", message: "" });
    }, 4500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    // Login Mutation
    loginMutation.mutate(
      {
        username: formData.username,
        password: formData.password,
      },
      {
        onSuccess: () => {
          showAlert("success", "Đăng nhập thành công! Đang chuyển hướng...");
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1500);
        },
        onError: (error) => {
          const errorMsg =
            error.response?.data?.message || "Tên tài khoản hoặc mật khẩu không đúng!";
          showAlert("error", errorMsg);
        },
      }
    );
  };

  return (
    <div className="full-screen bg-[#fbf9f9] min-h-screen w-full flex flex-col relative select-none font-dmsans pt-28">
      {/* Editorial Decorative Images (Visible on tablet/desktop only) */}
      <div className="hidden lg:block absolute bottom-10 left-[5%] w-[220px] aspect-[2/3] overflow-hidden pointer-events-none z-0">
        <img
          src={LEFT_GRAPHIC}
          alt="Fashion Model Editorial"
          className="w-full h-full object-cover grayscale opacity-90 transition-all hover:grayscale-0 hover:scale-105 duration-700"
        />
      </div>
      <div className="hidden lg:block absolute top-[120px] right-[5%] w-[220px] aspect-[2/3] overflow-hidden pointer-events-none z-0">
        <img
          src={RIGHT_GRAPHIC}
          alt="Textural Detail Abstract"
          className="w-full h-full object-cover opacity-90 transition-all hover:scale-105 duration-700"
        />
      </div>

      {/* Main Form Center Box */}
      <div className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-[500px] bg-white border border-[#e0e0e0] p-8 md:p-12 rounded-none transition-all duration-300">
          
          {/* Header Texts */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-[32px] font-medium text-black tracking-wide mb-2">
              Chào mừng trở lại
            </h1>
            <p className="body-md text-neutral-500 text-sm font-light">
              Đăng nhập vào tài khoản LUMIÈRE của bạn
            </p>
          </div>

          {/* Feedback Alerts */}
          {alert.message && (
            <div
              className={`mb-6 p-4 border flex items-center space-x-3 transition-all duration-300 ${
                alert.type === "success"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-red-50 border-red-300 text-red-800"
              }`}
            >
              <span className="flex-shrink-0">
                {alert.type === "success" ? (
                  <FiCheckCircle size={18} className="text-emerald-600" />
                ) : (
                  <FiAlertTriangle size={18} className="text-red-600" />
                )}
              </span>
              <span className="text-xs font-semibold tracking-wide">{alert.message}</span>
            </div>
          )}

          {/* Login/Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* EMAIL / USERNAME */}
            <Input
              label="EMAIL / TÊN ĐĂNG NHẬP"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="example@lumiere.com"
              required
            />

            {/* PASSWORD */}
            <Input
              label="MẬT KHẨU"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              rightElement={
                <Link
                  to="/forgot"
                  className="label-sm text-[10px] text-neutral-400 hover:text-black underline tracking-wide"
                >
                  Quên mật khẩu?
                </Link>
              }
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-400 hover:text-black transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              }
            />

            {/* SUBMIT */}
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full py-4.5 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ĐANG XỬ LÝ...
                </span>
              ) : (
                "ĐĂNG NHẬP"
              )}
            </Button>

            {/* "OR" Divider */}
            <div className="flex items-center justify-between py-2">
              <div className="w-full h-[1px] bg-neutral-200"></div>
              <span className="label-sm text-[10px] text-neutral-400 px-4 whitespace-nowrap">
                HOẶC
              </span>
              <div className="w-full h-[1px] bg-neutral-200"></div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => showAlert("info", "Tính năng đăng nhập Google đang được tích hợp.")}
                className="flex items-center justify-center gap-2.5 bg-white border border-[#e0e0e0] py-3 text-xs font-semibold label-sm text-black cursor-pointer hover:bg-neutral-50 active:scale-[0.98] transition-all"
              >
                <FcGoogle size={18} />
                GOOGLE
              </button>
              <button
                type="button"
                onClick={() => showAlert("info", "Tính năng đăng nhập Apple đang được tích hợp.")}
                className="flex items-center justify-center gap-2.5 bg-white border border-[#e0e0e0] py-3 text-xs font-semibold label-sm text-black cursor-pointer hover:bg-neutral-50 active:scale-[0.98] transition-all"
              >
                <FaApple size={18} className="text-black" />
                APPLE
              </button>
            </div>

            {/* Redirect to Register page */}
            <div className="text-center pt-2">
              <span className="body-md text-xs text-neutral-500 font-light">
                Chưa có tài khoản?{" "}
              </span>
              <Link
                to="/register"
                className="body-md text-xs text-black font-semibold underline hover:text-neutral-700 cursor-pointer"
              >
                Đăng ký ngay
              </Link>
            </div>

          </form>
        </div>
      </div>

      {/* Simple Legal Footer */}
      <Footer variant="simple" />
    </div>
  );
};

export default Login;
