import React from "react";
import { Link } from "react-router-dom";

const Footer = ({ variant = "detailed" }) => {
  // Simple footer layout (used on Register / Login page)
  if (variant === "simple") {
    return (
      <footer className="w-full bg-[#fbf9f9] border-t border-[#e0e0e0] py-12 px-6 md:px-16 select-none mt-auto">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          {/* Left brand & description */}
          <div className="flex flex-col gap-2 max-w-[320px]">
            <Link
              to="/"
              className="font-serif tracking-[0.2em] text-[20px] font-bold text-black uppercase"
            >
              LUMIÈRE
            </Link>
            <p className="body-md text-xs text-neutral-500 font-light leading-relaxed">
              Crafting timeless elegance for the modern individual.
            </p>
          </div>

          {/* Center Links (first-letter capitalized) */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link
              to="/privacy"
              className="body-md text-xs text-neutral-600 hover:text-black transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="body-md text-xs text-neutral-600 hover:text-black transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/shipping-returns"
              className="body-md text-xs text-neutral-600 hover:text-black transition-colors"
            >
              Shipping & Returns
            </Link>
            <Link
              to="/contact"
              className="body-md text-xs text-neutral-600 hover:text-black transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Right copyright */}
          <div className="body-md text-xs text-neutral-400 font-light tracking-wide lg:self-center">
            © 2024 LUMIÈRE. All Rights Reserved.
          </div>
        </div>
      </footer>
    );
  }

  // Collection page footer
  if (variant === "collection") {
    return (
      <footer className="w-full bg-[#fbf9f9] border-t border-[#e0e0e0] pt-16 pb-12 px-6 md:px-16 select-none">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 pb-12">
            
            {/* Left brand info */}
            <div className="flex flex-col gap-4 max-w-[360px]">
              <Link
                to="/"
                className="font-serif tracking-[0.2em] text-[24px] font-bold text-black uppercase"
              >
                LUMIÈRE
              </Link>
              <p className="body-md text-neutral-600 leading-relaxed text-sm">
                Định nghĩa lại sự sang trọng qua ngôn ngữ của sự tối giản và chất
                lượng nguyên bản.
              </p>
            </div>

            {/* Right link columns */}
            <div className="flex gap-16 md:gap-24">
              
              {/* LIÊN KẾT */}
              <div className="flex flex-col gap-4">
                <h4 className="label-sm text-black tracking-widest font-bold text-xs">
                  LIÊN KẾT
                </h4>
                <ul className="flex flex-col gap-2.5">
                  <li>
                    <Link to="/privacy" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                      Chính sách Bảo Mật
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                      Điều Khoản Dịch Vụ
                    </Link>
                  </li>
                </ul>
              </div>

              {/* HỖ TRỢ */}
              <div className="flex flex-col gap-4">
                <h4 className="label-sm text-black tracking-widest font-bold text-xs">
                  HỖ TRỢ
                </h4>
                <ul className="flex flex-col gap-2.5">
                  <li>
                    <Link to="/shipping-returns" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                      Giao hàng & Đổi trả
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                      Liên hệ
                    </Link>
                  </li>
                </ul>
              </div>

            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-[#e0e0e0] pt-6 text-left">
            <p className="body-md text-xs text-neutral-400 font-light">
              © 2024 LUMIÈRE. All Rights Reserved.
            </p>
          </div>

        </div>
      </footer>
    );
  }

  // Detailed variant (used on Home Page)
  return (
    <footer className="w-full bg-[#fbf9f9] border-t border-[#e0e0e0] pt-16 pb-12 px-6 md:px-16 select-none">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-12">
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link
              to="/"
              className="font-serif tracking-[0.2em] text-[24px] font-bold text-black uppercase"
            >
              LUMIÈRE
            </Link>
            <p className="body-md text-neutral-600 max-w-[280px] leading-relaxed text-sm">
              Nghệ thuật của sự tối giản và chất lượng vượt thời gian. Kiến tạo
              nên phong cách sống tinh tế cho thế hệ đương đại.
            </p>
          </div>

          {/* Column 2: MUA SẮM */}
          <div className="flex flex-col gap-4">
            <h3 className="label-sm text-black tracking-widest font-bold">MUA SẮM</h3>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link to="/collection" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/collection" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                  Áo Blazer
                </Link>
              </li>
              <li>
                <Link to="/collection" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                  Quần Tây
                </Link>
              </li>
              <li>
                <Link to="/collection" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                  Phụ kiện
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: THÔNG TIN */}
          <div className="flex flex-col gap-4">
            <h3 className="label-sm text-black tracking-widest font-bold">THÔNG TIN</h3>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link to="/about" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                  Câu chuyện thương hiệu
                </Link>
              </li>
              <li>
                <Link to="/contact" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/stores" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                  Cửa hàng
                </Link>
              </li>
              <li>
                <Link to="/careers" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                  Tuyển dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: HỖ TRỢ */}
          <div className="flex flex-col gap-4">
            <h3 className="label-sm text-black tracking-widest font-bold">HỖ TRỢ</h3>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link to="/returns" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/terms" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                  Bảo mật
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="body-md text-neutral-600 hover:text-black text-sm transition-colors">
                  Giao hàng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-[#e0e0e0] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="label-sm text-[10px] text-neutral-400">
            © 2026 LUMIÈRE ARCHIVES. ALL RIGHTS RESERVED.
          </span>
          <span className="label-sm text-[10px] text-neutral-400">
            DESIGNED WITH UNDERSTATED LUXURY
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
