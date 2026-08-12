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
} from "react-icons/fi";
import Footer from "../components/Footer";
import { useAuthStore } from "../store/useAuthStore";
import { useUserOrders, useCancelOrder } from "../hooks/api/useOrders";

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
          alert(`Đã hủy đơn hàng #LM-${orderId} thành công!`);
          setCancelingOrderId(null);
          refetch();
          if (selectedOrder && selectedOrder.orderId === orderId) {
            setSelectedOrder(null);
          }
        },
        onError: (err) => {
          alert(err.response?.data?.message || "Hủy đơn hàng thất bại!");
          setCancelingOrderId(null);
        },
      });
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
                    <div className="py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Products List Preview */}
                      <div className="lg:col-span-8 space-y-3">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => {
                            const itemPrice =
                              item.priceAtPurchase ?? item.unitPrice ?? 0;
                            const itemSize = item.sizeName ?? item.size;

                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs py-1"
                              >
                                <div>
                                  <p className="font-semibold text-black text-sm">
                                    {item.productName ||
                                      item.name ||
                                      `Sản phẩm #${item.productVariationId || item.id}`}
                                  </p>
                                  <p className="text-neutral-500 mt-0.5">
                                    {item.colorName && `Màu: ${item.colorName}`}
                                    {itemSize && ` | Size: ${itemSize}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-black">
                                    x{item.quantity}
                                  </p>
                                  <p className="text-neutral-500 font-mono">
                                    {formatPrice(itemPrice)}
                                  </p>
                                </div>
                              </div>
                            );
                          })
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
                          const lineTotal = Number(itemPrice) * item.quantity;
                          return (
                            <tr key={idx}>
                              <td className="py-3 px-4 font-semibold text-black">
                                {item.productName ||
                                  item.name ||
                                  `Sản phẩm #${item.productVariationId || item.id}`}
                                {item.colorName && (
                                  <span className="text-neutral-500 font-normal">
                                    {" "}
                                    - {item.colorName}
                                  </span>
                                )}
                                {itemSize && (
                                  <span className="text-neutral-500 font-normal">
                                    {" "}
                                    ({itemSize})
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center font-bold">
                                {item.quantity}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {formatPrice(itemPrice)}
                              </td>
                              <td className="py-3 px-4 text-right font-bold">
                                {formatPrice(lineTotal)}
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

      <Footer variant="detailed" />
    </div>
  );
};

export default Orders;
