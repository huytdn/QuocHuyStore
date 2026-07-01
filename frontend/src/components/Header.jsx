import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX } from "react-icons/fi";
import { useAuthStore } from "../store/useAuthStore";
import { useLogout } from "../hooks/api/useAuth";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHomepage = location.pathname === "/";
  // Determine variant dynamically
  const variant = isHomepage ? "home" : "auth";

  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    if (isHomepage) {
      window.addEventListener("scroll", handleScroll);
    }
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomepage]);

  const handleLogout = () => {
    logoutMutation.mutate(null, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Styling conditions based on variant and scroll position
  const isTransparent = variant === "home" && !scrolled;

  const headerBg = isTransparent
    ? "bg-transparent text-white"
    : "bg-white/90 backdrop-blur-md text-black border-b border-[#e0e0e0] shadow-sm";

  const logoColor = isTransparent ? "text-white" : "text-black";
  const navLinkColor = isTransparent
    ? "text-white/80 hover:text-white"
    : "text-neutral-600 hover:text-black";

  const iconColor = isTransparent ? "text-white" : "text-black";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-6 px-6 md:px-16 ${headerBg}`}
      >
        {variant === "home" ? (
          // HOME VARIANT: Center Logo, Left Links, Right Icons
          <div className="max-w-[1440px] mx-auto grid grid-cols-3 items-center">
            {/* Left Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                to="/product"
                className={`label-sm ${navLinkColor} transition-colors relative group py-1`}
              >
                SẢN PHẨM
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-current transition-all duration-350 group-hover:w-full"></span>
              </Link>
              <Link
                to="/smart-search"
                className={`label-sm ${navLinkColor} transition-colors relative group py-1`}
              >
                TÌM KIẾM THÔNG MINH
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-current transition-all duration-350 group-hover:w-full"></span>
              </Link>
              <Link
                to="/about"
                className={`label-sm ${navLinkColor} transition-colors relative group py-1`}
              >
                VỀ CHÚNG TÔI
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-current transition-all duration-350 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Mobile Hamburger (left-aligned on home mobile) */}
            <div className="flex lg:hidden">
              <button
                onClick={toggleMenu}
                aria-label="Toggle menu"
                className={iconColor}
              >
                <FiMenu size={24} />
              </button>
            </div>

            {/* Center Logo */}
            <div className="flex justify-center">
              <Link
                to="/"
                className={`font-serif tracking-[0.2em] text-[26px] md:text-[32px] font-bold ${logoColor} uppercase transition-all`}
              >
                LUMIÈRE
              </Link>
            </div>

            {/* Right Icons */}
            <div className="flex items-center justify-end gap-5 md:gap-7">
              <Link
                to="/cart"
                className={`relative cursor-pointer ${iconColor} hover:scale-105 transition-transform`}
              >
                <FiShoppingBag size={20} />
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white font-sans font-bold">
                  2
                </span>
              </Link>
              <div className="relative group">
                <button
                  onClick={() => !user && navigate("/login")}
                  className={`cursor-pointer flex items-center gap-1 ${iconColor} hover:scale-105 transition-transform`}
                >
                  <FiUser size={20} />
                  {user && (
                    <span className="hidden md:inline label-sm text-[10px] tracking-wider text-inherit font-medium">
                      {user.displayName?.split(" ")[0]}
                    </span>
                  )}
                </button>
                {user && (
                  <div className="absolute right-0 mt-3 w-48 bg-white text-black border border-neutral-200 rounded-none shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-xs font-semibold tracking-wider hover:bg-neutral-100 uppercase"
                    >
                      Bảng điều khiển
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-xs font-semibold tracking-wider hover:bg-neutral-100 uppercase border-t border-neutral-100"
                    >
                      Đơn hàng của tôi
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-xs font-semibold tracking-wider hover:bg-neutral-100 uppercase text-red-600 border-t border-neutral-100 mt-1"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // AUTH / STANDARD VARIANT: Left Logo, Center Links, Right Icon
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            {/* Left Logo */}
            <div>
              <Link
                to="/"
                className="font-serif tracking-[0.2em] text-[24px] md:text-[28px] font-bold text-black uppercase"
              >
                LUMIÈRE
              </Link>
            </div>

            {/* Center Nav */}
            <nav className="hidden md:flex items-center gap-10">
              <Link
                to="/"
                className="label-sm text-neutral-600 hover:text-black transition-colors relative group py-1"
              >
                Trang chủ
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-350 group-hover:w-full"></span>
              </Link>
              <Link
                to="/smart-search"
                className="label-sm text-neutral-600 hover:text-black transition-colors relative group py-1"
              >
                Tìm Kiếm Thông Minh
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-350 group-hover:w-full"></span>
              </Link>
              <Link
                to="/about"
                className="label-sm text-neutral-600 hover:text-black transition-colors relative group py-1"
              >
                Về Chúng Tôi
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-350 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-6">
              <Link
                to="/cart"
                className="relative cursor-pointer text-black hover:scale-105 transition-transform"
              >
                <FiShoppingBag size={20} />
              </Link>

              {/* User Integration in Auth header */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-1 text-black font-semibold label-sm">
                    <FiUser size={20} />
                  </button>
                  <div className="absolute right-0 mt-3 w-44 bg-white border border-neutral-200 shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-250">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-[10px] font-bold tracking-wider uppercase hover:bg-neutral-50"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-[10px] font-bold tracking-wider uppercase hover:bg-neutral-50 border-t"
                    >
                      Đơn hàng của tôi
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-[10px] font-bold tracking-wider uppercase hover:bg-neutral-50 text-red-600 border-t mt-1"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="label-sm text-neutral-600 hover:text-black transition-colors hidden md:block"
                >
                  Sign In
                </Link>
              )}

              <button
                onClick={toggleMenu}
                aria-label="Toggle menu"
                className="md:hidden text-black"
              >
                <FiMenu size={24} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MOBILE OVERLAY DRAWER */}
      <div
        className={`fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-8 transition-transform duration-500 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center">
          <span className="font-serif tracking-[0.2em] text-[24px] font-bold text-white uppercase">
            LUMIÈRE
          </span>
          <button
            onClick={toggleMenu}
            aria-label="Close menu"
            className="text-white hover:rotate-90 transition-transform duration-300"
          >
            <FiX size={28} />
          </button>
        </div>

        <nav className="flex flex-col gap-8 my-auto text-center">
          <Link
            to="/product"
            onClick={toggleMenu}
            className="font-serif text-3xl font-semibold tracking-wider hover:text-secondary transition-colors"
          >
            SẢN PHẨM / COLLECTIONS
          </Link>
          <Link
            to="/product"
            onClick={toggleMenu}
            className="font-serif text-3xl font-semibold tracking-wider hover:text-secondary transition-colors"
          >
            BỘ SƯU TẬP / LOOKBOOK
          </Link>
          <Link
            to="/about"
            onClick={toggleMenu}
            className="font-serif text-3xl font-semibold tracking-wider hover:text-secondary transition-colors"
          >
            VỀ CHÚNG TÔI / ABOUT US
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={toggleMenu}
                className="font-serif text-3xl font-semibold tracking-wider hover:text-secondary transition-colors"
              >
                BẢNG ĐIỀU KHIỂN
              </Link>
              <button
                onClick={() => {
                  toggleMenu();
                  handleLogout();
                }}
                className="font-serif text-3xl font-semibold tracking-wider text-red-400 hover:text-red-300 transition-colors uppercase"
              >
                ĐĂNG XUẤT
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={toggleMenu}
              className="font-serif text-3xl font-semibold tracking-wider hover:text-secondary transition-colors"
            >
              ĐĂNG NHẬP / SIGN IN
            </Link>
          )}
        </nav>

        <div className="text-center text-xs tracking-widest text-neutral-500 font-semibold uppercase">
          © 2026 LUMIÈRE ARCHIVES
        </div>
      </div>
    </>
  );
};

export default Header;
