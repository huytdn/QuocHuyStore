import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiPackage,
  FiArrowUpRight,
  FiDownload,
  FiPlus,
} from "react-icons/fi";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("6months");

  // Sample Mock Data for Dashboard UI
  const stats = [
    {
      title: "Tổng Doanh Thu",
      value: "142.500.000₫",
      subtext: "VND",
      growth: "+12.4%",
      isPositive: true,
      chartBars: [40, 60, 30, 80, 50, 95],
    },
    {
      title: "Tổng Đơn Hàng",
      value: "1.284",
      subtext: "Đơn",
      growth: "Ổn định",
      isPositive: true,
      note: "94 đơn đang chờ xử lý",
    },
    {
      title: "Khách Hàng Mới",
      value: "342",
      subtext: "Thành viên",
      growth: "+28%",
      isPositive: true,
      note: "Tăng trưởng so với tháng trước",
    },
    {
      title: "Giá Trị Đơn Trung Bình",
      value: "3.450.000₫",
      subtext: "VND/Đơn",
      growth: "-2.1%",
      isPositive: false,
      note: "Đang tối ưu hóa bán kèm",
    },
  ];

  const revenueMonths = [
    { month: "Tháng 3", current: 65, previous: 45 },
    { month: "Tháng 4", current: 80, previous: 55 },
    { month: "Tháng 5", current: 50, previous: 60 },
    { month: "Tháng 6", current: 95, previous: 70 },
    { month: "Tháng 7", current: 75, previous: 65 },
    { month: "Tháng 8", current: 110, previous: 85 },
  ];

  const recentOrders = [
    {
      id: "#LM-28491",
      customer: "Elena Jensen",
      amount: "12.400.000₫",
      status: "Đã giao thành công",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      time: "10 phút trước",
    },
    {
      id: "#LM-28492",
      customer: "Marcus Russo",
      amount: "8.900.000₫",
      status: "Đang giao hàng",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      time: "25 phút trước",
    },
    {
      id: "#LM-28493",
      customer: "Sienna Kahn",
      amount: "34.200.000₫",
      status: "Chờ duyệt",
      statusColor: "bg-amber-50 text-amber-800 border-amber-200",
      time: "1 giờ trước",
    },
    {
      id: "#LM-28494",
      customer: "Thomas Laurent",
      amount: "5.600.000₫",
      status: "Đã giao thành công",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      time: "2 giờ trước",
    },
  ];

  const topProducts = [
    {
      name: "Áo Khoác Cashmere Oversized",
      category: "Áo Khoác",
      sales: 142,
      revenue: "1.775.000.000₫",
    },
    {
      name: "Đầm Lụa Slip Dress Đen",
      category: "Đầm Nữ",
      sales: 98,
      revenue: "784.000.000₫",
    },
    {
      name: "Túi Cầm Tay Da Thuần",
      category: "Phụ Kiện",
      sales: 76,
      revenue: "1.200.800.000₫",
    },
  ];

  return (
    <div className="flex bg-[#fbf9f9] min-h-screen text-black font-sans select-none text-left">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab="dashboard" />

      {/* Main Content */}
      <div className="ml-56 flex-1 min-h-screen flex flex-col">
        <AdminHeader />

        <main className="p-8 md:p-12 max-w-[1440px] w-full mx-auto flex-1">
          {/* Header & Page Title */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.25em] block mb-1">
                LUMIÈRE MANAGEMENT
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-tight text-black">
                Executive Overview
              </h2>
              <p className="text-xs md:text-sm text-neutral-500 font-light mt-1.5">
                Tổng quan chỉ số phát triển, doanh thu và đơn hàng quý hiện tại.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => alert("Xuất báo cáo định dạng PDF/Excel...")}
                className="px-5 py-2.5 bg-white border border-neutral-300 hover:border-black text-black text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
              >
                <FiDownload size={14} />
                Export Report
              </button>
              <button
                onClick={() => navigate("/admin/products")}
                className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
              >
                <FiPlus size={14} />
                Thêm sản phẩm mới
              </button>
            </div>
          </div>

          {/* Stats Grid (4 Metric Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((st, index) => (
              <div
                key={index}
                className="bg-white p-6 md:p-8 border border-neutral-200 hover:border-black transition-all duration-300 shadow-xs group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 group-hover:text-black transition-colors">
                      {st.title}
                    </span>
                    <span
                      className={`text-[11px] font-bold flex items-center gap-1 ${
                        st.isPositive ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {st.isPositive ? (
                        <FiTrendingUp size={14} />
                      ) : (
                        <FiTrendingDown size={14} />
                      )}
                      {st.growth}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-serif text-2xl md:text-3xl font-bold text-black">
                      {st.value}
                    </span>
                  </div>

                  {st.note && (
                    <p className="text-[11px] text-neutral-500 font-light italic">
                      {st.note}
                    </p>
                  )}
                </div>

                {/* Small bar visualization */}
                {st.chartBars && (
                  <div className="h-8 w-full flex items-end gap-1.5 mt-6">
                    {st.chartBars.map((val, bIdx) => (
                      <div
                        key={bIdx}
                        style={{ height: `${val}%` }}
                        className={`flex-1 transition-all duration-500 ${
                          bIdx === st.chartBars.length - 1
                            ? "bg-black"
                            : "bg-neutral-200 group-hover:bg-neutral-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Main Content Grid: Chart & Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
            {/* Left 8 Cols: Revenue Analytics Chart */}
            <div className="lg:col-span-8 bg-white border border-neutral-200 p-6 md:p-8 flex flex-col justify-between shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h3 className="font-serif text-xl font-bold text-black uppercase tracking-wide">
                    Xu Hướng Doanh Thu (Revenue Trends)
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    So sánh doanh thu thực tế giữa năm nay và cùng kỳ năm ngoái.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-black">
                    <span className="w-2.5 h-2.5 bg-black rounded-full" /> Năm Nay
                  </span>
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-neutral-400">
                    <span className="w-2.5 h-2.5 bg-neutral-300 rounded-full" /> Năm Ngoái
                  </span>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-neutral-100 border border-neutral-300 text-[11px] font-bold uppercase px-3 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="6months">6 Tháng gần nhất</option>
                    <option value="year">Cả Năm</option>
                  </select>
                </div>
              </div>

              {/* Bar Chart Representation */}
              <div className="h-64 w-full flex items-end justify-between gap-4 md:gap-8 px-4 pb-4 border-b border-neutral-200">
                {revenueMonths.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-full flex flex-col justify-end items-center gap-2 group"
                  >
                    <div className="w-full flex justify-center items-end gap-1.5 h-48">
                      {/* Previous Year Bar */}
                      <div
                        style={{ height: `${m.previous}%` }}
                        className="w-3 md:w-4 bg-neutral-200 rounded-xs group-hover:bg-neutral-300 transition-all duration-300"
                        title={`Năm ngoái: ${m.previous}M`}
                      />
                      {/* Current Year Bar */}
                      <div
                        style={{ height: `${m.current}%` }}
                        className="w-3 md:w-4 bg-black rounded-xs group-hover:bg-neutral-800 transition-all duration-300"
                        title={`Năm nay: ${m.current}M`}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                      {m.month}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-6 text-xs text-neutral-500">
                <span>* Số liệu được cập nhật trực tiếp từ cổng thanh toán hệ thống</span>
                <Link
                  to="/admin/orders"
                  className="font-bold text-black uppercase tracking-widest text-[10px] hover:underline flex items-center gap-1"
                >
                  Xem chi tiết đơn hàng <FiArrowUpRight size={12} />
                </Link>
              </div>
            </div>

            {/* Right 4 Cols: Recent Orders Widget */}
            <div className="lg:col-span-4 bg-white border border-neutral-200 p-6 md:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif text-lg font-bold text-black uppercase tracking-wide">
                    Đơn Hàng Gần Đây
                  </h3>
                  <Link
                    to="/admin/orders"
                    className="text-[10px] font-bold uppercase text-neutral-500 hover:text-black underline"
                  >
                    Tất cả
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => navigate("/admin/orders")}
                      className="p-3.5 border border-neutral-100 hover:border-black transition-all cursor-pointer bg-[#fdfdfd]"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-bold text-xs text-black">
                          {ord.id}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {ord.time}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-700 font-medium">
                          {ord.customer}
                        </span>
                        <span className="font-bold text-black">
                          {ord.amount}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase border ${ord.statusColor}`}
                        >
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-neutral-200 pt-4">
                <Link
                  to="/admin/orders"
                  className="w-full bg-neutral-100 hover:bg-black hover:text-white text-black text-center py-3 block text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  Vào Quản Lý Đơn Hàng
                </Link>
              </div>
            </div>
          </div>

          {/* Top Selling Products Preview */}
          <div className="bg-white border border-neutral-200 p-6 md:p-8 shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-black uppercase tracking-wide">
                  Sản Phẩm Bán Chạy Nhất (Top Performers)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Các sản phẩm dẫn đầu doanh số bán ra trong tháng này.
                </p>
              </div>
              <Link
                to="/admin/products"
                className="text-[10px] font-bold uppercase text-neutral-500 hover:text-black underline"
              >
                Quản lý kho hàng
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f5f4f2] border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Tên sản phẩm</th>
                    <th className="py-3 px-4">Danh mục</th>
                    <th className="py-3 px-4 text-center">Đã bán</th>
                    <th className="py-3 px-4 text-right">Tổng doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-sans">
                  {topProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50">
                      <td className="py-3.5 px-4 font-bold text-black">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600">
                        {p.category}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        {p.sales} sản phẩm
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-black">
                        {p.revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
