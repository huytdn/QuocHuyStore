import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  useDashboardKpis,
  useDashboardRevenueChart,
  useDashboardOrderAnalytics,
  useDashboardTopProducts,
  useDashboardCategoryRevenue,
  useDashboardLowStock,
} from "../../hooks/api/useAdminDashboard";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiShoppingBag,
  FiAlertTriangle,
  FiDollarSign,
  FiPackage,
  FiDownload,
  FiLayers,
  FiCheckCircle,
  FiPieChart,
  FiEdit2,
  FiCheck,
  FiX,
} from "react-icons/fi";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount) || 0);
};

const AdminDashboard = () => {
  const [range, setRange] = useState("THIS_MONTH");

  // Editable Revenue Target State (persisted in localStorage)
  const [revenueTarget, setRevenueTarget] = useState(() => {
    const saved = localStorage.getItem("admin_revenue_target");
    return saved ? Number(saved) : 100000000;
  });
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState("");

  const handleSaveTarget = (e) => {
    e.preventDefault();
    const val = Number(targetInput);
    if (!val || val <= 0) {
      toast.warn("Vui lòng nhập số tiền mục tiêu doanh thu hợp lệ!");
      return;
    }
    setRevenueTarget(val);
    localStorage.setItem("admin_revenue_target", String(val));
    setIsEditingTarget(false);
    toast.success("Đã cập nhật mục tiêu doanh thu thành công!");
  };

  // Fetch Dashboard Analytics APIs
  const { data: kpis, isLoading: isKpisLoading } = useDashboardKpis({ range });
  const { data: revenueData, isLoading: isRevenueLoading } = useDashboardRevenueChart({ range });
  const { data: orderAnalytics, isLoading: isOrderAnalyticsLoading } = useDashboardOrderAnalytics({ range });
  const { data: topProducts, isLoading: isTopProductsLoading } = useDashboardTopProducts({ range, limit: 5 });
  const { data: categoryRevenues, isLoading: isCategoryLoading } = useDashboardCategoryRevenue({ range });
  const { data: lowStockPage, isLoading: isLowStockLoading } = useDashboardLowStock({ threshold: 5, page: 0, size: 5 });

  const statusLabels = {
    PENDING_APPROVAL: "Chờ duyệt",
    PENDING_PAYMENT: "Chờ thanh toán",
    AWAITING_PICKUP: "Chờ lấy hàng",
    IN_TRANSIT: "Đang giao",
    DELIVERED: "Đã giao",
    DELIVERY_FAILED: "Giao thất bại",
    CANCELED: "Đã hủy",
  };

  const statusColors = {
    PENDING_APPROVAL: "bg-amber-50 text-amber-700 border-amber-200",
    PENDING_PAYMENT: "bg-[#fcf8e8] text-yellow-800 border-yellow-200",
    AWAITING_PICKUP: "bg-blue-50 text-blue-700 border-blue-200",
    IN_TRANSIT: "bg-indigo-50 text-indigo-700 border-indigo-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    DELIVERY_FAILED: "bg-rose-50 text-rose-700 border-rose-200",
    CANCELED: "bg-neutral-100 text-neutral-600 border-neutral-200",
  };

  return (
    <div className="flex bg-[#fbf9f9] min-h-screen text-black font-sans select-none text-left">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab="dashboard" />

      {/* Main Content */}
      <div className="ml-56 flex-1 min-h-screen flex flex-col">
        <AdminHeader />

        <main className="p-8 md:p-12 max-w-[1440px] w-full mx-auto flex-1 space-y-10">
          
          {/* Page Header & Range Filter */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 border border-neutral-200 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.25em] block mb-1">
                LUMIÈRE MANAGEMENT
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold uppercase tracking-tight text-black">
                Tổng Quan & Báo Cáo Thống Kê
              </h2>
              <p className="text-xs text-neutral-500 font-light mt-1">
                Theo dõi các chỉ số kinh doanh, biểu đồ doanh thu, hiệu suất đơn hàng và tồn kho.
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-[#f8f7f5] border border-neutral-300 px-3 py-2">
                <span className="text-xs font-semibold text-neutral-600">Khoảng thời gian:</span>
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-black uppercase outline-none cursor-pointer"
                >
                  <option value="TODAY">Hôm nay</option>
                  <option value="THIS_WEEK">Tuần này</option>
                  <option value="THIS_MONTH">Tháng này</option>
                  <option value="THIS_QUARTER">Quý này</option>
                  <option value="THIS_YEAR">Năm nay</option>
                </select>
              </div>

              <button
                onClick={() => toast.info("Đang xuất báo cáo thống kê định dạng PDF/Excel...")}
                className="px-5 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
              >
                <FiDownload size={14} />
                Xuất báo cáo
              </button>
            </div>
          </div>

          {/* 1. KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="bg-white p-6 border border-neutral-200 hover:border-black transition-all shadow-2xs group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Tổng Doanh Thu
                  </span>
                  <div className="p-2 bg-neutral-100 rounded-full text-black">
                    <FiDollarSign size={16} />
                  </div>
                </div>
                <div className="font-serif text-2xl font-bold text-black mb-2">
                  {isKpisLoading ? "..." : formatCurrency(kpis?.totalRevenue)}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs mt-2 border-t border-neutral-100 pt-3">
                {kpis?.revenueGrowthRate !== null && kpis?.revenueGrowthRate !== undefined ? (
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      kpis.revenueGrowthRate >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {kpis.revenueGrowthRate >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    {kpis.revenueGrowthRate > 0 ? `+${kpis.revenueGrowthRate}%` : `${kpis.revenueGrowthRate}%`}
                  </span>
                ) : (
                  <span className="text-neutral-400 font-medium">Không có dữ liệu kỳ trước</span>
                )}
                <span className="text-neutral-400 text-[11px]">so với kỳ trước</span>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white p-6 border border-neutral-200 hover:border-black transition-all shadow-2xs group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Tổng Số Đơn Hàng
                  </span>
                  <div className="p-2 bg-neutral-100 rounded-full text-black">
                    <FiShoppingBag size={16} />
                  </div>
                </div>
                <div className="font-serif text-2xl font-bold text-black mb-2">
                  {isKpisLoading ? "..." : `${kpis?.totalOrders || 0} đơn`}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs mt-2 border-t border-neutral-100 pt-3">
                {kpis?.ordersGrowthRate !== null && kpis?.ordersGrowthRate !== undefined ? (
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      kpis.ordersGrowthRate >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {kpis.ordersGrowthRate >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    {kpis.ordersGrowthRate > 0 ? `+${kpis.ordersGrowthRate}%` : `${kpis.ordersGrowthRate}%`}
                  </span>
                ) : (
                  <span className="text-neutral-400 font-medium">Ổn định</span>
                )}
                <span className="text-neutral-400 text-[11px]">phát sinh trong kỳ</span>
              </div>
            </div>

            {/* Action Required Orders */}
            <div className="bg-white p-6 border border-neutral-200 hover:border-black transition-all shadow-2xs group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Đơn Cần Xử Lý Ngay
                  </span>
                  <div className="p-2 bg-amber-50 text-amber-700 rounded-full">
                    <FiAlertTriangle size={16} />
                  </div>
                </div>
                <div className="font-serif text-2xl font-bold text-amber-700 mb-2">
                  {isKpisLoading ? "..." : `${kpis?.actionRequiredOrders || 0} đơn`}
                </div>
              </div>
              <div className="text-xs text-neutral-500 mt-2 border-t border-neutral-100 pt-3">
                <Link to="/admin/orders" className="text-black font-semibold underline hover:text-neutral-700">
                  Duyệt & chuẩn bị hàng ngay &rarr;
                </Link>
              </div>
            </div>

            {/* Low Stock Warning */}
            <div className="bg-white p-6 border border-neutral-200 hover:border-black transition-all shadow-2xs group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Cảnh Báo Tồn Kho Thấp
                  </span>
                  <div className="p-2 bg-rose-50 text-rose-700 rounded-full">
                    <FiPackage size={16} />
                  </div>
                </div>
                <div className="font-serif text-2xl font-bold text-rose-700 mb-2">
                  {isKpisLoading ? "..." : `${kpis?.lowStockCount || 0} sản phẩm`}
                </div>
              </div>
              <div className="text-xs text-neutral-500 mt-2 border-t border-neutral-100 pt-3">
                <span className="text-rose-600 font-semibold">Tồn kho dưới 5 sản phẩm</span>
              </div>
            </div>
          </div>

          {/* Revenue Report & Quarterly Target Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-[#f5f3f3] p-6 md:p-8 border border-neutral-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xs">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                  BÁO CÁO DOANH THU THỰC TẾ
                </span>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-black mb-1">
                  Tổng Doanh Thu Thực Tế (Giao Thành Công)
                </h3>
                <p className="text-xs text-neutral-600 max-w-md leading-relaxed">
                  Tổng giá trị doanh thu thực tế ghi nhận từ các đơn hàng hoàn tất giao thành công (DELIVERED).
                </p>
                <div className="mt-3 font-serif text-3xl font-bold text-black">
                  {isKpisLoading ? "..." : formatCurrency(kpis?.totalRevenue)}
                </div>
              </div>
              <div className="w-24 h-24 relative overflow-hidden bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-5xl text-neutral-400">
                  monitoring
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 bg-black p-6 md:p-8 text-white flex flex-col justify-between shadow-2xs relative group">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-bold">
                    MỤC TIÊU DOANH THU QUÝ
                  </h3>
                  <button
                    onClick={() => {
                      setTargetInput(String(revenueTarget));
                      setIsEditingTarget(true);
                    }}
                    className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-xs"
                    title="Chỉnh sửa mục tiêu doanh thu quý"
                  >
                    <FiEdit2 size={15} />
                  </button>
                </div>

                <p className="font-serif text-3xl md:text-4xl font-bold leading-tight text-white">
                  {formatCurrency(revenueTarget)}
                </p>
                <p className="text-[10px] uppercase tracking-wider mt-1 text-neutral-400 font-bold">
                  Mục tiêu Quý hiện tại
                </p>
              </div>

              <div className="mt-6 border-t border-white/20 pt-3">
                <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase">
                  <span>
                    {revenueTarget > 0
                      ? `${Math.round(((Number(kpis?.totalRevenue) || 0) / revenueTarget) * 100)}% ĐẠT MỤC TIÊU`
                      : "0% ĐẠT MỤC TIÊU"}
                  </span>
                  <FiTrendingUp className="text-emerald-400" size={16} />
                </div>
                <div className="w-full h-1.5 bg-white/20 mt-2">
                  <div
                    style={{
                      width: `${
                        revenueTarget > 0
                          ? Math.min(100, Math.round(((Number(kpis?.totalRevenue) || 0) / revenueTarget) * 100))
                          : 0
                      }%`,
                    }}
                    className="h-full bg-emerald-400 transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Charts Section: Revenue Trend & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 Cols: Revenue Time Series Chart */}
            <div className="lg:col-span-8 bg-white border border-neutral-200 p-6 md:p-8 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-black uppercase tracking-wide">
                      Biểu Đồ Doanh Thu Theo Thời Gian
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Thống kê doanh thu thực tế và số lượng đơn hàng qua từng mốc thời gian.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase block">Giá Trị Đơn Trung Bình (AOV)</span>
                    <span className="font-serif font-bold text-base text-black">
                      {formatCurrency(revenueData?.averageOrderValue)}
                    </span>
                  </div>
                </div>

                {/* Time Series Bar Display */}
                {isRevenueLoading ? (
                  <div className="h-64 flex items-center justify-center text-xs text-neutral-400">
                    Đang tải dữ liệu biểu đồ...
                  </div>
                ) : !revenueData?.timeSeries || revenueData.timeSeries.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-xs text-neutral-400 italic">
                    Chưa có dữ liệu doanh thu trong khoảng thời gian này
                  </div>
                ) : (
                  <div className="h-64 w-full flex items-end justify-between gap-3 px-2 pb-4 border-b border-neutral-200 overflow-x-auto">
                    {revenueData.timeSeries.map((point, idx) => {
                      const maxRev = Math.max(...revenueData.timeSeries.map((p) => Number(p.revenue) || 1));
                      const revVal = Number(point.revenue) || 0;
                      const heightPercent = maxRev > 0 ? (revVal > 0 ? Math.max(8, Math.round((revVal / maxRev) * 100)) : 3) : 3;

                      return (
                        <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center gap-2 group min-w-[36px]">
                          <div className="text-[9px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            {point.orderCount} đơn
                          </div>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-black hover:bg-neutral-700 transition-all rounded-t-xs"
                            title={`${point.label}: ${formatCurrency(point.revenue)} (${point.orderCount} đơn)`}
                          />
                          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider truncate max-w-full">
                            {point.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payment Methods Breakdown Footer */}
              <div className="mt-6 pt-4 border-t border-neutral-100 grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#f8f7f5] border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">COD (Thanh toán khi nhận hàng)</span>
                  <div className="font-bold text-black text-sm">
                    {formatCurrency(revenueData?.paymentMethodDistribution?.COD?.revenue)}
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {revenueData?.paymentMethodDistribution?.COD?.orderCount || 0} đơn hàng
                  </span>
                </div>
                <div className="p-3 bg-[#f8f7f5] border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">ONLINE PAYMENT (Chuyển khoản/PayOS)</span>
                  <div className="font-bold text-black text-sm">
                    {formatCurrency(revenueData?.paymentMethodDistribution?.ONLINE_PAYMENT?.revenue)}
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {revenueData?.paymentMethodDistribution?.ONLINE_PAYMENT?.orderCount || 0} đơn hàng
                  </span>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Order Analytics & Status Distribution */}
            <div className="lg:col-span-4 bg-white border border-neutral-200 p-6 md:p-8 flex flex-col justify-between shadow-2xs">
              <div>
                <h3 className="font-serif text-lg font-bold text-black uppercase tracking-wide mb-1">
                  Phân Tích Trạng Thái Đơn
                </h3>
                <p className="text-xs text-neutral-500 mb-6">
                  Tỷ lệ giao nhận thành công và chiết khấu khuyến mãi.
                </p>

                {/* Delivery Rates */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Tỷ lệ giao hàng thành công</span>
                      <span className="text-emerald-700 font-bold">{orderAnalytics?.deliverySuccessRate || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 overflow-hidden">
                      <div
                        style={{ width: `${orderAnalytics?.deliverySuccessRate || 0}%` }}
                        className="h-full bg-emerald-600 transition-all duration-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Tỷ lệ hủy / Giao thất bại</span>
                      <span className="text-rose-700 font-bold">{orderAnalytics?.cancelOrFailedRate || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 overflow-hidden">
                      <div
                        style={{ width: `${orderAnalytics?.cancelOrFailedRate || 0}%` }}
                        className="h-full bg-rose-600 transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Discount Summary */}
                <div className="p-3 bg-amber-50/60 border border-amber-200 text-xs mb-6">
                  <span className="text-[10px] text-amber-800 font-bold uppercase block mb-1">
                    Tổng Giảm Giá Voucher Đã Áp Dụng
                  </span>
                  <div className="font-serif text-lg font-bold text-amber-900">
                    {formatCurrency(orderAnalytics?.totalDiscountGiven)}
                  </div>
                </div>

                {/* Status Count List */}
                <div className="space-y-2">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block mb-2">Phân bổ trạng thái đơn:</span>
                  {orderAnalytics?.statusCounts &&
                    Object.entries(orderAnalytics.statusCounts).map(([statusKey, count]) => (
                      <div key={statusKey} className="flex justify-between items-center text-xs p-2 border-b border-neutral-100">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${statusColors[statusKey] || "bg-neutral-100"}`}>
                          {statusLabels[statusKey] || statusKey}
                        </span>
                        <span className="font-bold text-black">{count} đơn</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Top Products & Category Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 Cols: Top Selling Products */}
            <div className="lg:col-span-7 bg-white border border-neutral-200 p-6 md:p-8 shadow-2xs">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-black uppercase tracking-wide">
                    Top Sản Phẩm Bán Chạy Nhất
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Dẫn đầu doanh số và lượt đặt mua trong kỳ.
                  </p>
                </div>
                <Link to="/admin/products" className="text-[10px] font-bold uppercase text-neutral-500 hover:text-black underline">
                  Quản lý sản phẩm
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f5f4f2] border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Sản phẩm</th>
                      <th className="py-3 px-3 text-center">Đã bán</th>
                      <th className="py-3 px-3 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {isTopProductsLoading ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-neutral-400">
                          Đang tải danh sách top sản phẩm...
                        </td>
                      </tr>
                    ) : !topProducts || topProducts.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-neutral-400 italic">
                          Chưa có dữ liệu bán ra
                        </td>
                      </tr>
                    ) : (
                      topProducts.map((prod) => (
                        <tr key={prod.productId} className="hover:bg-neutral-50">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              {prod.thumbnailUrl ? (
                                <img
                                  src={prod.thumbnailUrl}
                                  alt={prod.productName}
                                  className="w-10 h-10 object-cover border border-neutral-200 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-neutral-200 flex items-center justify-center text-neutral-500 text-[10px] shrink-0">
                                  No Img
                                </div>
                              )}
                              <span className="font-bold text-black line-clamp-1">{prod.productName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-black">{prod.totalQuantitySold} sp</td>
                          <td className="py-3 px-3 text-right font-bold text-black">{formatCurrency(prod.totalRevenue)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 5 Cols: Category Revenue Distribution */}
            <div className="lg:col-span-5 bg-white border border-neutral-200 p-6 md:p-8 shadow-2xs">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-black uppercase tracking-wide">
                    Tỷ Trọng Doanh Thu Theo Danh Mục
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Phân bổ doanh thu đóng góp theo từng ngành hàng.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {isCategoryLoading ? (
                  <div className="py-8 text-center text-xs text-neutral-400">Đang tải dữ liệu danh mục...</div>
                ) : !categoryRevenues || categoryRevenues.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400 italic">Chưa có dữ liệu doanh thu danh mục</div>
                ) : (
                  categoryRevenues.map((cat) => (
                    <div key={cat.categoryId} className="p-3.5 bg-[#fbf9f9] border border-neutral-200 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-black">{cat.categoryName}</span>
                        <span className="font-mono text-xs font-bold text-black">{cat.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 overflow-hidden">
                        <div style={{ width: `${cat.percentage}%` }} className="h-full bg-black" />
                      </div>
                      <div className="text-[10px] text-neutral-500 font-semibold text-right">
                        Doanh thu: {formatCurrency(cat.revenue)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 4. Low Stock Alert Table */}
          <div className="bg-white border border-neutral-200 p-6 md:p-8 shadow-2xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-black uppercase tracking-wide text-rose-700 flex items-center gap-2">
                  <FiAlertTriangle size={18} />
                  Danh Sách Biến Thể Sản Phẩm Sắp Hết Hàng (Tồn Kho &le; 5)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Cần cập nhật bổ sung số lượng tồn kho để không bị gián đoạn đơn hàng.
                </p>
              </div>
              <Link to="/admin/products" className="text-[10px] font-bold uppercase text-neutral-500 hover:text-black underline">
                Nhập kho ngay
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-rose-50/50 border-b border-neutral-200 text-neutral-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Ảnh</th>
                    <th className="py-3 px-4">Tên sản phẩm</th>
                    <th className="py-3 px-4">Phân loại (Màu - Size)</th>
                    <th className="py-3 px-4 text-center">Đơn giá</th>
                    <th className="py-3 px-4 text-center">Số lượng tồn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {isLowStockLoading ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-neutral-400">
                        Đang tải danh sách tồn kho thấp...
                      </td>
                    </tr>
                  ) : !lowStockPage?.content || lowStockPage.content.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-emerald-700 font-semibold italic">
                        Tất cả sản phẩm hiện tại đều có số lượng tồn kho an toàn (&gt; 5 sản phẩm)!
                      </td>
                    </tr>
                  ) : (
                    lowStockPage.content.map((item) => (
                      <tr key={item.variationId} className="hover:bg-rose-50/30">
                        <td className="py-3 px-4">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 object-cover border border-neutral-200" />
                          ) : (
                            <div className="w-10 h-10 bg-neutral-200 flex items-center justify-center text-[9px] text-neutral-500">No Img</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-black">{item.productName}</td>
                        <td className="py-3 px-4 font-medium text-neutral-700">
                          {item.colorName || "N/A"} - Size {item.size || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-black">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-mono font-bold rounded-full border border-rose-300">
                            {item.stockQuantity} sp
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* Edit Revenue Target Modal */}
      {isEditingTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-300 max-w-md w-full p-6 md:p-8 shadow-2xl animate-fade-in relative text-left">
            <button
              onClick={() => setIsEditingTarget(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-black cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                LUMIÈRE MANAGEMENT
              </span>
              <h3 className="font-serif text-xl font-bold uppercase text-black">
                Cập Nhật Mục Tiêu Doanh Thu
              </h3>
              <p className="text-xs text-neutral-500 font-light mt-1">
                Thiết lập chỉ số mục tiêu doanh thu quý để tính toán tỷ lệ % hoàn thành trên Dashboard.
              </p>
            </div>

            <form onSubmit={handleSaveTarget} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Số tiền mục tiêu (VND)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000000"
                    step="5000000"
                    required
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    className="w-full bg-[#fbf9f9] border border-neutral-300 px-4 py-3 text-sm font-mono font-bold text-black outline-none focus:border-black"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                    VND
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 italic mt-2">
                  Ví dụ: `100000000` = 100 Triệu VNĐ
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingTarget(false)}
                  className="px-5 py-2.5 border border-neutral-300 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <FiCheck size={16} /> Lưu mục tiêu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
