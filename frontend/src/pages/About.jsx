import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSliders, FiAward, FiEye } from "react-icons/fi";
import Footer from "../components/Footer";

const About = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  // Parallax Scroll Tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.pageYOffset);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans overflow-x-hidden">
      
      {/* Main Content Area */}
      <main className="flex-grow">
        
        {/* Parallax Hero Section */}
        <section className="relative h-[85vh] md:h-[90vh] w-full overflow-hidden flex items-center justify-center select-none">
          <div
            className="absolute inset-0 z-0 scale-105 transition-transform duration-100 ease-out bg-cover bg-center"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqO_Odjdz11QxOfKSz8z9oDYTY7PMRWInxg1me5_6P3FPVi61d_2dLlRIi8jv2jVwfxVYCv9DVmjVilKafprtgIwYcFSu_0vwQsiydJzzOBFj8atFM0216Oc6rQbh7gEPEPOsYqnRDEOKLF7x_pF-svcERJvhzNSTVtg0C-0KaFU8pxyg6Yq3PnLh_lO73DohB2Gs3G7pP-Tcr9RtAnrFzIF05Y4EExtSbKOtok6L37Sry1wXqWPIUN1lIieI0UImqWLOPYc4B9dI')",
              transform: `translateY(${scrollY * 0.15}px) scale(1.05)`,
            }}
          />
          <div className="absolute inset-0 bg-black/25 z-10" />
          
          <div className="relative z-20 text-center text-white px-6">
            <span className="label-sm text-xs tracking-[0.3em] uppercase mb-5 block opacity-90 font-bold">
              Khai Phóng Vẻ Đẹp
            </span>
            <h1 className="font-serif text-[42px] md:text-[80px] leading-tight mb-8 font-semibold uppercase tracking-wide">
              Nghệ Thuật & Bản Sắc
            </h1>
            <div className="w-[1px] h-20 bg-white mx-auto opacity-60" />
          </div>
        </section>

        {/* Brand Story Section */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-16 py-32 grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
          
          {/* Text Content */}
          <div className="md:col-span-5 space-y-8 text-left">
            <div className="flex items-center gap-4 select-none">
              <div className="h-[1px] bg-neutral-300 w-10 animate-pulse" />
              <span className="label-sm text-xs text-neutral-500 uppercase tracking-widest font-bold">
                Câu Chuyện Của Chúng Tôi
              </span>
            </div>
            
            <h2 className="font-serif text-[32px] md:text-[48px] font-semibold text-black leading-tight">
              Di Sản Khởi Đầu Từ Một Khát Khao.
            </h2>
            
            <div className="space-y-6 text-neutral-500 text-sm md:text-base leading-relaxed font-light">
              <p className="text-lg text-black font-normal">
                LUMIÈRE ra đời từ niềm đam mê mãnh liệt với thời trang cao cấp và khao khát tôn vinh vẻ đẹp tự nhiên của người phụ nữ hiện đại qua những thiết kế tinh tế.
              </p>
              <p>
                Chúng tôi tin rằng mỗi bộ trang phục không chỉ là vải vóc, mà là sự giao thoa giữa kỹ thuật thủ công truyền thống và tư duy thẩm mỹ đương đại. Tại LUMIÈRE, mỗi đường kim mũi chỉ đều mang trong mình một câu chuyện về sự tận tâm và tâm hồn người nghệ nhân.
              </p>
            </div>

            <button
              onClick={() => navigate("/product")}
              className="bg-black text-white px-12 py-4.5 label-sm tracking-widest font-semibold hover:bg-neutral-800 transition-colors uppercase cursor-pointer"
            >
              Khám Phá Cửa Hàng
            </button>
          </div>

          {/* Image & Foundation Badge */}
          <div className="md:col-start-7 md:col-span-6 relative w-full aspect-[3/4]">
            <div
              className="w-full h-full bg-cover bg-center border border-neutral-200"
              style={{
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCzw2M-Rfq4bRYeq2EcNV2i0NLViPTKbHpvP4f5hGyqGnafFWB0W_hYw0tEl4Mc5XgGT9HxWmc2w6XEphTcpXvou43meAzMLwPfXPWkZBNypGAFq76tfAG6YHfLhEeiJxYTj_1ng4MSi1XjMtPhlmm8G4nX5BKRzxnICKre-SL0vPIp0MXRTSEMqwHOXGFk0Tz3MQ98_Zty7dGwaL40EkneJIxjQJm1lOhGgapqEgjNZaIkrZecLRS1ZP0NpeOs5XIwOyW0nV0Whb8')",
              }}
            />
            {/* Year overlapping card */}
            <div className="absolute -bottom-8 -left-8 bg-neutral-100 p-10 border border-neutral-300 hidden md:block select-none text-left shadow-sm">
              <p className="font-serif text-[36px] font-bold text-black mb-1">1998</p>
              <p className="label-sm text-[10px] text-neutral-500 font-bold tracking-widest">NĂM THÀNH LẬP</p>
            </div>
          </div>

        </section>

        {/* Core Philosophy Section */}
        <section className="bg-neutral-50 border-y border-neutral-200/60 py-32 text-left">
          <div className="max-w-[1440px] mx-auto px-6 md:px-16">
            
            <div className="text-center mb-20 select-none">
              <h2 className="font-serif text-[32px] md:text-[44px] font-semibold text-black uppercase tracking-normal mb-4">
                Triết Lý Cốt Lõi
              </h2>
              <p className="body-md text-neutral-500 max-w-2xl mx-auto leading-relaxed font-light">
                Sự sang trọng thầm lặng được định nghĩa bởi chất lượng, tính bền vững và sự tỉ mỉ trong từng chi tiết nhỏ nhất.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              
              {/* Philosophy 1 */}
              <div className="group p-8 border border-neutral-200 bg-white hover:border-black transition-all duration-500 flex flex-col items-start text-left">
                <FiSliders size={32} className="text-black mb-6" />
                <h3 className="font-serif text-[22px] font-semibold text-black mb-4">
                  Tinh tế trong từng đường nét
                </h3>
                <p className="body-md text-neutral-500 text-sm font-light leading-relaxed">
                  Chúng tôi theo đuổi chủ nghĩa tối giản nhưng không đơn điệu. Mỗi thiết kế là một tác phẩm kiến trúc thu nhỏ tôn vinh đường nét cơ thể.
                </p>
              </div>

              {/* Philosophy 2 */}
              <div className="group p-8 border border-neutral-200 bg-white hover:border-black transition-all duration-500 flex flex-col items-start text-left">
                <FiAward size={32} className="text-black mb-6" />
                <h3 className="font-serif text-[22px] font-semibold text-black mb-4">
                  Chất liệu thượng hạng
                </h3>
                <p className="body-md text-neutral-500 text-sm font-light leading-relaxed">
                  Tuyển chọn những loại vải tốt nhất từ các nhà cung ứng lâu đời thế giới: lụa tơ tằm nguyên bản, len cashmere mềm mịn và linen tự nhiên bền bỉ.
                </p>
              </div>

              {/* Philosophy 3 */}
              <div className="group p-8 border border-neutral-200 bg-white hover:border-black transition-all duration-500 flex flex-col items-start text-left">
                <FiEye size={32} className="text-black mb-6" />
                <h3 className="font-serif text-[22px] font-semibold text-black mb-4">
                  Bền vững & Trách nhiệm
                </h3>
                <p className="body-md text-neutral-500 text-sm font-light leading-relaxed">
                  Hướng tới thời trang bền vững thông qua quy trình cắt may thủ công có trách nhiệm, hạn chế tối đa hao tổn tài nguyên và thiết kế bền lâu.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Bento Grid Gallery Section */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-16 py-32 text-left">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 select-none">
            <div className="max-w-xl">
              <span className="label-sm text-xs text-neutral-500 tracking-widest uppercase mb-3 block font-bold">
                Quy Trình Sáng Tạo
              </span>
              <h2 className="font-serif text-[32px] md:text-[44px] font-semibold text-black uppercase tracking-normal leading-tight">
                Sức Sống Của Nghề Thủ Công.
              </h2>
            </div>
            <div className="h-[1px] bg-neutral-300 mb-5 hidden md:block flex-grow mx-12" />
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[800px] select-none">
            
            {/* Block 1 (Large left pane) */}
            <div className="md:col-span-2 md:row-span-2 overflow-hidden relative group aspect-[3/4] md:aspect-auto border border-neutral-200">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAEV5iKh3KvuYGbHn75Yqlorb0ZMxdWKZouSfExOppFp3StJyiG_3jgVweIPpk8Ji2znR9aXYjpoxFAXFASpMeMRScsaRBoUCGLhgF69JYn7r3cqG-UdwaRC53FZxQbjQPUfivzQQrV5-hAOIS9sBpwRbVUwGJAUKxkVy32U4T76K7NHYCPIHgYud7fUiBvwQVbFVlNP0Gh0yh577dddk_4hgFDz2T-ZmZrsv0LRebM7XVT_gf7F_apQRO5pV-x2sOtBtK4QLnOt68')",
                }}
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                <p className="text-white label-sm text-xs font-bold tracking-widest">CHẤT LIỆU</p>
              </div>
            </div>

            {/* Block 2 (Top right wide pane) */}
            <div className="md:col-span-2 md:row-span-1 overflow-hidden relative group aspect-[16/9] md:aspect-auto border border-neutral-200">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCkVVgr2tP6QIlhd_59ExIPrDuHpkxiA0jAxo25D0Jvp2XxkAhEQFdCdQsiPwySS-cuJIIYlBt89gs69_F8iWh4X063uW56STLPBE2vvAdBP121zYhhnPOmZ0sAAJ68-k6qj2OJ8koIzttIGy3IlvgB9OajRrqbWjIEb15p5eZql4zZPF6yI2A0gMehNsL2DhmRyz4vNjepx2ci0SZfwNyXf7vMQtRZD-_87fJlw50nU-vqDTj34OVIb57q4ZHv5apWMfSxDqCZFSQ')",
                }}
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                <p className="text-white label-sm text-xs font-bold tracking-widest">ĐỜI SỐNG XƯỞNG MAY</p>
              </div>
            </div>

            {/* Block 3 (Bottom middle small pane) */}
            <div className="md:col-span-1 md:row-span-1 overflow-hidden relative group aspect-square md:aspect-auto border border-neutral-200">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCyjmwT_jQ1JcVuwQ_7bxgxoIj0uSkvqXzL04LYl0YxW0hknNbc-MfGdVRQfx7Zk2_zMdBzpLOyoxwrU6v_tGSZvOZIxVFmPonHYy08g5xYFTR2YMQaUMRiUJi3w-OaejGtXezZYEhRqN6jyiHbabni5QvS_CtKuVv15AyTvwkMyNm5Yb96xpwfWv02YJTcman85rUQFcDd4JSxkpf2CPfrsYGYJDW-arSi33ztJaXu6lKc50f94LyH48CNNMStBg7KrUkSrKy7tBU')",
                }}
              />
            </div>

            {/* Block 4 (Bottom right small pane) */}
            <div className="md:col-span-1 md:row-span-1 overflow-hidden relative group aspect-square md:aspect-auto border border-neutral-200">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwdAyPlUjWd9Kgoj1TROMWr87EFZur3jy90IK9idJTABYBNbJhEXDmEYRdSulR6VMqVhO9Zau3nsCmytF51lxf4_iISRl6gD77-smTDHqJDKE11TVQj3FQYrpGSnBsYYQVd5WG5gVSbzXC6d-koUaZmdleEkEZRpHLPwcJ7itt--htfb_Hs__cfLBFYAMs7Jg96AXhs02FSgqIKL8udTB4bm-KEjDfTroD6OLJRiREG0TGrhCSF5UQwl0kBhA0P8Tx0iEUVslu3BY')",
                }}
              />
            </div>

          </div>
        </section>

        {/* Founder Quote Section */}
        <section className="bg-neutral-100 py-32 overflow-hidden relative">
          
          {/* Watermark branding element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none">
            <span className="font-serif text-[120px] md:text-[220px] leading-none font-bold">LUMIÈRE</span>
          </div>

          <div className="max-w-[1440px] mx-auto px-6 md:px-16 relative z-10 text-center">
            <div className="max-w-3xl mx-auto flex flex-col items-center gap-10">
              {/* Quote marks icon */}
              <span className="font-serif text-[64px] leading-none text-neutral-300 select-none">“</span>
              
              <blockquote className="font-serif text-[22px] md:text-[34px] italic text-black leading-snug font-medium">
                Thời trang không chỉ là những gì chúng ta mặc, mà là cách chúng ta giao tiếp với thế giới mà không cần lời nói. Tại LUMIÈRE, chúng tôi kiến tạo những giá trị vĩnh cửu thay vì đuổi theo những xu hướng nhất thời.
              </blockquote>

              <div className="select-none">
                <p className="label-sm text-[11px] text-black font-bold tracking-widest uppercase mb-1.5">Thanh Van Nguyen</p>
                <p className="body-md text-neutral-500 text-xs tracking-wider uppercase font-semibold">Founder & Creative Director</p>
              </div>
            </div>
          </div>
        </section>

      </main>
      
      <Footer variant="detailed" />
    </div>
  );
};

export default About;
