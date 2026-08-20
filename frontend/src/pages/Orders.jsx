import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCheck,
  FiTruck,
  FiClock,
  FiAlertCircle,
  FiCreditCard,
  FiEye,
  FiTag,
  FiCamera,
  FiStar,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import { useAuthStore } from "../store/useAuthStore";
import { useUserOrders, useCancelOrder } from "../hooks/api/useOrders";
import { useCreateReview } from "../hooks/api/useReviews";

const STATUS_TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING_APPROVAL", label: "Chờ duyệt" },
  { key: "PENDING_PAYMENT", label: "Chờ thanh toán" },
  { key: "AWAITING_PICKUP", label: "Chờ lấy hàng" },
  { key: "IN_TRANSIT", label: "Đang vận chuyển" },
  { key: "DELIVERED", label: "Đã giao" },
  { key: "DELIVERY_FAILED", label: "Giao thất bại" },
  { key: "CANCELED", label: "Đã hủy" },
];

const Orders = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isUserLoggedIn = useAuthStore((state) => !!state.accessToken);

  const [activeTab, setActiveTab] = useState("ALL");
  const [activePage, setActivePage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null); // Detail Modal
  const [cancelingOrderId, setCancelingOrderId] = useState(null);

  // Review Modal States
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewFormRating, setReviewFormRating] = useState(5);
  const [reviewFormHoverRating, setReviewFormHoverRating] = useState(0);
  const [reviewFormContent, setReviewFormContent] = useState("");
  const [reviewFormFile, setReviewFormFile] = useState(null);
  const [reviewFormFilePreview, setReviewFormFilePreview] = useState(null);

  const createReviewMutation = useCreateReview();

  // API Call
  const { data: orderPage, isLoading, refetch } = useUserOrders({
    status: activeTab === "ALL" ? undefined : activeTab,
    page: activePage - 1,
    size: 10,
  });

  const cancelOrderMutation = useCancelOrder();

  const orders = orderPage?.content || [];
  const totalElements = orderPage?.totalElements || 0;
  const totalPages = orderPage?.totalPages || 1;

  const handleCancelOrder = (orderId) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #LM-${orderId}?`)) {
      setCancelingOrderId(orderId);
      cancelOrderMutation.mutate(orderId, {
        onSuccess: () => {
          toast.success(`Đã hủy đơn hàng #LM-${orderId} thành công!`);
          setCancelingOrderId(null);
          refetch();
          if (selectedOrder && selectedOrder.orderId === orderId) {
            setSelectedOrder(null);
          }
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Hủy đơn hàng thất bại!");
          setCancelingOrderId(null);
        },
      });
    }
  };

  const handleOpenReviewModal = (item, order) => {
    setReviewingItem({
      ...item,
      orderId: order.orderId,
    });
    setReviewFormRating(5);
    setReviewFormHoverRating(0);
    setReviewFormContent("");
    setReviewFormFile(null);
    setReviewFormFilePreview(null);
  };

  const handleReviewImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chỉ chọn tệp hình ảnh (JPEG, PNG, WebP, v.v.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dung lượng ảnh tối đa là 5MB!");
      return;
    }
    setReviewFormFile(file);
    setReviewFormFilePreview(URL.createObjectURL(file));
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    const targetItemId = reviewingItem?.orderItemId || reviewingItem?.id;
    if (!targetItemId) {
      toast.error("Không tìm thấy mã định danh dòng đơn hàng hợp lệ!");
      return;
    }
    if (!reviewFormRating || reviewFormRating < 1 || reviewFormRating > 5) {
      toast.warn("Vui lòng chọn số sao đánh giá từ 1 đến 5 sao!");
      return;
    }

    createReviewMutation.mutate(
      {
        orderItemId: targetItemId,
        rating: reviewFormRating,
        content: reviewFormContent,
        file: reviewFormFile,
      },
      {
        onSuccess: () => {
          toast.success("Cảm ơn bạn đã gửi đánh giá cho sản phẩm!");
          setReviewingItem(null);
          setReviewFormFile(null);
          setReviewFormFilePreview(null);
          refetch();
        },
        onError: (err) => {
          toast.error(
            err.response?.data?.message ||
              "Không thể gửi đánh giá. Vui lòng kiểm tra lại quyền đánh giá của đơn hàng!"
          );
        },
      }
    );
  };

  const getRatingLabel = (star) => {
    switch (star) {
      case 5:
        return "Tuyệt vời - Rất hài lòng";
      case 4:
        return "Hài lòng - Chất lượng tốt";
      case 3:
        return "Bình thường - Đúng mô tả";
      case 2:
        return "Không hài lòng - Chưa ưng ý";
      case 1:
        return "Rất không hài lòng - Kém chất lượng";
      default:
        return "";
    }
  };

  const getStatusLabel = (statusKey) => {
    switch (statusKey) {
      case "PENDING_APPROVAL":
        return "Chờ xác nhận";
      case "PENDING_PAYMENT":
        return "Chờ thanh toán";
      case "AWAITING_PICKUP":
        return "Chờ lấy hàng";
      case "IN_TRANSIT":
        return "Đang vận chuyển";
      case "DELIVERED":
        return "Đã giao thành công";
      case "DELIVERY_FAILED":
        return "Giao hàng thất bại";
      case "CANCELED":
        return "Đã hủy";
      default:
        return statusKey;
    }
  };

  const renderStatusBadge = (statusKey) => {
    switch (statusKey) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] label-sm font-semibold tracking-wider">
            <FiCheck size={12} />
            Đã giao thành công
          </span>
        );
      case "IN_TRANSIT":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] label-sm font-semibold tracking-wider">
            <FiTruck size={12} />
            Đang vận chuyển
          </span>
        );
      case "AWAITING_PICKUP":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] label-sm font-semibold tracking-wider">
            <FiClock size={12} />
            Chờ lấy hàng
          </span>
        );
      case "PENDING_APPROVAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fbf3db] border border-[#ecdca0] text-[#8f6b00] text-[10px] label-sm font-semibold tracking-wider">
            <FiClock size={12} />
            Chờ xác nhận
          </span>
        );
      case "PENDING_PAYMENT":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-[10px] label-sm font-semibold tracking-wider">
            <FiCreditCard size={12} />
            Chờ thanh toán
          </span>
        );
      case "DELIVERY_FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] label-sm font-semibold tracking-wider">
            <FiAlertCircle size={12} />
            Giao hàng thất bại
          </span>
        );
      case "CANCELED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 border border-neutral-300 text-neutral-500 text-[10px] label-sm font-semibold tracking-wider">
            <FiX size={12} />
            Đã hủy
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
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

  const formatPrice = (val) => {
    return Number(val || 0).toLocaleString("vi-VN") + "₫";
  };

  if (!isUserLoggedIn) {
    return (
      <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
        <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 md:px-16 py-32 flex flex-col items-center justify-center text-center">
          <h1 className="font-serif text-[36px] md:text-[48px] font-bold mb-4 uppercase">
            YÊU CẦU ĐĂNG NHẬP
          </h1>
          <p className="body-md text-neutral-600 max-w-lg mb-8 leading-relaxed">
            Vui lòng đăng nhập tài khoản của bạn để xem và theo dõi đơn hàng.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-black text-white px-8 py-4.5 label-sm tracking-widest font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            ĐĂNG NHẬP NGAY
          </button>
        </main>
        <Footer variant="detailed" />
      </div>
    );
  }

  return (
    <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
      {/* Main Container */}
      <main className="max-w-[1440px] mx-auto w-full px-6 md:px-16 pt-32 pb-24 flex-grow text-left">
        {/* Breadcrumb */}
        <div className="mb-8 select-none">
          <div className="flex items-center gap-2 mb-4 label-sm text-[10px] text-neutral-500 tracking-widest uppercase">
            <Link to="/" className="hover:text-black transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-black font-bold">Tài khoản</span>
            <span>/</span>
            <span className="text-black font-bold">Đơn hàng của tôi</span>
          </div>
          <h1 className="font-serif text-[32px] md:text-[44px] font-semibold text-black uppercase tracking-normal">
            Đơn hàng của tôi
          </h1>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 select-none border-b border-neutral-200">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setActivePage(1);
                }}
                className={`px-4 py-2 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer border whitespace-nowrap ${
                  isActive
                    ? "bg-black text-white border-black shadow-xs"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-black hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Section */}
        <div className="w-full">
          {isLoading ? (
            <div className="py-24 text-center">
              <svg
                className="animate-spin h-10 w-10 text-black mx-auto mb-4"
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
                ĐANG TẢI ĐƠN HÀNG CỦA BẠN...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center select-none bg-white border border-neutral-200 p-8">
              <FiClock
                size={54}
                className="text-neutral-300 mb-4 stroke-[1.2]"
              />
              <h2 className="font-serif text-2xl mb-2 text-black font-semibold">
                Không tìm thấy đơn hàng nào
              </h2>
              <p className="body-md text-neutral-500 mb-8 max-w-sm">
                Hãy khám phá các bộ sưu tập mới nhất của chúng tôi và chọn cho mình những thiết kế ưng ý.
              </p>
              <Link
                to="/product"
                className="bg-black text-white px-12 py-4 label-sm tracking-widest font-semibold hover:bg-neutral-800 transition-colors"
              >
                Khám phá ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const canCancel =
                  order.status === "PENDING_APPROVAL" ||
                  order.status === "PENDING_PAYMENT";
                const isCanceling = cancelingOrderId === order.orderId;

                return (
                  <div
                    key={order.orderId}
                    className="bg-white border border-neutral-200 hover:border-neutral-400 transition-all p-6 text-left shadow-xs"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200">
                      <div>
                        <span className="font-serif text-xl font-bold text-black mr-4">
                          #LM-{order.orderId}
                        </span>
                        <span className="text-xs text-neutral-500 font-mono">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {renderStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Order Details Body */}
                    <div className="py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Products List Preview (Limit to 3 items) */}
                      <div className="lg:col-span-8 space-y-3">
                        {order.items && order.items.length > 0 ? (
                          <>
                            <div className="space-y-3">
                              {order.items.slice(0, 3).map((item, idx) => {
                                const itemPrice =
                                  item.priceAtPurchase ?? item.unitPrice ?? 0;
                                const itemSize = item.sizeName ?? item.size;
                                const itemImg = item.imageUrl || item.image || item.thumbnailUrl;

                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-3.5 text-xs py-1.5 border-b border-neutral-100 last:border-b-0"
                                  >
                                    {/* Thumbnail Image */}
                                    <div className="w-14 h-16 sm:w-16 sm:h-20 bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden flex items-center justify-center">
                                      {itemImg ? (
                                        <img
                                          src={itemImg}
                                          alt={item.productName || "Product"}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-[9px] font-serif text-neutral-400 font-bold bg-neutral-50 tracking-widest uppercase">
                                          LMR
                                        </div>
                                      )}
                                    </div>

                                    {/* Product Meta */}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-black text-sm truncate">
                                        {item.productName ||
                                          item.name ||
                                          `Sản phẩm #${item.productVariationId || item.id}`}
                                      </p>
                                      <p className="text-neutral-500 mt-0.5 text-xs">
                                        {item.colorName && `Màu: ${item.colorName}`}
                                        {itemSize && ` | Size: ${itemSize}`}
                                      </p>
                                      <p className="text-neutral-500 mt-1 text-xs">
                                        Đơn giá: <span className="font-mono">{formatPrice(itemPrice)}</span> × <span className="font-bold text-black">{item.quantity}</span>
                                      </p>
                                    </div>

                                    {/* Line Total & Review Action */}
                                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                                      <p className="font-bold text-black text-sm">
                                        {formatPrice(Number(itemPrice) * item.quantity)}
                                      </p>
                                      {order.status === "DELIVERED" && (
                                        <button
                                          onClick={() => handleOpenReviewModal(item, order)}
                                          className="px-2.5 py-1 bg-black text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                        >
                                          <FaStar size={10} className="text-[#E6A117]" />
                                          Đánh giá
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Show More prompt if > 3 items */}
                            {order.items.length > 3 && (
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="w-full text-left py-2.5 px-3.5 bg-neutral-50 hover:bg-neutral-100 border border-dashed border-neutral-300 text-xs font-semibold text-neutral-700 hover:text-black flex items-center justify-between transition-colors cursor-pointer mt-2"
                              >
                                <span>+ Còn lại {order.items.length - 3} sản phẩm khác trong đơn</span>
                                <span className="underline underline-offset-4 text-[11px] uppercase tracking-wider font-bold">
                                  Xem chi tiết →
                                </span>
                              </button>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-neutral-400 italic">
                            Đơn hàng không có danh mục chi tiết
                          </p>
                        )}
                      </div>

                      {/* Total & Receiver Summary */}
                      <div className="lg:col-span-4 lg:border-l lg:border-neutral-200 lg:pl-6 space-y-2 text-xs">
                        <div>
                          <span className="text-neutral-500 font-bold block">
                            Người nhận:
                          </span>
                          <span className="font-semibold text-black">
                            {order.receiverName} ({order.receiverPhone})
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 font-bold block">
                            Địa chỉ giao:
                          </span>
                          <span className="text-neutral-700 leading-snug line-clamp-2">
                            {order.shippingAddressDetail}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-neutral-100 flex justify-between items-baseline">
                          <span className="text-xs font-bold text-neutral-500 uppercase">
                            Tổng thanh toán:
                          </span>
                          <span className="font-serif text-lg font-bold text-black">
                            {formatPrice(order.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[11px] text-neutral-500 font-semibold">
                        Phương thức:{" "}
                        <strong className="text-black">
                          {order.paymentMethod === "COD"
                            ? "Thanh toán khi nhận hàng (COD)"
                            : "Thanh toán trực tuyến PayOS"}
                        </strong>
                      </span>

                      <div className="flex items-center gap-3">
                        {order.status === "PENDING_PAYMENT" && order.paymentUrl && (
                          <a
                            href={order.paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <FiCreditCard size={14} /> Thanh toán PayOS
                          </a>
                        )}

                        {canCancel && (
                          <button
                            disabled={isCanceling}
                            onClick={() => handleCancelOrder(order.orderId)}
                            className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isCanceling ? "Đang hủy..." : "Hủy đơn hàng"}
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 bg-black text-white hover:bg-neutral-800 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <FiEye size={14} /> Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2 select-none">
                  <button
                    disabled={activePage === 1}
                    onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
                    className="w-9 h-9 flex items-center justify-center border border-neutral-300 bg-white text-black disabled:opacity-30 cursor-pointer hover:border-black transition-colors"
                  >
                    <FiChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = activePage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setActivePage(pageNum)}
                        className={`w-9 h-9 flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-black text-white border border-black"
                            : "bg-white text-black border border-neutral-300 hover:border-black"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={activePage === totalPages}
                    onClick={() => setActivePage((prev) => Math.min(prev + 1, totalPages))}
                    className="w-9 h-9 flex items-center justify-center border border-neutral-300 bg-white text-black disabled:opacity-30 cursor-pointer hover:border-black transition-colors"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-fade-in"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white max-w-2xl w-full p-6 md:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col border border-neutral-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
              <div>
                <h3 className="font-serif text-xl md:text-2xl font-bold uppercase text-black">
                  Chi tiết đơn hàng #LM-{selectedOrder.orderId}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Ngày đặt: {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-500 hover:text-black p-2 transition-colors cursor-pointer rounded-full hover:bg-neutral-100"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-6 text-xs font-sans">
              {/* Receiver Info */}
              <div className="bg-[#f5f4f2] p-4 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-black uppercase tracking-wider block mb-1">
                    Người nhận:
                  </span>
                  <p className="font-semibold text-black">
                    {selectedOrder.receiverName}
                  </p>
                  <p className="text-neutral-600 mt-0.5">
                    {selectedOrder.receiverPhone}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-black uppercase tracking-wider block mb-1">
                    Địa chỉ giao hàng:
                  </span>
                  <p className="text-neutral-700 leading-relaxed">
                    {selectedOrder.shippingAddressDetail}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center p-4 border border-neutral-200">
                <div>
                  <span className="text-neutral-500 uppercase font-bold block mb-1">
                    Phương thức thanh toán
                  </span>
                  <span className="font-bold text-black">
                    {selectedOrder.paymentMethod === "COD"
                      ? "Thanh toán khi nhận hàng (COD)"
                      : "Thanh toán trực tuyến PayOS"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase font-bold block mb-1">
                    Trạng thái
                  </span>
                  {renderStatusBadge(selectedOrder.status)}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-black mb-3">
                  Sản phẩm trong đơn hàng
                </h4>
                <div className="border border-neutral-200 overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#f5f4f2] text-neutral-500 font-bold uppercase text-[10px] border-b border-neutral-200">
                      <tr>
                        <th className="py-2.5 px-4">Sản phẩm</th>
                        <th className="py-2.5 px-4 text-center">Số lượng</th>
                        <th className="py-2.5 px-4 text-right">Đơn giá</th>
                        <th className="py-2.5 px-4 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, idx) => {
                          const itemPrice =
                            item.priceAtPurchase ?? item.unitPrice ?? 0;
                          const itemSize = item.sizeName ?? item.size;
                          const itemImg = item.imageUrl || item.image || item.thumbnailUrl;
                          const lineTotal = Number(itemPrice) * item.quantity;

                          return (
                            <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3.5">
                                  <div className="w-12 h-14 bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden flex items-center justify-center">
                                    {itemImg ? (
                                      <img
                                        src={itemImg}
                                        alt={item.productName || "Product"}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-[9px] font-serif text-neutral-400 font-bold tracking-widest uppercase">
                                        LMR
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-black text-sm">
                                      {item.productName ||
                                        item.name ||
                                        `Sản phẩm #${item.productVariationId || item.id}`}
                                    </p>
                                    <p className="text-neutral-500 text-xs mt-0.5">
                                      {item.colorName && `Màu: ${item.colorName}`}
                                      {itemSize && ` | Size: ${itemSize}`}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center font-bold">
                                {item.quantity}
                              </td>
                              <td className="py-3 px-4 text-right font-mono">
                                {formatPrice(itemPrice)}
                              </td>
                              <td className="py-3 px-4 text-right font-bold font-mono">
                                <div className="flex flex-col items-end gap-1.5">
                                  <span>{formatPrice(lineTotal)}</span>
                                  {selectedOrder.status === "DELIVERED" && (
                                    <button
                                      onClick={() => handleOpenReviewModal(item, selectedOrder)}
                                      className="px-2.5 py-1 bg-black text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                    >
                                      <FaStar size={10} className="text-[#E6A117]" />
                                      Đánh giá
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-6 text-center text-neutral-500"
                          >
                            Không có sản phẩm chi tiết
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total & Action */}
              <div className="flex justify-between items-center border-t border-neutral-200 pt-4 font-bold text-black">
                <span>TỔNG CỘNG ĐƠN HÀNG:</span>
                <span className="font-serif text-xl text-black">
                  {formatPrice(selectedOrder.totalPrice)}
                </span>
              </div>

              {(selectedOrder.status === "PENDING_APPROVAL" ||
                selectedOrder.status === "PENDING_PAYMENT") && (
                <div className="pt-4 border-t border-neutral-200 flex justify-end">
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.orderId)}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
                  >
                    HỦY ĐƠN HÀNG NÀY
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: WRITE PRODUCT REVIEW */}
      {/* ============================================================ */}
      {reviewingItem && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 animate-fade-in"
          onClick={() => setReviewingItem(null)}
        >
          <div
            className="bg-white max-w-xl w-full p-6 md:p-8 relative shadow-2xl overflow-y-auto max-h-[92vh] flex flex-col border border-neutral-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-5">
              <div>
                <h3 className="font-serif text-xl font-bold uppercase text-black">
                  Đánh giá sản phẩm
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Đơn hàng #{reviewingItem.orderId}
                </p>
              </div>
              <button
                onClick={() => setReviewingItem(null)}
                className="text-neutral-400 hover:text-black p-2 transition-colors cursor-pointer rounded-full hover:bg-neutral-100"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Product Summary Header */}
            <div className="bg-[#fcfbf9] border border-neutral-200 p-3.5 mb-5 flex items-center gap-3.5">
              <div className="w-14 h-16 bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                {reviewingItem.imageUrl || reviewingItem.image || reviewingItem.thumbnailUrl ? (
                  <img
                    src={reviewingItem.imageUrl || reviewingItem.image || reviewingItem.thumbnailUrl}
                    alt={reviewingItem.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[9px] font-serif text-neutral-400 font-bold tracking-widest uppercase">
                    LMR
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-black text-sm truncate">
                  {reviewingItem.productName || reviewingItem.name}
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Phân loại:{" "}
                  <span className="font-bold text-neutral-800">
                    {reviewingItem.colorName && `Màu ${reviewingItem.colorName}`}
                    {reviewingItem.sizeName && ` / Size ${reviewingItem.sizeName}`}
                  </span>
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitReview} className="space-y-5 text-xs">
              {/* Star Rating Picker */}
              <div className="text-center py-4 bg-[#FAF8F5] border border-[#EBE3D5] rounded-xs">
                <p className="text-xs font-bold text-black uppercase tracking-wider mb-2.5">
                  Chất lượng sản phẩm <span className="text-red-500">*</span>
                </p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (reviewFormHoverRating || reviewFormRating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewFormRating(star)}
                        onMouseEnter={() => setReviewFormHoverRating(star)}
                        onMouseLeave={() => setReviewFormHoverRating(0)}
                        className="cursor-pointer p-1 transition-transform hover:scale-125 active:scale-95"
                      >
                        <FaStar
                          size={30}
                          className={isFilled ? "text-[#E6A117]" : "text-neutral-300"}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] font-bold text-neutral-700 mt-2">
                  {getRatingLabel(reviewFormHoverRating || reviewFormRating)}
                </p>
              </div>

              {/* Review Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-black font-bold uppercase tracking-wider">
                    Nhận xét chi tiết
                  </label>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {reviewFormContent.length} / 2000
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={2000}
                  placeholder="Hãy chia sẻ cảm nhận của bạn về độ vừa vặn, chất liệu vải, đường chỉ may và trải nghiệm sử dụng thực tế..."
                  value={reviewFormContent}
                  onChange={(e) => setReviewFormContent(e.target.value)}
                  className="w-full bg-[#fbf9f9] border border-neutral-300 focus:border-black p-3 text-xs text-black outline-none transition-colors leading-relaxed"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-black font-bold uppercase tracking-wider mb-1.5">
                  Hình ảnh thực tế (Tùy chọn)
                </label>
                
                {reviewFormFilePreview ? (
                  <div className="relative inline-block border border-neutral-300 p-1 bg-white">
                    <img
                      src={reviewFormFilePreview}
                      alt="Preview"
                      className="w-24 h-28 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setReviewFormFile(null);
                        setReviewFormFilePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-neutral-300 hover:border-black bg-[#fbf9f9] p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
                    <FiCamera size={24} className="text-neutral-400" />
                    <span className="text-xs font-semibold text-neutral-600">
                      Tải lên hình ảnh sản phẩm (Tối đa 5MB)
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Định dạng hỗ trợ: JPEG, PNG, WebP
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReviewImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Modal Actions */}
              <div className="border-t border-neutral-200 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  className="px-6 py-2.5 border border-neutral-300 text-neutral-700 font-bold uppercase text-[11px] hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={createReviewMutation.isPending}
                  className="px-8 py-2.5 bg-black text-white font-bold uppercase text-[11px] tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {createReviewMutation.isPending ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    "Gửi đánh giá"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer variant="detailed" />
    </div>
  );
};

export default Orders;
