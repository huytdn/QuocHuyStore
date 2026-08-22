import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiStar,
  FiImage,
  FiX,
  FiEye,
  FiFilter,
  FiRefreshCw,
  FiMessageSquare,
  FiCheckCircle,
  FiUser,
  FiCalendar,
  FiPackage,
  FiThumbsUp,
  FiAlertTriangle,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { useAdminReviews } from "../../hooks/api/useAdminReviews";

const AdminReviews = () => {
  // Filter & Pagination state
  const [activePage, setActivePage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL"); // ALL, 5, 4, 3, 2, 1
  const [hasImageFilter, setHasImageFilter] = useState("ALL"); // ALL, WITH_IMAGE, NO_IMAGE
  const [productIdFilter, setProductIdFilter] = useState("");

  // Modal states
  const [selectedReviewDetail, setSelectedReviewDetail] = useState(null);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  // Parse filters for query
  const ratingParam = ratingFilter === "ALL" ? undefined : Number(ratingFilter);
  const hasImageParam =
    hasImageFilter === "ALL"
      ? undefined
      : hasImageFilter === "WITH_IMAGE";
  const productIdParam =
    productIdFilter && !isNaN(productIdFilter)
      ? Number(productIdFilter)
      : undefined;

  // Fetch reviews query
  const { data: pageData, isLoading, isFetching, refetch } = useAdminReviews({
    page: activePage - 1,
    size: 10,
    rating: ratingParam,
    hasImage: hasImageParam,
    search: searchQuery.trim() || undefined,
    productId: productIdParam,
  });

  const reviews = pageData?.content || [];
  const totalElements = pageData?.totalElements || 0;
  const totalPages = pageData?.totalPages || 1;

  // Calculate Metrics from current fetched page or totals
  const metrics = useMemo(() => {
    const total = totalElements;
    const withImage = reviews.filter((r) => !!r.imageUrl).length;
    const positive = reviews.filter((r) => r.rating >= 4).length;
    const critical = reviews.filter((r) => r.rating <= 2).length;
    return { total, withImage, positive, critical };
  }, [totalElements, reviews]);

  // Format Date Helper
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setRatingFilter("ALL");
    setHasImageFilter("ALL");
    setProductIdFilter("");
    setActivePage(1);
    toast.info("Đã đặt lại bộ lọc");
  };

  return (
    <div className="flex bg-[#fcfbf9] min-h-screen text-black font-dmsans">
      {/* Sidebar */}
      <AdminSidebar activeTab="reviews" />

      {/* Main Content */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        <AdminHeader title="Quản lý Đánh giá sản phẩm" />

        <main className="p-8 space-y-8 flex-grow">
          {/* Top Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-black uppercase">
                Đánh giá khách hàng
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Theo dõi phản hồi thực tế từ người mua, kiểm duyệt nội dung nhận xét và trải nghiệm sản phẩm.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="bg-white border border-neutral-300 text-black hover:border-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FiRefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-neutral-200 p-5 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Tổng lượt đánh giá
                </p>
                <p className="text-2xl font-serif font-bold text-black mt-1">
                  {totalElements}
                </p>
              </div>
              <div className="w-11 h-11 bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                <FiMessageSquare size={20} />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-5 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Đánh giá Tích cực (4-5★)
                </p>
                <p className="text-2xl font-serif font-bold text-emerald-600 mt-1">
                  {metrics.positive} <span className="text-xs font-sans text-neutral-400 font-normal">bài (trang)</span>
                </p>
              </div>
              <div className="w-11 h-11 bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <FiThumbsUp size={20} />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-5 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Có ảnh đính kèm
                </p>
                <p className="text-2xl font-serif font-bold text-amber-600 mt-1">
                  {metrics.withImage} <span className="text-xs font-sans text-neutral-400 font-normal">bài (trang)</span>
                </p>
              </div>
              <div className="w-11 h-11 bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <FiImage size={20} />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-5 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Cần lưu ý (1-2★)
                </p>
                <p className="text-2xl font-serif font-bold text-rose-600 mt-1">
                  {metrics.critical} <span className="text-xs font-sans text-neutral-400 font-normal">bài (trang)</span>
                </p>
              </div>
              <div className="w-11 h-11 bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <FiAlertTriangle size={20} />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-neutral-200 p-4 space-y-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              {/* Search Bar */}
              <div className="lg:col-span-4 relative">
                <input
                  type="text"
                  placeholder="Tìm theo tên khách, phân loại, nội dung..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActivePage(1);
                  }}
                  className="w-full bg-[#fbf9f9] border border-neutral-300 pl-10 pr-4 py-2.5 text-xs text-black placeholder-neutral-400 outline-none focus:border-black transition-colors"
                />
                <FiSearch
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                />
              </div>

              {/* Rating Filter Dropdown */}
              <div className="lg:col-span-3">
                <select
                  value={ratingFilter}
                  onChange={(e) => {
                    setRatingFilter(e.target.value);
                    setActivePage(1);
                  }}
                  className="w-full bg-[#fbf9f9] border border-neutral-300 px-3.5 py-2.5 text-xs font-semibold text-black outline-none focus:border-black transition-colors cursor-pointer"
                >
                  <option value="ALL">Tất cả số sao (1 - 5 sao)</option>
                  <option value="5">5 Sao (Tuyệt vời)</option>
                  <option value="4">4 Sao (Tốt)</option>
                  <option value="3">3 Sao (Bình thường)</option>
                  <option value="2">2 Sao (Tệ)</option>
                  <option value="1">1 Sao (Rất tệ)</option>
                </select>
              </div>

              {/* Has Image Filter */}
              <div className="lg:col-span-3">
                <select
                  value={hasImageFilter}
                  onChange={(e) => {
                    setHasImageFilter(e.target.value);
                    setActivePage(1);
                  }}
                  className="w-full bg-[#fbf9f9] border border-neutral-300 px-3.5 py-2.5 text-xs font-semibold text-black outline-none focus:border-black transition-colors cursor-pointer"
                >
                  <option value="ALL">Tất cả bài viết (Có & Không ảnh)</option>
                  <option value="WITH_IMAGE">Chỉ bài viết có hình ảnh</option>
                  <option value="NO_IMAGE">Chỉ bài viết không có ảnh</option>
                </select>
              </div>

              {/* Reset Filter Button */}
              <div className="lg:col-span-2">
                <button
                  onClick={handleResetFilters}
                  className="w-full border border-neutral-300 hover:border-black text-neutral-700 hover:text-black py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FiX size={14} />
                  <span>Xóa lọc</span>
                </button>
              </div>
            </div>

            {/* Optional Product ID Filter Row */}
            <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Mã Sản Phẩm (ID):
              </span>
              <input
                type="number"
                placeholder="Nhập ID sản phẩm..."
                value={productIdFilter}
                onChange={(e) => {
                  setProductIdFilter(e.target.value);
                  setActivePage(1);
                }}
                className="bg-[#fbf9f9] border border-neutral-300 px-3 py-1 text-xs text-black outline-none focus:border-black w-44 font-mono"
              />
              {productIdFilter && (
                <button
                  onClick={() => setProductIdFilter("")}
                  className="text-xs text-neutral-400 hover:text-black underline cursor-pointer"
                >
                  Xóa lọc ID
                </button>
              )}
            </div>
          </div>

          {/* Reviews Table Container */}
          <div className="bg-white border border-neutral-200 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="py-24 text-center">
                <svg
                  className="animate-spin h-8 w-8 text-black mx-auto mb-4"
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
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                  Đang tải danh sách đánh giá...
                </p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-20 text-center select-none">
                <FiMessageSquare
                  size={48}
                  className="text-neutral-300 mx-auto mb-3 stroke-[1.2]"
                />
                <h3 className="font-serif text-lg font-bold text-black mb-1">
                  Chưa có đánh giá nào phù hợp
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
                  {searchQuery || ratingFilter !== "ALL" || hasImageFilter !== "ALL" || productIdFilter
                    ? "Không tìm thấy bài đánh giá phù hợp với điều kiện lọc hiện tại."
                    : "Chưa có lượt đánh giá nào được gửi từ người mua."}
                </p>
                {(searchQuery || ratingFilter !== "ALL" || hasImageFilter !== "ALL" || productIdFilter) && (
                  <button
                    onClick={handleResetFilters}
                    className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                  >
                    Đặt lại bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f5f4f2] text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-200">
                      <th className="py-3.5 px-4 w-16 text-center">ID</th>
                      <th className="py-3.5 px-4">Khách hàng</th>
                      <th className="py-3.5 px-4 text-center">Đánh giá</th>
                      <th className="py-3.5 px-4">Phân loại đã mua</th>
                      <th className="py-3.5 px-4 min-w-[280px]">Nội dung nhận xét</th>
                      <th className="py-3.5 px-4 text-center">Hình ảnh</th>
                      <th className="py-3.5 px-4">Thời gian</th>
                      <th className="py-3.5 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {reviews.map((review) => {
                      const initial = (review.userDisplayName || "U")
                        .charAt(0)
                        .toUpperCase();

                      return (
                        <tr
                          key={review.id}
                          className="hover:bg-neutral-50/60 transition-colors"
                        >
                          {/* ID Column */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-500">
                            #{review.id}
                          </td>

                          {/* Customer Column */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none">
                                {initial}
                              </div>
                              <div className="overflow-hidden">
                                <span className="font-bold text-black block truncate max-w-[140px]">
                                  {review.userDisplayName || "Khách hàng"}
                                </span>
                                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-tight flex items-center gap-1">
                                  <FiCheckCircle size={10} /> Đã mua hàng
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Rating Stars Column */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1 bg-[#fbf8f2] border border-amber-200 px-2 py-1">
                              <span className="font-bold text-xs text-black">
                                {review.rating}.0
                              </span>
                              <div className="flex text-[#E6A117]">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <FaStar
                                    key={s}
                                    size={10}
                                    className={
                                      s <= review.rating
                                        ? "text-[#E6A117]"
                                        : "text-neutral-300"
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          </td>

                          {/* Variation Name Column */}
                          <td className="py-3.5 px-4">
                            {review.variationName ? (
                              <span className="inline-block bg-[#f5f4f2] text-neutral-700 text-[11px] font-semibold px-2.5 py-1 border border-neutral-200 font-mono">
                                {review.variationName}
                              </span>
                            ) : (
                              <span className="text-neutral-400 italic text-[11px]">
                                Mặc định
                              </span>
                            )}
                          </td>

                          {/* Review Content Column */}
                          <td className="py-3.5 px-4 max-w-[320px]">
                            {review.content ? (
                              <p className="text-neutral-800 text-xs line-clamp-2 leading-relaxed">
                                {review.content}
                              </p>
                            ) : (
                              <span className="text-neutral-400 italic text-[11px]">
                                (Người mua không để lại nhận xét bằng lời)
                              </span>
                            )}
                          </td>

                          {/* Attached Image Thumbnail Column */}
                          <td className="py-3.5 px-4 text-center">
                            {review.imageUrl ? (
                              <button
                                onClick={() => setActiveLightboxImg(review.imageUrl)}
                                className="w-10 h-12 bg-neutral-100 border border-neutral-200 overflow-hidden cursor-pointer group relative shadow-xs hover:border-black transition-all mx-auto block"
                                title="Xem ảnh kích thước lớn"
                              >
                                <img
                                  src={review.imageUrl}
                                  alt="Review thumbnail"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                  <FiEye size={12} />
                                </div>
                              </button>
                            ) : (
                              <span className="text-neutral-300 font-mono text-[11px]">
                                Không
                              </span>
                            )}
                          </td>

                          {/* Created Date Column */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-neutral-600 text-[11px]">
                            {formatDateDisplay(review.createdAt)}
                          </td>

                          {/* Actions Column */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedReviewDetail(review)}
                              className="px-3 py-1.5 border border-neutral-300 hover:border-black text-black hover:bg-neutral-100 transition-colors text-[11px] font-bold uppercase cursor-pointer inline-flex items-center gap-1"
                            >
                              <FiEye size={12} />
                              <span>Chi tiết</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-neutral-200 flex items-center justify-between select-none">
                <span className="text-xs text-neutral-500">
                  Hiển thị trang {activePage} trên {totalPages} ({totalElements} đánh giá)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={activePage === 1}
                    onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
                    className="px-3 py-1.5 border border-neutral-300 text-xs font-bold uppercase disabled:opacity-30 hover:border-black cursor-pointer"
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = activePage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setActivePage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center text-xs font-bold cursor-pointer ${
                          isActive
                            ? "bg-black text-white"
                            : "border border-neutral-300 hover:border-black"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={activePage === totalPages}
                    onClick={() => setActivePage((prev) => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1.5 border border-neutral-300 text-xs font-bold uppercase disabled:opacity-30 hover:border-black cursor-pointer"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ============================================================ */}
      {/* MODAL: REVIEW DETAIL VIEW */}
      {/* ============================================================ */}
      {selectedReviewDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 animate-fade-in"
          onClick={() => setSelectedReviewDetail(null)}
        >
          <div
            className="bg-white max-w-lg w-full p-6 md:p-8 relative shadow-2xl overflow-y-auto max-h-[92vh] flex flex-col border border-neutral-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                  Đặc tả chi tiết bài viết
                </span>
                <h3 className="font-serif text-xl font-bold uppercase text-black">
                  Đánh giá #{selectedReviewDetail.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReviewDetail(null)}
                className="text-neutral-400 hover:text-black p-2 transition-colors cursor-pointer rounded-full hover:bg-neutral-100"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-5 text-xs">
              {/* User info card */}
              <div className="bg-[#fbfbf9] p-4 border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm select-none">
                    {(selectedReviewDetail.userDisplayName || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-black">
                      {selectedReviewDetail.userDisplayName || "Khách hàng"}
                    </h4>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      User ID: {selectedReviewDetail.userId}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 uppercase tracking-wider">
                  <FiCheckCircle size={11} /> Xác thực mua hàng
                </span>
              </div>

              {/* Rating & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-neutral-200 p-3 bg-white">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                    Mức sao đánh giá
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-black">
                      {selectedReviewDetail.rating}.0 / 5.0
                    </span>
                    <div className="flex text-[#E6A117]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar
                          key={s}
                          size={12}
                          className={
                            s <= selectedReviewDetail.rating
                              ? "text-[#E6A117]"
                              : "text-neutral-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border border-neutral-200 p-3 bg-white">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                    Thời gian gửi bài
                  </span>
                  <span className="font-semibold text-black text-xs block">
                    {formatDateDisplay(selectedReviewDetail.createdAt)}
                  </span>
                </div>
              </div>

              {/* Variation */}
              {selectedReviewDetail.variationName && (
                <div className="border border-neutral-200 p-3 bg-white">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                    Phân loại sản phẩm chọn mua
                  </span>
                  <span className="font-mono font-bold text-black text-xs">
                    {selectedReviewDetail.variationName}
                  </span>
                </div>
              )}

              {/* Review Text */}
              <div className="border border-neutral-200 p-4 bg-white">
                <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-2">
                  Nội dung nhận xét chi tiết
                </span>
                <p className="text-neutral-800 text-sm leading-relaxed whitespace-pre-line">
                  {selectedReviewDetail.content || "(Khách hàng không nhập văn bản nhận xét)"}
                </p>
              </div>

              {/* Review Image (if present) */}
              {selectedReviewDetail.imageUrl && (
                <div className="border border-neutral-200 p-4 bg-white">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-2">
                    Hình ảnh chụp từ người mua
                  </span>
                  <div
                    onClick={() => setActiveLightboxImg(selectedReviewDetail.imageUrl)}
                    className="w-32 h-40 bg-neutral-100 border border-neutral-200 overflow-hidden cursor-pointer group relative shadow-xs hover:border-black transition-colors"
                  >
                    <img
                      src={selectedReviewDetail.imageUrl}
                      alt="Review snapshot"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs font-bold uppercase tracking-wider">
                      Phóng to
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t border-neutral-200 pt-4 mt-6 flex justify-end">
              <button
                onClick={() => setSelectedReviewDetail(null)}
                className="px-6 py-2.5 bg-black text-white font-bold uppercase text-[11px] tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: IMAGE LIGHTBOX */}
      {/* ============================================================ */}
      {activeLightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setActiveLightboxImg(null)}
        >
          <button
            onClick={() => setActiveLightboxImg(null)}
            className="absolute top-6 right-6 text-white hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer p-2"
            aria-label="Đóng ảnh"
          >
            <FiX size={32} />
          </button>
          <img
            src={activeLightboxImg}
            alt="Review Photo High-Res"
            className="max-w-full max-h-[92vh] object-contain select-none shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
