import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { toast } from "react-toastify";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { useProducts } from "../hooks/api/useProducts";
import { useToggleLike } from "../hooks/api/useLikes";
import { useAuthStore } from "../store/useAuthStore";

const Product = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isUserLoggedIn = useAuthStore((state) => !!state.accessToken);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePage, setActivePage] = useState(1);

  const toggleLikeMutation = useToggleLike();

  const { data: pageData, isLoading: isProductsLoading, isError } = useProducts({
    page: activePage - 1,
    size: 12,
    search: searchQuery || undefined,
  });

  const backendProducts = pageData?.content || [];
  const totalPages = pageData?.totalPages || 0;

  const handleToggleLike = (productId, productName) => {
    if (!isUserLoggedIn) {
      toast.warn("Vui lòng đăng nhập để lưu sản phẩm yêu thích!");
      navigate("/login", { state: { from: location } });
      return;
    }

    toggleLikeMutation.mutate(productId, {
      onSuccess: (res) => {
        if (res.isLiked) {
          toast.success(`Đã thêm "${productName}" vào danh sách yêu thích!`);
        } else {
          toast.info(`Đã xóa "${productName}" khỏi danh sách yêu thích!`);
        }
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Không thể cập nhật yêu thích!");
      },
    });
  };

  const displayProducts = backendProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug || p.id,
    price: p.minPrice ? Number(p.minPrice).toLocaleString("vi-VN") + "đ" : "Liên hệ",
    image: p.thumbnailUrl,
    isLikedByMe: !!p.isLikedByMe,
  }));

  return (
    <div className="bg-[#fbf9f9] min-h-screen w-full flex flex-col font-dmsans text-black pt-20">
      <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10 py-8 flex-grow">
        
        {/* 1. HERO TITLE SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 mb-10 items-start">
          <div className="lg:col-span-7">
            <span className="label-sm text-neutral-500 tracking-[0.25em] text-[10px] md:text-xs font-semibold mb-2 block">
              SẢN PHẨM
            </span>
            <h1 className="font-serif text-[30px] md:text-[38px] font-bold leading-[1.1] uppercase tracking-normal">
              Tất cả sản phẩm
            </h1>
          </div>
          <div className="lg:col-span-5 lg:pt-4">
            <p className="body-md text-neutral-600 font-light leading-relaxed text-xs md:text-sm">
              Khám phá toàn bộ danh mục sản phẩm thời trang cao cấp của LUMIÈRE. Những thiết kế tối giản, chất liệu tuyển chọn tinh tế tôn vinh vẻ đẹp trường tồn.
            </p>
          </div>
        </section>

        {/* 2. FILTERS & SEARCH ROW */}
        <section className="border-t border-b border-[#e0e0e0] py-3 flex flex-col md:flex-row justify-between items-center gap-4 mb-8 select-none">
          {/* Left dropdown filters */}
          <div className="flex flex-wrap items-center gap-6 lg:gap-10 w-full md:w-auto">
            <button className="flex items-center gap-2 label-sm text-[11px] font-semibold text-black tracking-widest hover:text-secondary transition-colors cursor-pointer">
              DANH MỤC
              <FiChevronDown size={14} />
            </button>
            <button className="flex items-center gap-2 label-sm text-[11px] font-semibold text-black tracking-widest hover:text-secondary transition-colors cursor-pointer">
              KÍCH CỠ
              <FiChevronDown size={14} />
            </button>
            <button className="flex items-center gap-2 label-sm text-[11px] font-semibold text-black tracking-widest hover:text-secondary transition-colors cursor-pointer">
              MÀU SẮC
              <FiChevronDown size={14} />
            </button>
            <button className="flex items-center gap-2 label-sm text-[11px] font-semibold text-black tracking-widest hover:text-secondary transition-colors cursor-pointer">
              GIÁ
              <FiChevronDown size={14} />
            </button>
          </div>

          {/* Right search input & sort */}
          <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex items-center border-b border-neutral-300 pb-1 w-full sm:w-[220px]">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActivePage(1);
                }}
                className="w-full bg-transparent outline-none font-dmsans text-xs placeholder-neutral-400 text-black pr-6"
              />
              <FiSearch size={14} className="absolute right-0 text-neutral-500 pointer-events-none" />
            </div>

            {/* Sắp xếp */}
            <button className="flex items-center gap-2 label-sm text-[11px] font-semibold text-black tracking-widest hover:text-secondary transition-colors whitespace-nowrap cursor-pointer">
              SẮP XẾP
              <FiChevronDown size={14} />
            </button>
          </div>
        </section>

        {/* 3. PRODUCT GRID */}
        <section className="mb-16">
          {isProductsLoading ? (
            <div className="text-center py-20">
              <svg className="animate-spin h-8 w-8 text-black mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-neutral-500 font-light text-sm">Đang tải danh sách sản phẩm...</p>
            </div>
          ) : isError || displayProducts.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 font-light text-sm">
              Hiện không có sản phẩm vui lòng thử lại
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  slug={product.slug}
                  layout="collection"
                  isLiked={product.isLikedByMe}
                  onToggleLike={() => handleToggleLike(product.id, product.name)}
                  onClick={() => navigate(`/product/${product.slug}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 4. PAGINATION */}
        {totalPages > 1 && (
          <section className="flex flex-col items-center gap-8 py-4 select-none">
            <div className="flex items-center gap-4 mt-2">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                const pageStr = String(pageNum).padStart(2, "0");
                const isActive = activePage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setActivePage(pageNum)}
                    className={`label-sm text-xs tracking-wider cursor-pointer ${
                      isActive
                        ? "text-black border-b border-black pb-0.5 font-bold"
                        : "text-neutral-500 hover:text-black pb-0.5"
                    }`}
                  >
                    {pageStr}
                  </button>
                );
              })}
            </div>
          </section>
        )}

      </div>

      {/* 5. COLLECTION FOOTER */}
      <Footer variant="collection" />
    </div>
  );
};

export default Product;
