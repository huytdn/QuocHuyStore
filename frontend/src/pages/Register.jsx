import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { FiCheckCircle, FiAlertTriangle, FiEye, FiEyeOff } from "react-icons/fi";
import { useRegister } from "../hooks/api/useAuth";
import Input from "../components/Input";
import Button from "../components/Button";
import Footer from "../components/Footer";

// Fashion collage image URLs from Unsplash
const COLLAGE_MODEL = "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop";
const COLLAGE_SILK = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";
const COLLAGE_SCULPT = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop";

const Register = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const isLoading = registerMutation.isPending;

  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    // Client-side validations
    if (formData.password !== formData.confirmPassword) {
      showAlert("error", "Mật khẩu xác nhận không khớp!");
      return;
    }
    if (formData.password.length < 6) {
      showAlert("error", "Mật khẩu phải chứa ít nhất 6 ký tự!");
      return;
    }
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      showAlert("error", "Số điện thoại không hợp lệ (yêu cầu 10-11 chữ số)!");
      return;
    }

    // Call register API
    registerMutation.mutate(
      {
        username: formData.username,
        password: formData.password,
        displayName: formData.displayName,
        phone: formData.phone,
      },
      {
        onSuccess: () => {
          showAlert("success", "Đăng ký thành công! Bạn có thể đăng nhập ngay.");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        },
        onError: (error) => {
          const errorMsg =
            error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!";
          showAlert("error", errorMsg);
        },
      }
    );
  };

  return (
    <div className="bg-[#fbf9f9] min-h-screen w-full flex flex-col relative select-none font-dmsans pt-24">
      {/* Split layout */}
      <div className="flex-grow max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 px-6 md:px-16 py-12 items-center">
        
        {/* Left Side: Form (7/12 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="max-w-[540px] w-full">
            
            {/* Header titles */}
            <div className="mb-8">
              <h1 className="font-serif text-[36px] font-medium text-black leading-tight mb-2">
                Tạo tài khoản mới
              </h1>
              <p className="body-md text-neutral-500 text-sm font-light">
                Tham gia cộng đồng LUMIÈRE để nhận những ưu đãi đặc quyền.
              </p>
            </div>

            {/* Custom Alerts */}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: Side-by-side Username & Display Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="TÊN ĐĂNG NHẬP"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="username_lumiere"
                  required
                />
                <Input
                  label="TÊN HIỂN THỊ"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              {/* Row 2: Phone */}
              <Input
                label="SỐ ĐIỆN THOẠI"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+84 000 000 000"
                required
              />

              {/* Row 3: Password */}
              <Input
                label="MẬT KHẨU"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
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

              {/* Row 4: Confirm Password */}
              <Input
                label="XÁC NHẬN MẬT KHẨU"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-neutral-400 hover:text-black transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                }
              />

              {/* Submit button */}
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full py-4.5"
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
                  "ĐĂNG KÝ"
                )}
              </Button>

              {/* Divider */}
              <div className="flex items-center justify-between py-2 select-none">
                <div className="w-full h-[1px] bg-neutral-200"></div>
                <span className="label-sm text-[10px] text-neutral-400 px-4 whitespace-nowrap">
                  HOẶC KẾT NỐI VỚI
                </span>
                <div className="w-full h-[1px] bg-neutral-200"></div>
              </div>

              {/* Social login buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => showAlert("info", "Tính năng đăng nhập Google đang được tích hợp.")}
                  className="flex items-center justify-center gap-2.5 bg-[#fbf9f9] border border-[#e0e0e0] py-3 text-xs font-semibold label-sm text-black cursor-pointer hover:bg-neutral-50 active:scale-[0.98] transition-all"
                >
                  <FcGoogle size={18} />
                  GOOGLE
                </button>
                <button
                  type="button"
                  onClick={() => showAlert("info", "Tính năng đăng nhập Apple đang được tích hợp.")}
                  className="flex items-center justify-center gap-2.5 bg-[#fbf9f9] border border-[#e0e0e0] py-3 text-xs font-semibold label-sm text-black cursor-pointer hover:bg-neutral-50 active:scale-[0.98] transition-all"
                >
                  <FaApple size={18} className="text-black" />
                  APPLE
                </button>
              </div>

              {/* Redirect switch link */}
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="body-md text-xs text-black font-semibold underline hover:text-neutral-700 cursor-pointer"
                >
                  Đã có tài khoản? Đăng nhập ngay
                </Link>
              </div>

            </form>
          </div>
        </div>

        {/* Right Side: Editorial Image Collage (5/12 cols) */}
        <div className="lg:col-span-5 h-[620px] bg-[#efeded] p-6 flex flex-col justify-center items-center z-0 relative">
          <div className="w-full h-full grid grid-cols-2 gap-4">
            
            {/* Left Column: Full-height suit model */}
            <div className="h-full overflow-hidden relative">
              <img
                src={COLLAGE_MODEL}
                alt="Lumiere Model Suit Editorial"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* Right Column: Stacked items */}
            <div className="h-full flex flex-col gap-4">
              {/* Top: Wavy bronze silk */}
              <div className="h-[48%] overflow-hidden relative">
                <img
                  src={COLLAGE_SILK}
                  alt="Satin Bronze Wave Texture"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              
              {/* Bottom: Sculpture background + frosted glass banner */}
              <div className="h-[48%] overflow-hidden relative group">
                <img
                  src={COLLAGE_SCULPT}
                  alt="Minimal Art Sculpture Frame"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Frosted Glass Overlay Card */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/20 backdrop-blur-md border border-white/25 p-4 text-white">
                  <h3 className="font-serif text-lg font-bold tracking-wide mb-0.5">
                    Élégance Pure
                  </h3>
                  <p className="font-sans text-[8px] tracking-[0.15em] font-medium text-white/90 uppercase">
                    DEFINE YOUR NARRATIVE WITH LUMIÈRE
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Simple Footer */}
      <Footer variant="simple" />
    </div>
  );
};

export default Register;
