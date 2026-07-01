import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";

// High-fidelity editorial fashion image URLs from Unsplash
const HERO_BG = "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop";
const ARCHIVE_BG = "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=1200&auto=format&fit=crop";
const PROD_BLAZER = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop";
const PROD_TROUSERS = "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop";
const PROD_SWEATER = "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop";
const PROD_SHIRT = "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=600&auto=format&fit=crop";

const Home = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
      }, 3000);
    }
  };

  const featuredProducts = [
    {
      id: "blazer",
      name: "Silk Blazer",
      price: "4.500.000đ",
      color: "MIDNIGHT BLACK",
      image: PROD_BLAZER,
    },
    {
      id: "trousers",
      name: "Wool Trousers",
      price: "2.800.000đ",
      color: "OATMEAL",
      image: PROD_TROUSERS,
    },
    {
      id: "sweater",
      name: "Cashmere Sweater",
      price: "3.500.000đ",
      color: "FOREST GREEN",
      image: PROD_SWEATER,
    },
    {
      id: "shirt",
      name: "Poplin Shirt",
      price: "1.000.000đ",
      color: "OPTIC WHITE",
      image: PROD_SHIRT,
    },
  ];

  return (
    <div className="bg-[#fbf9f9] text-black w-full min-h-screen flex flex-col font-dmsans">
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-neutral-900">
          <img
            src={HERO_BG}
            alt="Autumn Winter 2024 Hero"
            className="w-full h-full object-cover opacity-85 object-[center_20%]"
          />
          {/* Subtle vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative h-full max-w-[1440px] mx-auto px-6 md:px-16 flex flex-col justify-end pb-24 md:pb-32 text-white">
          <div className="max-w-[550px]">
            <span className="label-sm text-white/90 tracking-[0.25em] text-xs font-semibold mb-4 block">
              AUTUMN WINTER 2024
            </span>
            <h1 className="font-serif text-[42px] md:text-[64px] font-bold leading-[1.1] uppercase tracking-normal mb-6">
              THE NEW CLASSIC
            </h1>
            <p className="text-white/80 font-normal leading-relaxed text-sm md:text-base mb-8 font-dmsans">
              Khám phá sự giao thoa giữa nghệ thuật cắt may tinh xảo và phong
              cách đương đại trong bộ sưu tập Thu Đông mới nhất của chúng tôi.
            </p>
            <Button
              variant="white"
              onClick={() => navigate("/product")}
              className="px-10 py-4.5"
            >
              MUA NGAY
            </Button>
          </div>
        </div>
      </section>

      {/* 2. PROMO BANNER SECTION (END OF SEASON SALE) */}
      <section className="bg-black text-white py-12 px-6 md:px-16">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-normal uppercase tracking-wider mb-2">
              END OF SEASON SALE
            </h2>
            <p className="label-sm text-neutral-400 tracking-[0.2em] text-[10px] md:text-xs">
              UP TO 50% OFF ON SELECTED ITEMS
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-6 lg:gap-12 max-w-xl">
            <p className="text-neutral-300 text-xs md:text-sm font-light leading-relaxed">
              Limited time offer. Discover our curated collection of timeless
              pieces at exceptional prices.
            </p>
            <Button
              variant="white"
              onClick={() => navigate("/product")}
              className="whitespace-nowrap px-8 py-3.5 self-start"
            >
              SHOP NOW
            </Button>
          </div>
        </div>
      </section>

      {/* 3. PHILOSOPHY SECTION */}
      <section className="bg-[#fbf9f9] py-24 md:py-32 px-6 md:px-16">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <div>
            <span className="label-sm text-neutral-500 tracking-[0.2em] text-xs font-semibold mb-4 block">
              PHILOSOPHY
            </span>
            <h2 className="font-serif text-[32px] md:text-[44px] font-medium leading-[1.2] text-black">
              Vẻ đẹp trường tồn qua từng đường kim mũi chỉ.
            </h2>
          </div>
          <div className="flex flex-col justify-between items-start gap-8">
            <p className="body-lg text-neutral-600 font-light leading-relaxed text-base md:text-lg">
              Tại LUMIÈRE, chúng tôi tin rằng thời trang không chỉ là vẻ bề ngoài
              mà là cách chúng ta cảm nhận về bản thân. Mỗi thiết kế đều được chế
              tác từ những chất liệu cao cấp nhất, hướng tới sự tinh giản tối đa
              để tôn vinh khí chất riêng biệt.
            </p>
            <Link
              to="/about"
              className="label-sm text-black font-semibold border-b border-black pb-1 hover:text-neutral-600 hover:border-neutral-600 transition-colors"
            >
              KHÁM PHÁ DI SẢN CỦA CHÚNG TÔI
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS SECTION */}
      <section className="bg-[#fbf9f9] pb-24 md:pb-32 px-6 md:px-16">
        <div className="max-w-[1440px] mx-auto">
          {/* Header row */}
          <div className="flex justify-between items-baseline mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-wide text-black">
              Sản phẩm tiêu biểu
            </h2>
            <Link
              to="/product"
              className="label-sm text-black font-bold tracking-widest text-[11px] border-b border-black pb-0.5 hover:text-neutral-600 hover:border-neutral-600 transition-all"
            >
              XEM TẤT CẢ
            </Link>
          </div>

          {/* Grid of Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                image={product.image}
                name={product.name}
                price={product.price}
                color={product.color}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4.5. THE ARCHIVE SERIES HERO SECTION */}
      <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-neutral-900">
          <img
            src={ARCHIVE_BG}
            alt="The Archive Series"
            className="w-full h-full object-cover opacity-90 object-center"
          />
          {/* Subtle gradient overlay to make the text highly readable */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/45 via-black/15 to-transparent"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative h-full max-w-[1440px] mx-auto px-6 md:px-16 flex flex-col justify-center items-end text-white text-right z-10">
          <div className="max-w-[500px] flex flex-col items-end">
            <span className="label-sm text-white/90 tracking-[0.25em] text-xs font-semibold mb-3 block uppercase">
              THE ARCHIVE SERIES
            </span>
            <h2 className="font-serif text-[38px] md:text-[54px] font-medium leading-[1.15] uppercase tracking-normal mb-6">
              TÂM HỒN CỦA SỰ <br /> TINH TẾ
            </h2>
            <p className="text-white/80 font-light leading-relaxed text-xs md:text-sm mb-8 max-w-[450px]">
              Nơi những giá trị truyền thống gặp gỡ tư duy hiện đại. Mỗi thiết kế
              là một lời khẳng định về phong cách sống tối giản nhưng đầy chiều sâu.
            </p>
            <Button
              variant="white"
              onClick={() => navigate("/product")}
              className="px-9 py-4 font-semibold text-[11px] tracking-widest"
            >
              KHÁM PHÁ NGAY
            </Button>
          </div>
        </div>
      </section>

      {/* 5. NEWSLETTER SECTION */}
      <section className="bg-[#f2f0f0] py-20 px-6 md:px-16 text-center select-none">
        <div className="max-w-[600px] mx-auto flex flex-col items-center gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-wide text-black uppercase">
              LUMIÈRE Archive
            </h2>
            <p className="body-md text-neutral-600 text-xs md:text-sm font-light">
              Đăng ký để nhận được thông tin về các bộ sưu tập mới nhất và ưu đãi
              đặc quyền dành riêng cho bạn.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full flex items-end gap-0 border-b border-black pb-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Địa chỉ email của bạn"
              required
              className="w-full py-3.5 bg-transparent outline-none font-dmsans text-sm placeholder-neutral-500 text-black"
            />
            <button
              type="submit"
              className="bg-black text-white hover:bg-neutral-800 transition-all font-semibold text-xs tracking-widest uppercase px-8 py-3.5 whitespace-nowrap active:scale-[0.98]"
            >
              ĐĂNG KÝ
            </button>
          </form>

          {submitted && (
            <p className="text-emerald-700 font-semibold text-xs animate-fade-in">
              Cảm ơn bạn đã đăng ký LUMIÈRE Archive!
            </p>
          )}

          <p className="label-sm text-neutral-400 text-[9px] tracking-widest leading-relaxed uppercase">
            BẰNG CÁCH ĐĂNG KÝ, BẠN ĐỒNG Ý VỚI CHÍNH SÁCH BẢO MẬT CỦA CHÚNG TÔI
          </p>
        </div>
      </section>

      {/* 6. DETAILED FOOTER */}
      <Footer variant="detailed" />
    </div>
  );
};

export default Home;
