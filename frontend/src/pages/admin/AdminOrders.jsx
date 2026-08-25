import React, { useState } from "react";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  useAdminOrders,
  useUpdateOrderStatus,
} from "../../hooks/api/useAdminOrders";
import {
  FiSearch,
  FiX,
  FiEye,
  FiCheck,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
} from "react-icons/fi";

const ORDER_STATUSES = [
  { key: "ALL", label: "Tất cả đơn hàng", color: "" },
  {
    key: "PENDING_PAYMENT",
    label: "Chờ thanh toán",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    key: "PENDING_APPROVAL",
    label: "Chờ duyệt",
    color: "bg-[#fbf3db] text-[#8f6b00] border-[#ecdca0]",
  },
  {
    key: "AWAITING_PICKUP",
    label: "Chờ lấy hàng",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    key: "IN_TRANSIT",
    label: "Đang giao hàng",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    key: "DELIVERED",
    label: "Giao thành công",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    key: "DELIVERY_FAILED",
    label: "Giao thất bại",
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    key: "CANCELED",
    label: "Đã hủy",
    color: "bg-red-50 text-red-700 border-red-200",
  },
];

const AdminOrders = () => {
  const [activePage, setActivePage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // Detail Modal
  const [updatingOrderId, setUpdatingOrderId] = useState(null); // Status change loading
  const [toastMessage, setToastMessage] = useState("");

  // API Call
  const { data: orderPage, isLoading, refetch } = useAdminOrders({
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
    page: activePage - 1,
    size: 10,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const orders = orderPage?.content || [];
  const totalElements = orderPage?.totalElements || 0;
  const totalPages = orderPage?.totalPages || 1;

  // Filtered by client search if text is typed
  const filteredOrders = searchQuery
    ? orders.filter(
        (o) =>
          String(o.orderId).includes(searchQuery) ||
          (o.receiverName &&
            o.receiverName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (o.receiverPhone && o.receiverPhone.includes(searchQuery))
      )
    : orders;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  /**
   * Return allowed next statuses based on backend OrderServiceImpl state machine
   */
  const getAllowedNextStatuses = (currentStatus) => {
    switch (currentStatus) {
      case "PENDING_APPROVAL":
        return ["AWAITING_PICKUP", "CANCELED"];
      case "AWAITING_PICKUP":
        return ["IN_TRANSIT", "CANCELED"];
      case "IN_TRANSIT":
        return ["DELIVERED", "DELIVERY_FAILED"];
      case "PENDING_PAYMENT":
      case "DELIVERED":
      case "DELIVERY_FAILED":
      case "CANCELED":
      default:
        return [];
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    updateStatusMutation.mutate(
      { id: orderId, status: newStatus },
      {
        onSuccess: (updatedData) => {
          let notice = `Đã cập nhật trạng thái đơn #${orderId} thành "${getStatusLabel(
            newStatus
          )}"!`;
          if (newStatus === "DELIVERY_FAILED" || newStatus === "CANCELED") {
            notice += " (Số lượng kho hàng đã được tự động hoàn trả).";
          }
          toast.success(notice);
          setUpdatingOrderId(null);
          if (selectedOrder && selectedOrder.orderId === orderId) {
            setSelectedOrder(updatedData);
          }
        },
        onError: (err) => {
          toast.error(
            err.response?.data?.message || "Cập nhật trạng thái thất bại!"
          );
          setUpdatingOrderId(null);
        },
      }
    );
  };

  const getStatusLabel = (statusKey) => {
    const found = ORDER_STATUSES.find((s) => s.key === statusKey);
    return found ? found.label : statusKey;
  };

  const getStatusBadgeClass = (statusKey) => {
    const found = ORDER_STATUSES.find((s) => s.key === statusKey);
    return found
      ? found.color
      : "bg-neutral-100 text-neutral-700 border-neutral-200";
  };

  const getInitials = (name) => {
    if (!name) return "LM";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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

  return (
    <div className="flex bg-[#fbf9f9] min-h-screen text-black font-sans select-none text-left">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab="orders" />

      {/* Main Container */}
      <div className="ml-56 flex-1 min-h-screen flex flex-col">
        <AdminHeader />

        {/* Canvas Section */}
        <main className="p-8 md:p-12 max-w-[1440px] w-full mx-auto flex-1">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-16 right-8 z-50 bg-black text-white px-6 py-3.5 shadow-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 animate-fade-in border border-neutral-700 max-w-md">
              <FiCheck className="text-emerald-400 text-lg shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-tight text-black">
                Quản lý Đơn hàng
              </h2>
              <p className="text-xs md:text-sm text-neutral-500 font-light mt-1.5">
                Theo dõi, xử lý và cập nhật quy trình vận chuyển đơn hàng LUMIÈRE.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="px-5 py-2.5 bg-white border border-neutral-300 hover:border-black text-black text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
              >
                <FiRefreshCw
                  size={14}
                  className={isLoading ? "animate-spin" : ""}
                />
                Làm mới
              </button>
              <button
                onClick={() => {
                  const csvContent =
                    "data:text/csv;charset=utf-8," +
                    ["Order ID,Khach hang,So dien thoai,Tong tien,Trang thai,Ngay tao"]
                      .concat(
                        orders.map(
                          (o) =>
                            `#LM-${o.orderId},"${o.receiverName || ""}","${o.receiverPhone || ""}",${o.totalPrice},${o.status},"${o.createdAt}"`
                        )
                      )
                      .join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute(
                    "download",
                    `lumiere_orders_page_${activePage}.csv`
                  );
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer active:scale-95 shadow-xs"
              >
                Xuất file CSV
              </button>
            </div>
          </div>

          {/* Search & Filter Row */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
            {/* Search Box */}
            <div className="relative flex items-center w-full md:w-80 border-b border-neutral-300 pb-1">
              <input
                type="text"
                placeholder="Tìm Mã đơn, Tên KH, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-xs text-black placeholder-neutral-400 pr-6 py-1 font-sans"
              />
              <FiSearch
                size={14}
                className="absolute right-0 text-neutral-400 pointer-events-none"
              />
            </div>

            {/* Quick Stats Counter */}
            <div className="text-xs text-neutral-500 font-semibold tracking-wider uppercase">
              Tổng số đơn:{" "}
              <span className="text-black font-bold">{totalElements}</span>
            </div>
          </div>

          {/* Dashboard Filter Tabs */}
          <div className="flex flex-wrap gap-2.5 mb-8 select-none">
            {ORDER_STATUSES.map((st) => {
              const isActive = selectedStatus === st.key;
              return (
                <button
                  key={st.key}
                  onClick={() => {
                    setSelectedStatus(st.key);
                    setActivePage(1);
                  }}
                  className={`px-4 py-2 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? "bg-black text-white border-black shadow-xs"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-black hover:text-black"
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>

          {/* Orders Table Container */}
          <div className="bg-white border border-neutral-200 overflow-hidden shadow-xs mb-10">
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
                  Đang tải danh sách đơn hàng...
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-20 text-center text-neutral-500 text-xs uppercase tracking-widest font-semibold">
                Không tìm thấy đơn hàng nào phù hợp
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f5f4f2] border-b border-neutral-200">
                      <th className="px-6 py-4 font-bold text-[10px] uppercase text-neutral-500 tracking-widest">
                        Mã đơn
                      </th>
                      <th className="px-6 py-4 font-bold text-[10px] uppercase text-neutral-500 tracking-widest">
                        Khách hàng
                      </th>
                      <th className="px-6 py-4 font-bold text-[10px] uppercase text-neutral-500 tracking-widest">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-4 font-bold text-[10px] uppercase text-neutral-500 tracking-widest">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-4 font-bold text-[10px] uppercase text-neutral-500 tracking-widest text-center">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 font-bold text-[10px] uppercase text-neutral-500 tracking-widest text-right">
                        Chuyển trạng thái / Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-xs font-sans">
                    {filteredOrders.map((order) => {
                      const isUpdating = updatingOrderId === order.orderId;
                      const allowedNext = getAllowedNextStatuses(order.status);
                      const isFinalState =
                        order.status === "DELIVERED" ||
                        order.status === "DELIVERY_FAILED" ||
                        order.status === "CANCELED";

                      return (
                        <tr
                          key={order.orderId}
                          className="hover:bg-neutral-50/80 transition-colors duration-150"
                        >
                          {/* Order ID */}
                          <td className="px-6 py-5 font-bold text-black whitespace-nowrap">
                            #LM-{order.orderId}
                          </td>

                          {/* Customer Info */}
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 bg-[#e9dfcb] text-[#696253] rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none">
                                {getInitials(order.receiverName)}
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-semibold text-black truncate max-w-[180px]">
                                  {order.receiverName || "Khách vô danh"}
                                </p>
                                <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                                  {order.receiverPhone || "Chưa có SĐT"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Created Date */}
                          <td className="px-6 py-5 text-neutral-600 whitespace-nowrap">
                            {formatDate(order.createdAt)}
                          </td>

                          {/* Total Price */}
                          <td className="px-6 py-5 font-bold text-black whitespace-nowrap">
                            {order.totalPrice
                              ? Number(order.totalPrice).toLocaleString("vi-VN") +
                                "₫"
                              : "0₫"}
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-5 text-center whitespace-nowrap">
                            <span
                              className={`inline-block px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border rounded-xs ${getStatusBadgeClass(
                                order.status
                              )}`}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          </td>

                          {/* Actions / State Transition Buttons */}
                          <td className="px-6 py-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* Step-by-step Status Actions */}
                              {order.status === "PENDING_APPROVAL" && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleStatusChange(
                                        order.orderId,
                                        "AWAITING_PICKUP"
                                      )
                                    }
                                    className="px-2.5 py-1 bg-black text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                                    title="Duyệt đơn & chuyển sang Chờ lấy hàng"
                                  >
                                    Duyệt đơn
                                  </button>
                                  <button
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleStatusChange(
                                        order.orderId,
                                        "CANCELED"
                                      )
                                    }
                                    className="px-2 py-1 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                                    title="Hủy đơn hàng"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              )}

                              {order.status === "AWAITING_PICKUP" && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleStatusChange(
                                        order.orderId,
                                        "IN_TRANSIT"
                                      )
                                    }
                                    className="px-2.5 py-1 bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                    title="Chuyển sang Đang giao hàng"
                                  >
                                    <FiTruck size={12} /> Giao hàng
                                  </button>
                                  <button
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleStatusChange(
                                        order.orderId,
                                        "CANCELED"
                                      )
                                    }
                                    className="px-2 py-1 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                                    title="Hủy đơn hàng"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              )}

                              {order.status === "IN_TRANSIT" && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleStatusChange(
                                        order.orderId,
                                        "DELIVERED"
                                      )
                                    }
                                    className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                    title="Xác nhận giao hàng thành công"
                                  >
                                    <FiCheckCircle size={12} /> Đã giao
                                  </button>
                                  <button
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleStatusChange(
                                        order.orderId,
                                        "DELIVERY_FAILED"
                                      )
                                    }
                                    className="px-2 py-1 bg-rose-600 text-white hover:bg-rose-700 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                    title="Đánh dấu giao hàng thất bại (Tự động hoàn tồn kho)"
                                  >
                                    <FiXCircle size={12} /> Giao thất bại
                                  </button>
                                </div>
                              )}

                              {order.status === "PENDING_PAYMENT" && (
                                <span className="text-[10px] text-purple-700 font-semibold italic bg-purple-50 px-2 py-1 border border-purple-200">
                                  Tự động qua PayOS
                                </span>
                              )}

                              {isFinalState && (
                                <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                                  Hoàn tất
                                </span>
                              )}

                              {/* Detail Modal Button */}
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-full transition-colors cursor-pointer ml-1"
                                title="Xem chi tiết đơn"
                              >
                                <FiEye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-[#f5f4f2] border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Trang {activePage} / {totalPages} (Tổng {totalElements} đơn
                  hàng)
                </p>
                <div className="flex items-center space-x-1.5">
                  <button
                    disabled={activePage === 1}
                    onClick={() =>
                      setActivePage((prev) => Math.max(prev - 1, 1))
                    }
                    className="w-8 h-8 flex items-center justify-center border border-neutral-300 bg-white hover:border-black text-black disabled:opacity-30 disabled:hover:border-neutral-300 cursor-pointer transition-colors"
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
                        className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
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
                    onClick={() =>
                      setActivePage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className="w-8 h-8 flex items-center justify-center border border-neutral-300 bg-white hover:border-black text-black disabled:opacity-30 disabled:hover:border-neutral-300 cursor-pointer transition-colors"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-fade-in"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white max-w-3xl w-full p-6 md:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col border border-neutral-200"
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
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6">
              {/* Receiver Info Box */}
              <div className="bg-[#f5f4f2] p-4 border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-black uppercase tracking-wider block mb-1">
                    Người nhận:
                  </span>
                  <p className="font-semibold text-black">
                    {selectedOrder.receiverName || "Chưa có tên"}
                  </p>
                  <p className="text-neutral-600 mt-0.5">
                    {selectedOrder.receiverPhone || "Chưa có SĐT"}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-black uppercase tracking-wider block mb-1">
                    Địa chỉ giao hàng:
                  </span>
                  <p className="text-neutral-700 leading-relaxed">
                    {selectedOrder.shippingAddressDetail ||
                      "Chưa cập nhật địa chỉ"}
                  </p>
                </div>
              </div>

              {/* Status & State Transition Guidance Box */}
              <div className="p-4 border border-neutral-200 bg-white text-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-neutral-500 uppercase font-bold block mb-1">
                      Phương thức thanh toán
                    </span>
                    <span className="font-bold text-black">
                      {selectedOrder.paymentMethod || "COD"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase font-bold block mb-1">
                      Trạng thái hiện tại
                    </span>
                    <span
                      className={`inline-block px-3 py-1 text-[10px] font-bold uppercase border ${getStatusBadgeClass(
                        selectedOrder.status
                      )}`}
                    >
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                </div>

                {/* Status Update Actions Control Bar */}
                <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-[11px] font-bold text-black uppercase tracking-wider">
                    Cập nhật quy trình đơn:
                  </span>

                  {selectedOrder.status === "PENDING_APPROVAL" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleStatusChange(selectedOrder.orderId, "AWAITING_PICKUP")
                        }
                        className="px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Xác nhận duyệt đơn
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(selectedOrder.orderId, "CANCELED")
                        }
                        className="px-4 py-2 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Hủy đơn hàng
                      </button>
                    </div>
                  )}

                  {selectedOrder.status === "AWAITING_PICKUP" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleStatusChange(selectedOrder.orderId, "IN_TRANSIT")
                        }
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                      >
                        <FiTruck size={14} /> Chuyển sang Đang giao
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(selectedOrder.orderId, "CANCELED")
                        }
                        className="px-4 py-2 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Hủy đơn hàng
                      </button>
                    </div>
                  )}

                  {selectedOrder.status === "IN_TRANSIT" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleStatusChange(selectedOrder.orderId, "DELIVERED")
                        }
                        className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                      >
                        <FiCheckCircle size={14} /> Giao hàng thành công
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(selectedOrder.orderId, "DELIVERY_FAILED")
                        }
                        className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                      >
                        <FiXCircle size={14} /> Giao hàng thất bại
                      </button>
                    </div>
                  )}

                  {selectedOrder.status === "PENDING_PAYMENT" && (
                    <p className="text-[11px] text-purple-700 font-medium italic">
                      * Đơn hàng đang chờ khách hoàn tất thanh toán trực tuyến qua PayOS.
                    </p>
                  )}

                  {(selectedOrder.status === "DELIVERED" ||
                    selectedOrder.status === "DELIVERY_FAILED" ||
                    selectedOrder.status === "CANCELED") && (
                    <span className="text-xs text-neutral-500 font-semibold uppercase">
                      Đơn hàng đã ở trạng thái kết thúc ({getStatusLabel(selectedOrder.status)})
                    </span>
                  )}
                </div>

                {/* Stock restoration notice for CANCELED or DELIVERY_FAILED */}
                {(selectedOrder.status === "CANCELED" ||
                  selectedOrder.status === "DELIVERY_FAILED") && (
                  <div className="bg-amber-50 border border-amber-200 p-3 text-amber-900 flex items-start gap-2.5">
                    <FiAlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Lưu ý tồn kho:</p>
                      <p className="font-light mt-0.5">
                        Đơn hàng bị hủy hoặc giao thất bại đã được hệ thống tự động hoàn trả số lượng sản phẩm lại kho hàng.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items Table */}
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
                          const itemPrice = item.priceAtPurchase ?? item.unitPrice ?? 0;
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
                                {Number(itemPrice).toLocaleString("vi-VN")}₫
                              </td>
                              <td className="py-3 px-4 text-right font-bold">
                                {lineTotal.toLocaleString("vi-VN")}₫
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
                            Không tìm thấy danh sách chi tiết sản phẩm.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Total Price */}
              <div className="flex justify-between items-center border-t border-neutral-200 pt-4 text-sm font-bold text-black">
                <span>TỔNG CỘNG ĐƠN HÀNG:</span>
                <span className="font-serif text-xl text-black">
                  {selectedOrder.totalPrice
                    ? Number(selectedOrder.totalPrice).toLocaleString("vi-VN") +
                      "₫"
                    : "0₫"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
