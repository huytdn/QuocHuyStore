import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingBag, FiArrowLeft, FiChevronRight } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { useLikedProducts, useToggleLike } from "../hooks/api/useLikes";
import { useAuthStore } from "../store/useAuthStore";

const Wishlist = () => {
  const navigate = useNavigate();
  const isUserLoggedIn = useAuthStore((state) => !!state.accessToken);
  const [activePage, setActivePage] = useState(1);

  const { data: pageData, isLoading, isError } = useLikedProducts({
    page: activePage - 1,
    size: 12,
  });

  const toggleLikeMutation = useToggleLike();

  const likedProducts = pageData?.content || [];
  const totalElements = pageData?.totalElements || 0;
  const totalPages = pageData?.totalPages || 0;

  const handleToggleLike = (productId, productName) => {
    toggleLikeMutation.mutate(productId, {
      onSuccess: (res) => {
        if (res.isLiked) {
          toast.success(`Đã thêm "${productName}" vào danh sách yêu thích!`);
        } else {
          toast.info(`Đã xóa "${productName}" khỏi danh sách yêu thích!`);
        }
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Không thể cập nhật danh sách yêu thích!");
      },
    });
  };

  return (
    <div className="bg-[#fbf9f9] min-h-screen w-full flex flex-col font-dmsans text-black pt-20">
      <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10 py-8 flex-grow">
        {/* 1. BREADCRUMB */}
        <nav className="flex items-center gap-2 mb-8 label-sm text-[10px] text-neutral-500 tracking-widest select-none">
          <Link to="/" className="hover:text-black transition-colors">
            Trang chủ
          </Link>
          <FiChevronRight size={12} className="text-neutral-400" />
          <Link to="/profile" className="hover:text-black transition-colors">
            Tài khoản
          </Link>
          <FiChevronRight size={12} className="text-neutral-400" />
          <span className="text-black font-semibold uppercase">Sản phẩm yêu thích</span>
        </nav>

        {/* 2. HERO TITLE SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 mb-10 items-start">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-2">
              <FaHeart size={14} className="text-red-600" />
              <span className="label-sm text-neutral-500 tracking-[0.25em] text-[10px] md:text-xs font-semibold block">
                DANH SÁCH YÊU THÍCH
              </span>
            </div>
            <h1 className="font-serif text-[30px] md:text-[40px] font-bold leading-[1.1] uppercase tracking-normal">
              Sản phẩm yêu thích
            </h1>
            <p className="text-xs text-neutral-500 font-medium mt-2">
              {totalElements} {totalElements === 1 ? "sản phẩm đã lưu" : "sản phẩm đã lưu"}
            </p>
          </div>
          <div className="lg:col-span-5 lg:pt-4">
            <p className="body-md text-neutral-600 font-light leading-relaxed text-xs md:text-sm">
              Nơi lưu trữ những thiết kế bạn say mê. Theo dõi giá và kích cỡ sẵn có để dễ dàng bổ sung vào bộ sưu tập cá nhân.
            </p>
          </div>
        </section>

        {/* 3. WISHLIST CONTENT */}
        <section className="mb-16">
          {isLoading ? (
            <div className="text-center py-24">
              <svg className="animate-spin h-8 w-8 text-black mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-neutral-500 font-light text-sm">Đang tải danh sách yêu thích...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-20 bg-white border border-neutral-200 p-12">
              <p className="text-neutral-500 font-light text-sm mb-4">
                Có lỗi xảy ra khi tải danh sách sản phẩm yêu thích.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-black text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          ) : likedProducts.length === 0 ? (
            /* EMPTY STATE */
            <div className="text-center py-20 px-6 bg-white border border-neutral-200 border-dashed max-w-2xl mx-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6">
                <FiHeart size={28} className="stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-black mb-3 uppercase">
                Danh sách yêu thích trống
              </h3>
              <p className="text-neutral-500 font-light text-xs md:text-sm max-w-md leading-relaxed mb-8">
                Bạn chưa lưu sản phẩm nào vào danh sách yêu thích. Hãy khám phá các thiết kế của LUMIÈRE và chạm vào biểu tượng trái tim để lưu lại.
              </p>
              <Link
                to="/product"
                className="bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all active:scale-95 shadow-xs inline-flex items-center gap-2"
              >
                <FiShoppingBag size={14} />
                Khám phá bộ sưu tập
              </Link>
            </div>
          ) : (
            /* PRODUCT GRID */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {likedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.minPrice ? Number(product.minPrice).toLocaleString("vi-VN") + "₫" : "Liên hệ"}
                  image={product.thumbnailUrl}
                  slug={product.slug || product.id}
                  layout="collection"
                  isLiked={true}
                  onToggleLike={() => handleToggleLike(product.id, product.name)}
                  onClick={() => navigate(`/product/${product.slug || product.id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 4. PAGINATION */}
        {totalPages > 1 && (
          <section className="flex flex-col items-center gap-8 py-4 select-none mb-10">
            <div className="flex items-center gap-4 mt-2">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                const pageStr = String(pageNum).padStart(2, "0");
                const isActive = activePage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setActivePage(pageNum)}
                    className={`label-sm text-xs tracking-wider cursor-pointer transition-colors ${
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

      <Footer variant="detailed" />
    </div>
  );
};

export default Wishlist;
