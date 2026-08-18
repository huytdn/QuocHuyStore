import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiChevronRight, FiChevronDown, FiZoomIn, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import { useProductDetail, useProducts } from "../hooks/api/useProducts";
import { useAddToCart } from "../hooks/api/useCart";
import { useAuthStore } from "../store/useAuthStore";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isUserLoggedIn = useAuthStore((state) => !!state.accessToken);
  const addToCartMutation = useAddToCart();

  // Fetch product detail from backend
  const { data: product, isLoading: isProductLoading } = useProductDetail(id);

  // Fetch related / recommended products dynamically
  const { data: relatedData } = useProducts({ page: 0, size: 5 });
  const relatedProducts = (relatedData?.content || [])
    .filter((p) => String(p.id) !== String(product?.id) && p.slug !== product?.slug)
    .slice(0, 4);

  // Scroll to top on load or when ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [careOpen, setCareOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Sync states when product data arrives
  useEffect(() => {
    if (product) {
      const initialImage =
        product.colors?.[0]?.imageUrl || product.thumbnailUrl || "";
      setActiveImage(initialImage);

      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0].colorName);
        if (
          product.colors[0].variations &&
          product.colors[0].variations.length > 0
        ) {
          setSelectedSize(product.colors[0].variations[0].size);
        }
      }
    }
  }, [product]);

  const colors = product?.colors || [];
  const activeColorObj =
    colors.find((c) => c.colorName === selectedColor) || colors[0];
  const sizes = activeColorObj?.variations?.map((v) => v.size) || [];
  const selectedVariation =
    activeColorObj?.variations?.find((v) => v.size === selectedSize) ||
    activeColorObj?.variations?.[0];

  const handleAddToCart = () => {
    if (!isUserLoggedIn) {
      toast.warn("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate("/login");
      return;
    }

    const variationId = selectedVariation?.variationId;
    if (!variationId) {
      toast.error("Sản phẩm tạm thời hết hàng hoặc không hợp lệ!");
      return;
    }

    addToCartMutation.mutate(
      { variationId, quantity: 1 },
      {
        onSuccess: () => {
          setAddedToCart(true);
          toast.success("Đã thêm vào giỏ hàng!");
          setTimeout(() => {
            setAddedToCart(false);
          }, 2000);
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Thêm vào giỏ hàng thất bại!");
        },
      }
    );
  };

  const handleBuyNow = () => {
    if (!isUserLoggedIn) {
      toast.warn("Vui lòng đăng nhập để tiến hành mua hàng!");
      navigate("/login");
      return;
    }

    const variationId = selectedVariation?.variationId;
    if (!variationId) {
      toast.error("Sản phẩm tạm thời hết hàng hoặc không hợp lệ!");
      return;
    }

    addToCartMutation.mutate(
      { variationId, quantity: 1 },
      {
        onSuccess: () => {
          navigate("/cart");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Mua hàng thất bại!");
        },
      }
    );
  };

  if (isProductLoading) {
    return (
      <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
        <main className="pt-32 pb-24 max-w-[1440px] mx-auto w-full px-6 md:px-16 flex-grow flex flex-col items-center justify-center">
          <svg
            className="animate-spin h-10 w-10 text-black mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-semibold tracking-wider text-neutral-500">
            Đang tải thông tin sản phẩm...
          </span>
        </main>
        <Footer variant="detailed" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
        <main className="pt-32 pb-24 max-w-[1440px] mx-auto w-full px-6 md:px-16 flex-grow flex flex-col items-center justify-center text-center">
          <h2 className="font-serif text-3xl mb-4 uppercase">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-neutral-500 mb-8 text-sm">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ khỏi hệ thống.
          </p>
          <Link
            to="/product"
            className="bg-black text-white px-8 py-3.5 uppercase text-xs font-bold tracking-widest hover:bg-neutral-800 transition-colors"
          >
            Quay lại bộ sưu tập
          </Link>
        </main>
        <Footer variant="detailed" />
      </div>
    );
  }

  // Price determination
  const currentPrice = selectedVariation?.unitPrice
    ? selectedVariation.unitPrice
    : product.minPrice;

  const formattedPrice = currentPrice
    ? Number(currentPrice).toLocaleString("vi-VN") + "₫"
    : "Liên hệ";

  return (
    <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
      {/* Main Container */}
      <main className="pt-24 pb-16 max-w-[1280px] mx-auto w-full px-6 md:px-10 flex-grow">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 label-sm text-[10px] text-neutral-500 tracking-widest select-none">
          <Link to="/" className="hover:text-black transition-colors">
            Trang chủ
          </Link>
          <FiChevronRight size={12} className="text-neutral-400" />
          <Link to="/product" className="hover:text-black transition-colors">
            {product.categoryName || "Bộ sưu tập"}
          </Link>
          <FiChevronRight size={12} className="text-neutral-400" />
          <span className="text-black font-semibold">{product.name}</span>
        </nav>

        {/* Product Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Gallery Column */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Main Product Image */}
            <div className="w-full max-w-[460px] aspect-[3/4] overflow-hidden bg-[#efeded] relative group select-none mx-auto lg:mx-0">
              <img
                src={activeImage || product.thumbnailUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {(activeImage || product.thumbnailUrl) && (
                <div className="absolute bottom-5 right-5 flex flex-col gap-2">
                  <button
                    onClick={() => setIsZoomed(true)}
                    className="bg-white/70 hover:bg-white text-black p-3 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                    aria-label="Zoom Image"
                  >
                    <FiZoomIn size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Product Details Column */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            {/* Title & Price */}
            <div className="flex flex-col gap-2">
              <h1 className="font-serif text-[26px] md:text-[32px] leading-tight font-medium tracking-normal text-black">
                {product.name}
              </h1>
              <p className="font-serif text-lg md:text-xl text-black font-medium tracking-wide">
                {formattedPrice}
              </p>
            </div>

            {/* Description */}
            <p className="body-md text-neutral-600 leading-relaxed text-sm md:text-base">
              {product.description ||
                "Một thiết kế biểu tượng của LUMIÈRE, thể hiện vẻ đẹp sang trọng, đẳng cấp cùng đường cắt may hoàn hảo."}
            </p>

            {/* Color Selector */}
            {colors.length > 0 && (
              <div className="flex flex-col gap-4">
                <span className="label-sm text-xs font-bold text-black tracking-widest uppercase">
                  Màu sắc
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  {colors.map((c) => (
                    <button
                      key={c.colorName}
                      onClick={() => {
                        setSelectedColor(c.colorName);
                        if (c.imageUrl) {
                          setActiveImage(c.imageUrl);
                        }
                        if (c.variations?.length > 0) {
                          setSelectedSize(c.variations[0].size);
                        }
                      }}
                      className={`px-4 py-2 border text-xs tracking-wider transition-all duration-300 font-semibold cursor-pointer ${
                        selectedColor === c.colorName
                          ? "border-black bg-black text-white"
                          : "border-neutral-300 hover:border-black text-black"
                      }`}
                    >
                      {c.colorName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <span className="label-sm text-xs font-bold text-black tracking-widest uppercase">
                    Kích thước
                  </span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="label-sm text-[10px] text-neutral-500 underline underline-offset-4 hover:text-black transition-colors cursor-pointer"
                  >
                    Bảng size
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3 select-none">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 border transition-all duration-300 font-sans font-semibold text-xs tracking-wider flex items-center justify-center cursor-pointer ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-neutral-300 hover:border-black text-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Button */}
            <div className="flex flex-col gap-3.5 mt-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white h-14 label-sm font-semibold tracking-[0.2em] hover:bg-neutral-800 transition-all duration-300 active:scale-[0.99] cursor-pointer flex items-center justify-center uppercase text-xs"
              >
                {addedToCart ? "Đã thêm vào giỏ hàng!" : "Thêm vào giỏ hàng"}
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full border border-black text-black bg-transparent h-14 label-sm font-semibold tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 active:scale-[0.99] cursor-pointer uppercase text-xs"
              >
                Mua ngay
              </button>
            </div>

            {/* Product Details Accordion */}
            <div className="border-t border-neutral-200 pt-6 mt-4">
              {/* Tab 1: Chi tiết sản phẩm */}
              <div className="border-b border-neutral-200/60 pb-4">
                <button
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="w-full flex justify-between items-center cursor-pointer font-sans text-xs uppercase tracking-widest font-bold text-black py-2 hover:text-neutral-600 transition-colors"
                >
                  <span>Chi tiết sản phẩm</span>
                  <span
                    className={`transform transition-transform duration-350 ${
                      detailsOpen ? "rotate-180" : ""
                    }`}
                  >
                    <FiChevronDown size={18} />
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-350 ease-in-out ${
                    detailsOpen
                      ? "max-h-60 mt-4 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="font-sans text-sm text-neutral-600 flex flex-col gap-2 pb-2">
                    <div className="flex justify-between border-b border-neutral-100 py-2">
                      <span className="font-medium text-black">Danh mục</span>
                      <span>{product.categoryName || "Đang cập nhật"}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 py-2">
                      <span className="font-medium text-black">Mã sản phẩm</span>
                      <span>LMR-PROD-{String(product.id).padStart(3, "0")}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 py-2">
                      <span className="font-medium text-black">Sản xuất</span>
                      <span>Thủ công tại Việt Nam</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab 2: Hướng dẫn bảo quản */}
              <div className="border-b border-neutral-200/60 py-4">
                <button
                  onClick={() => setCareOpen(!careOpen)}
                  className="w-full flex justify-between items-center cursor-pointer font-sans text-xs uppercase tracking-widest font-bold text-black py-2 hover:text-neutral-600 transition-colors"
                >
                  <span>Hướng dẫn bảo quản</span>
                  <span
                    className={`transform transition-transform duration-350 ${
                      careOpen ? "rotate-180" : ""
                    }`}
                  >
                    <FiChevronDown size={18} />
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-350 ease-in-out ${
                    careOpen ? "max-h-60 mt-4 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="font-sans text-sm text-neutral-600 flex flex-col gap-2.5 pb-2 leading-relaxed">
                    <p>• Bảo quản nơi khô ráo, thoáng mát</p>
                    <p>• Tránh tiếp xúc trực tiếp với hóa chất tẩy rửa mạnh</p>
                    <p>• Giặt nhẹ tay hoặc sử dụng dịch vụ giặt khô chuyên nghiệp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related / Recommended Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-32 border-t border-neutral-200 pt-16">
            <div className="flex justify-between items-end mb-16">
              <h2 className="font-serif text-[28px] md:text-[34px] font-medium tracking-normal text-black uppercase">
                Sản phẩm tương đồng
              </h2>
              <Link
                to="/product"
                className="label-sm text-xs font-semibold text-neutral-500 hover:text-black underline underline-offset-8 transition-colors select-none"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
              {relatedProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/product/${item.slug || item.id}`)}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="aspect-[2/3] overflow-hidden bg-[#efeded] mb-5">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <h3 className="body-md text-black font-normal truncate pr-4">
                    {item.name}
                  </h3>
                  <p className="label-sm text-neutral-500 font-semibold mt-1.5">
                    {item.minPrice
                      ? Number(item.minPrice).toLocaleString("vi-VN") + "₫"
                      : "Liên hệ"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer variant="detailed" />

      {/* Image Fullscreen Zoom Modal */}
      {isZoomed && (activeImage || product.thumbnailUrl) && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 text-white hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer p-2"
            aria-label="Close Zoom"
          >
            <FiX size={32} />
          </button>
          <img
            src={activeImage || product.thumbnailUrl}
            alt={product.name}
            className="max-w-full max-h-[92vh] object-contain select-none shadow-2xl transition-transform duration-300"
          />
        </div>
      )}

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fade-in"
          onClick={() => setIsSizeGuideOpen(false)}
        >
          <div
            className="bg-[#fcfbf9] max-w-3xl w-full p-6 md:p-8 relative shadow-2xl overflow-y-auto max-h-[92vh] flex flex-col rounded-md border border-[#e5ded4]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-black p-2 transition-colors cursor-pointer rounded-full hover:bg-neutral-200/60 active:scale-95 z-10"
              aria-label="Đóng hướng dẫn"
            >
              <FiX size={24} />
            </button>

            {/* Rendered LUMIÈRE Size Guide Card */}
            <div className="w-full bg-[#FAF8F5] p-6 md:p-8 rounded-md border border-[#E3DAC8] shadow-sm flex flex-col items-center">
              {/* Logo Brand Header */}
              <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-[0.25em] text-[#B88E28] uppercase text-center mb-8">
                LUMIÈRE
              </h2>

              {/* Grid 2 Tables: TOPS and BOTTOMS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                {/* Left Table: TOPS */}
                <div className="flex flex-col items-center">
                  {/* Suit Jacket Icon */}
                  <div className="mb-3 text-[#B88E28]">
                    <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                      <path d="M6 3h12l1 6-4 3 2 9H7l2-9-4-3 1-6z" />
                      <path d="M12 3v9" />
                      <path d="M9 3l3 4 3-4" />
                    </svg>
                  </div>
                  
                  {/* Table Box */}
                  <div className="w-full border border-[#D5CBB5] bg-white text-center shadow-xs">
                    <div className="bg-[#F3EDE2] font-serif text-base tracking-widest font-semibold text-[#2C2825] py-2 border-b border-[#D5CBB5] uppercase">
                      TOPS
                    </div>
                    <table className="w-full text-xs font-sans">
                      <thead>
                        <tr className="bg-[#FAF6EE] text-[#554D43] font-bold border-b border-[#D5CBB5]">
                          <th className="py-2 px-1 border-r border-[#D5CBB5]">SIZE</th>
                          <th className="py-2 px-1 border-r border-[#D5CBB5]">CHEST</th>
                          <th className="py-2 px-1 border-r border-[#D5CBB5]">WAIST</th>
                          <th className="py-2 px-1">SLEEVE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EADFCB] text-[#332E29]">
                        <tr className="hover:bg-[#FAF6EE]/50">
                          <td className="py-2 font-semibold border-r border-[#D5CBB5]">S</td>
                          <td className="py-2 border-r border-[#D5CBB5]">34-36</td>
                          <td className="py-2 border-r border-[#D5CBB5]">28-30</td>
                          <td className="py-2">32</td>
                        </tr>
                        <tr className="hover:bg-[#FAF6EE]/50">
                          <td className="py-2 font-semibold border-r border-[#D5CBB5]">M</td>
                          <td className="py-2 border-r border-[#D5CBB5]">38-40</td>
                          <td className="py-2 border-r border-[#D5CBB5]">32-34</td>
                          <td className="py-2">33</td>
                        </tr>
                        <tr className="hover:bg-[#FAF6EE]/50">
                          <td className="py-2 font-semibold border-r border-[#D5CBB5]">L</td>
                          <td className="py-2 border-r border-[#D5CBB5]">40-42</td>
                          <td className="py-2 border-r border-[#D5CBB5]">34-36</td>
                          <td className="py-2">34</td>
                        </tr>
                        <tr className="hover:bg-[#FAF6EE]/50">
                          <td className="py-2 font-semibold border-r border-[#D5CBB5]">XL</td>
                          <td className="py-2 border-r border-[#D5CBB5]">42-44</td>
                          <td className="py-2 border-r border-[#D5CBB5]">36-38</td>
                          <td className="py-2">35</td>
                        </tr>
                        <tr className="hover:bg-[#FAF6EE]/50">
                          <td className="py-2 font-semibold border-r border-[#D5CBB5]">2XL</td>
                          <td className="py-2 border-r border-[#D5CBB5]">46-48</td>
                          <td className="py-2 border-r border-[#D5CBB5]">40-42</td>
                          <td className="py-2">36</td>
                        </tr>
                        <tr className="hover:bg-[#FAF6EE]/50">
                          <td className="py-2 font-semibold border-r border-[#D5CBB5]">3XL</td>
                          <td className="py-2 border-r border-[#D5CBB5]">50-52</td>
                          <td className="py-2 border-r border-[#D5CBB5]">44-46</td>
                          <td className="py-2">37</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Table: BOTTOMS */}
                <div className="flex flex-col items-center">
                  {/* Trousers Icon */}
                  <div className="mb-3 text-[#B88E28]">
                    <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                      <path d="M7 3h10v3l-1 15h-3l-1-9-1 9H8L7 6V3z" />
                      <path d="M7 6h10" />
                    </svg>
                  </div>

                  {/* Table Box */}
                  <div className="w-full border border-[#D5CBB5] bg-white text-center shadow-xs">
                    <div className="bg-[#F3EDE2] font-serif text-base tracking-widest font-semibold text-[#2C2825] py-2 border-b border-[#D5CBB5] uppercase">
                      BOTTOMS
                    </div>
                    <table className="w-full text-xs font-sans">
                      <thead>
                        <tr className="bg-[#FAF6EE] text-[#554D43] font-bold border-b border-[#D5CBB5]">
                          <th className="py-2 px-1 border-r border-[#D5CBB5]">SIZE</th>
                          <th className="py-2 px-1 border-r border-[#D5CBB5]">WAIST</th>
                          <th className="py-2 px-1 border-r border-[#D5CBB5]">HIP</th>
                          <th className="py-2 px-1">INSEAM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EADFCB] text-[#332E29]">
                        <tr className="hover:bg-[#FAF6EE]/50">
                          <td className="py-2 font-semibold border-r border-[#D5CBB5]">S</td>
                          <td className="py-2 border-r border-[#D5CBB5]">28-30</td>
                          <td className="py-2 border-r border-[#D5CBB5]">34-36</td>
                          <td className="py-2">30</td>
                        </tr>
                        <tr className="hover:bg-[#FAF6EE]/50">
                          <td className="py-2 font-semibold border-r border-[#D5CBB5]">M</td>
                          <td className="py-2 border-r border-[#D5CBB5]">32-34</td>
                          <td className="py-2 border-r border-[#D5CBB5]">38-40</td>
                          <td className="py-2">31</td>
                        </tr>
                        <tr className="hover:bg-[#FAF6EE]/50">
                          <td className="py-2 font-semibold border-r border-[#D5CBB5]">L</td>
                          <td className="py-2 border-r border-[#D5CBB5]">34-36</td>
                          <td className="py-2 border-r border-[#D5CBB5]">40-42</td>
                          <td className="py-2">31</td>
                        </tr>
                        <tr className="hover:bg-[#FAF6EE]/50">
                          <td className="py-2 font-semibold border-r border-[#D5CBB5]">XL</td>
                          <td className="py-2 border-r border-[#D5CBB5]">36-38</td>
                          <td className="py-2 border-r border-[#D5CBB5]">42-44</td>
                          <td className="py-2">31</td>
                        </tr>
                        <tr className="hover:bg-[#FAF6EE]/50">
                          <td className="py-2 font-semibold border-r border-[#D5CBB5]">2XL</td>
                          <td className="py-2 border-r border-[#D5CBB5]">38-40</td>
                          <td className="py-2 border-r border-[#D5CBB5]">46-48</td>
                          <td className="py-2">31</td>
                        </tr>
                        <tr className="hover:bg-[#FAF6EE]/50">
                          <td className="py-2 font-semibold border-r border-[#D5CBB5]">3XL</td>
                          <td className="py-2 border-r border-[#D5CBB5]">42-44</td>
                          <td className="py-2 border-r border-[#D5CBB5]">50-52</td>
                          <td className="py-2">31</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
