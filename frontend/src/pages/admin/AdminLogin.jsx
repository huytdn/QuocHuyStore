import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogin } from "../../hooks/api/useAuth";
import { useAuthStore } from "../../store/useAuthStore";

const MODEL_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuD5izHqI_zg9fAWi14PhrzxBtGzxP15cNJRem5uG2ppDZYZ8Fk8gnEhld5uTcPq8ZboD9Mt5ExK6TyEB7W9GtynsgQx55w6-LYIk8DHO67qlk6dyVTSxDiinvzPAITit68xYWsllDh6BnqMOQ7JKq-z9OXMVGMUNxpsHnzrwXnRqerC1q53bZFVo0pxLD5Appv_hgvuNGItaq6t4WGGHX7rzzPHvP0RKQY9EnUTugvJS78ztWIYXw6r";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const logoutStore = useAuthStore((state) => state.logout);

  // Redirection logic
  const from = location.state?.from?.pathname || "/admin/products";

  useEffect(() => {
    if (accessToken && user?.role === "ADMIN") {
      navigate(from, { replace: true });
    }
  }, [accessToken, user, navigate, from]);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;

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

    loginMutation.mutate(
      {
        username: formData.username,
        password: formData.password,
      },
      {
        onSuccess: (data) => {
          const loggedInUser = data.user;
          if (loggedInUser?.role !== "ADMIN") {
            // Logout automatically if not admin
            logoutStore();
            showAlert("error", "Tài khoản của bạn không có quyền truy cập Admin Console!");
          } else {
            showAlert("success", "Xác thực thành công! Đang chuyển hướng...");
            setTimeout(() => {
              navigate("/admin/products", { replace: true });
            }, 1200);
          }
        },
        onError: (error) => {
          const errorMsg =
            error.response?.data?.message || "Tên đăng nhập hoặc mật khẩu không đúng!";
          showAlert("error", errorMsg);
        },
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf9f9] text-[#1b1c1c] font-sans antialiased text-left select-none">
      {/* TopNavBar */}
      <header className="w-full top-0 sticky z-50 bg-[#fbf9f9]/80 backdrop-blur-md border-b border-[#cfc4c5] transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center px-16 py-6 max-w-[1440px] mx-auto">
          <div className="font-serif text-[24px] lg:text-[32px] tracking-widest text-black uppercase font-semibold">
            LUMIÈRE
          </div>
          <div className="flex gap-6 items-center">
            <span className="material-symbols-outlined text-black cursor-pointer hover:opacity-70 transition-opacity" title="Bảo mật">security</span>
            <span className="material-symbols-outlined text-black cursor-pointer hover:opacity-70 transition-opacity" title="Trợ giúp">help_outline</span>
          </div>
        </div>
      </header>

      {/* Main Content: Login Canvas */}
      <main className="flex-grow flex items-center justify-center py-16 px-6 relative overflow-hidden">
        {/* Abstract Background Element (Subtle Texture) */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#cfc5b3] blur-[120px]"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#e2e2e2] blur-[100px]"></div>
        </div>

        <div className="w-full max-w-md z-10">
          {/* Login Card */}
          <div className="bg-white border border-[#e0e0e0] p-12 shadow-sm transition-all duration-300">
            {/* Card Header */}
            <div className="mb-12 text-center">
              <h1 className="font-serif text-[32px] font-semibold text-black mb-2">Sign In</h1>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Access Admin Console</p>
            </div>

            {/* Notification Alert */}
            {alert.message && (
              <div className={`mb-6 p-4 text-xs font-semibold uppercase tracking-wider ${
                alert.type === "success" 
                  ? "bg-[#e9dfcb] text-[#696253] border border-[#cfc5b3]" 
                  : "bg-[#ffdad6] text-[#93000a] border border-[#ffdad6]"
              }`}>
                {alert.message}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8" id="loginForm">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-black uppercase tracking-wider" htmlFor="email">Email or Username</label>
                <div className="relative">
                  <input 
                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-neutral-400 py-3 px-0 text-sm placeholder:text-neutral-400/60 transition-colors focus:border-black focus:ring-0 rounded-none" 
                    id="email" 
                    name="username" 
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="name@lumiere.com" 
                    required 
                    type="text"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-black uppercase tracking-wider" htmlFor="password">Password</label>
                </div>
                <div className="relative">
                  <input 
                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-neutral-400 py-3 px-0 text-sm placeholder:text-neutral-400/60 transition-colors focus:border-black focus:ring-0 rounded-none pr-8" 
                    id="password" 
                    name="password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••" 
                    required 
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                  />
                  <button 
                    className="absolute right-0 top-3 text-neutral-400 hover:text-black transition-colors" 
                    id="togglePassword" 
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    <span className="material-symbols-outlined text-[20px] select-none">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input 
                    className="h-4 w-4 rounded-none border-neutral-400 text-black focus:ring-0 cursor-pointer" 
                    id="remember-me" 
                    name="remember-me" 
                    type="checkbox"
                  />
                  <label className="ml-2 block text-[10px] font-bold text-neutral-500 uppercase cursor-pointer select-none" htmlFor="remember-me">Remember me</label>
                </div>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Tính năng quên mật khẩu dành cho Quản trị viên: Vui lòng liên hệ bộ phận hỗ trợ kỹ thuật để khôi phục!");
                  }}
                  className="text-[10px] font-bold text-neutral-500 uppercase hover:text-black transition-colors underline underline-offset-4 decoration-neutral-300"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button 
                  className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all duration-300 transform active:scale-[0.98] cursor-pointer flex items-center justify-center disabled:opacity-50" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Enter Console"}
                </button>
              </div>
            </form>

            {/* Security Badge */}
            <div className="mt-12 flex items-center justify-center gap-2 opacity-40">
              <span className="material-symbols-outlined text-[16px]">encrypted</span>
              <span className="text-[10px] font-bold uppercase">End-to-End Secure Platform</span>
            </div>
          </div>

          {/* Footer Links (Mobile/Contextual) */}
          <div className="mt-8 flex justify-center gap-6">
            <a className="text-[10px] font-bold text-neutral-400 uppercase hover:text-black transition-colors" href="#">Contact Support</a>
            <span className="text-neutral-300">•</span>
            <a className="text-[10px] font-bold text-neutral-400 uppercase hover:text-black transition-colors" href="#">Privacy</a>
          </div>
        </div>

        {/* Editorial Image Side (Hidden on mobile for focus) */}
        <div className="hidden xl:block absolute right-[-100px] top-[20%] w-[450px] aspect-[2/3] transform rotate-3 z-0 opacity-80 pointer-events-none">
          <img 
            className="w-full h-full object-cover shadow-2xl grayscale" 
            src={MODEL_IMAGE}
            alt="Editorial model"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#fbf9f9] border-t border-[#cfc4c5] transition-colors duration-200">
        <div className="flex flex-col md:flex-row justify-between items-center px-16 py-6 max-w-[1440px] mx-auto gap-4">
          <div className="text-[10px] font-bold uppercase text-neutral-400">
            © 2026 LUMIÈRE MANAGEMENT PLATFORM. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-6">
            <a className="text-[10px] font-bold uppercase text-neutral-400 hover:text-black underline transition-all" href="#">Privacy Policy</a>
            <a className="text-[10px] font-bold uppercase text-neutral-400 hover:text-black underline transition-all" href="#">Security Protocol</a>
            <a className="text-[10px] font-bold uppercase text-neutral-400 hover:text-black underline transition-all" href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLogin;
