import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";

const AdminAnalytics = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2024");

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const topProducts = [
    {
      id: 1,
      name: "Sculpted Wool Blazer",
      category: "Apparel / Outerwear",
      price: "12.500.000₫",
      sales: "482",
      image:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=300&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Minimalist Leather Boot",
      category: "Accessories / Footwear",
      price: "8.900.000₫",
      sales: "315",
      image:
        "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=300&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Geometric Gold Pendant",
      category: "Jewelry / Necklaces",
      price: "21.000.000₫",
      sales: "128",
      image:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=300&auto=format&fit=crop",
    },
  ];

  const regionalData = [
    { region: "North America", percentage: 45 },
    { region: "Europe", percentage: 32 },
    { region: "Asia Pacific", percentage: 18 },
    { region: "Middle East", percentage: 5 },
  ];

  return (
    <div className="flex bg-[#fbf9f9] min-h-screen text-black font-sans select-none text-left">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab="analytics" />

      {/* Main Content */}
      <div className="ml-56 flex-1 min-h-screen flex flex-col">
        <AdminHeader />

        <main className="p-8 md:p-12 max-w-[1440px] w-full mx-auto flex-1">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.25em] block mb-1">
                LUMIÈRE MANAGEMENT
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-tight text-black">
                Performance Insights
              </h2>
              <p className="text-xs md:text-sm text-neutral-500 font-light mt-1.5">
                Báo cáo trực quan hóa dữ liệu toàn diện cho năm tài chính {selectedYear}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  toast.info("Đã khởi tạo xuất báo cáo phân tích định dạng PDF/Excel!")
                }
                className="px-5 py-2.5 bg-white border border-neutral-300 hover:border-black text-black text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
              >
                <FiDownload size={14} />
                EXPORT REPORT
              </button>
              <button
                onClick={handleRefresh}
                className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
              >
                <FiRefreshCw
                  size={14}
                  className={refreshing ? "animate-spin" : ""}
                />
                REFRESH DATA
              </button>
            </div>
          </div>

          {/* Stats Grid (4 Metric Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t border-neutral-300 pt-8 mb-12">
            {/* Metric 1 */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                TOTAL REVENUE
              </p>
              <p className="font-serif text-2xl md:text-3xl font-bold text-black">
                2.482.900.000₫
              </p>
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <FiTrendingUp size={14} />
                +14.2% VS LY
              </p>
            </div>

            {/* Metric 2 */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                CONVERSION RATE
              </p>
              <p className="font-serif text-2xl md:text-3xl font-bold text-black">
                3.48%
              </p>
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <FiTrendingUp size={14} />
                +0.2% VS LY
              </p>
            </div>

            {/* Metric 3 */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                AVG ORDER VALUE
              </p>
              <p className="font-serif text-2xl md:text-3xl font-bold text-black">
                4.120.000₫
              </p>
              <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                <FiTrendingDown size={14} />
                -2.1% VS LY
              </p>
            </div>

            {/* Metric 4 */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                ACTIVE CUSTOMERS
              </p>
              <p className="font-serif text-2xl md:text-3xl font-bold text-black">
                12.840
              </p>
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <FiTrendingUp size={14} />
                +8.5% VS LY
              </p>
            </div>
          </div>

          {/* Main Charts Row (Monthly Revenue & Category Allocation) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Large Sales Revenue SVG Chart */}
            <div className="lg:col-span-2 space-y-4 bg-white p-6 border border-neutral-200 shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                <h3 className="text-xs font-bold tracking-widest text-black uppercase">
                  REVENUE TRENDS (MONTHLY)
                </h3>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 text-[10px] uppercase font-bold text-black">
                    <span className="w-2.5 h-2.5 bg-black" /> Current Year
                  </span>
                  <span className="flex items-center gap-2 text-[10px] uppercase font-bold text-neutral-400">
                    <span className="w-2.5 h-2.5 bg-neutral-300" /> Last Year
                  </span>
                </div>
              </div>

              {/* Simulated SVG Area Chart */}
              <div className="h-[360px] w-full border border-neutral-200 bg-[#FAF9F7] relative overflow-hidden group">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />

                <svg
                  className="absolute inset-0 w-full h-full p-8 overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 1000 400"
                >
                  {/* Gradient Area Fill */}
                  <path
                    d="M0,350 L100,320 L200,340 L300,280 L400,200 L500,250 L600,150 L700,100 L800,180 L900,120 L1000,50 L1000,400 L0,400 Z"
                    fill="rgba(0,0,0,0.04)"
                  />
                  {/* Secondary Line (Last Year) */}
                  <path
                    d="M0,360 L100,340 L200,330 L300,310 L400,290 L500,280 L600,260 L700,240 L800,230 L900,210 L1000,200"
                    fill="none"
                    stroke="#cfc4c5"
                    strokeDasharray="4,4"
                    strokeWidth="2"
                  />
                  {/* Primary Line (Current Year) */}
                  <path
                    d="M0,350 L100,320 L200,340 L300,280 L400,200 L500,250 L600,150 L700,100 L800,180 L900,120 L1000,50"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="3"
                  />
                  {/* Highlight Point */}
                  <circle
                    className="group-hover:scale-150 transition-transform duration-300 cursor-pointer"
                    cx="700"
                    cy="100"
                    fill="#000000"
                    r="5"
                  />
                </svg>

                {/* Y-Axis Labels */}
                <div className="absolute left-4 top-8 bottom-8 flex flex-col justify-between text-[10px] text-neutral-400 font-bold">
                  <span>500M₫</span>
                  <span>400M₫</span>
                  <span>300M₫</span>
                  <span>200M₫</span>
                  <span>100M₫</span>
                  <span>0</span>
                </div>

                {/* X-Axis Labels */}
                <div className="absolute bottom-3 left-14 right-8 flex justify-between text-[10px] text-neutral-500 font-bold">
                  <span>JAN</span>
                  <span>FEB</span>
                  <span>MAR</span>
                  <span>APR</span>
                  <span>MAY</span>
                  <span>JUN</span>
                  <span>JUL</span>
                  <span>AUG</span>
                  <span>SEP</span>
                  <span>OCT</span>
                  <span>NOV</span>
                  <span>DEC</span>
                </div>
              </div>
            </div>

            {/* Donut Chart for Category Allocation */}
            <div className="space-y-4 bg-white p-6 border border-neutral-200 shadow-xs flex flex-col justify-between">
              <h3 className="text-xs font-bold tracking-widest text-black uppercase pb-2 border-b border-neutral-100">
                CATEGORY ALLOCATION
              </h3>

              <div className="flex flex-col items-center justify-center p-4">
                <div className="relative w-48 h-48">
                  {/* SVG Donut */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      fill="none"
                      r="16"
                      stroke="#e4e2e2"
                      strokeWidth="4"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      fill="none"
                      r="16"
                      stroke="#000000"
                      strokeDasharray="60, 100"
                      strokeWidth="4"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      fill="none"
                      r="16"
                      stroke="#645e4f"
                      strokeDasharray="25, 100"
                      strokeDashoffset="-60"
                      strokeWidth="4"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      fill="none"
                      r="16"
                      stroke="#cfc4c5"
                      strokeDasharray="15, 100"
                      strokeDashoffset="-85"
                      strokeWidth="4"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-serif text-2xl font-bold text-black">
                      100%
                    </span>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
                      Tỷ trọng
                    </span>
                  </div>
                </div>

                <div className="mt-8 w-full space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-black" />
                      <span className="font-semibold text-black">Trang phục (Apparel)</span>
                    </div>
                    <span className="font-bold text-black">60%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#645e4f]" />
                      <span className="font-semibold text-black">Phụ kiện (Accessories)</span>
                    </div>
                    <span className="font-bold text-black">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#cfc4c5]" />
                      <span className="font-semibold text-black">Trang sức (Jewelry)</span>
                    </div>
                    <span className="font-bold text-black">15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Grid Section: Top Products & Regional Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Performing Products List */}
            <div className="lg:col-span-2 space-y-4 bg-white p-6 md:p-8 border border-neutral-200 shadow-xs">
              <div className="flex justify-between items-end border-b border-neutral-200 pb-4">
                <h3 className="text-xs font-bold tracking-widest text-black uppercase">
                  TOP PERFORMING PRODUCTS
                </h3>
                <Link
                  to="/admin/products"
                  className="text-[10px] font-bold uppercase underline underline-offset-4 hover:text-neutral-500 transition-colors"
                >
                  XEM TẤT CẢ SẢN PHẨM
                </Link>
              </div>

              <div className="divide-y divide-neutral-200/60 font-sans">
                {topProducts.map((p) => (
                  <div
                    key={p.id}
                    className="py-5 flex items-center justify-between group hover:bg-neutral-50/50 px-2 transition-colors"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-18 bg-neutral-100 overflow-hidden border border-neutral-200 shrink-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      </div>
                      <div>
                        <p className="font-serif text-base font-semibold text-black">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-neutral-500 uppercase tracking-wider mt-0.5">
                          {p.category}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-black">{p.price}</p>
                      <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5">
                        Đã bán {p.sales} sản phẩm
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Insights */}
            <div className="space-y-4 bg-white p-6 md:p-8 border border-neutral-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold tracking-widest text-black uppercase pb-4 border-b border-neutral-200">
                  REGIONAL INSIGHTS
                </h3>

                <div className="space-y-6 mt-6 text-xs">
                  {regionalData.map((r, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-black uppercase tracking-wider">
                          {r.region}
                        </span>
                        <span className="font-bold text-black">
                          {r.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 border border-neutral-200">
                        <div
                          className="h-full bg-black transition-all duration-500"
                          style={{ width: `${r.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200 mt-6">
                <p className="text-xs text-neutral-600 italic leading-relaxed">
                  "Tỷ lệ tăng trưởng khu vực Châu Á - Thái Bình Dương (APAC) đã vượt dự báo 4.2% trong quý này."
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAnalytics;
