import React, { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  FiSearch,
  FiFilter,
  FiTrendingUp,
  FiStar,
  FiMoreHorizontal,
  FiDownload,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheck,
} from "react-icons/fi";

const AdminCustomers = () => {
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const customersData = [
    {
      id: 1,
      name: "Adriana Laurent",
      email: "adriana.l@vogue-paris.com",
      phone: "+33 6 12 34 56 78",
      address: "21 Rue du Faubourg Saint-Honoré, Paris",
      initials: "AL",
      avatarBg: "bg-[#e9dfcb] text-[#696253]",
      tier: "Platinum",
      tierBadge: "bg-black text-white",
      totalOrders: 18,
      totalSpend: "311.250.000₫",
      lastPurchase: "2 ngày trước",
    },
    {
      id: 2,
      name: "Marcus Thorne",
      email: "m.thorne@london-studios.co.uk",
      phone: "+44 20 7946 0912",
      address: "14 Mayfair Square, London",
      avatarImg:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
      tier: "Gold",
      tierBadge: "border border-black text-black",
      totalOrders: 12,
      totalSpend: "223.000.000₫",
      lastPurchase: "1 tuần trước",
    },
    {
      id: 3,
      name: "Julianne Wei",
      email: "j.wei@shanghai-global.cn",
      phone: "+86 21 6123 4567",
      address: "88 Nanjing West Road, Shanghai",
      initials: "JW",
      avatarBg: "bg-[#c6c6c7] text-black",
      tier: "Platinum",
      tierBadge: "bg-black text-white",
      totalOrders: 34,
      totalSpend: "602.750.000₫",
      lastPurchase: "Hôm qua",
    },
    {
      id: 4,
      name: "Sebastian Berg",
      email: "s.berg@berlin-design.de",
      phone: "+49 30 1234 5678",
      address: "5 Friedrichstraße, Berlin",
      initials: "SB",
      avatarBg: "bg-neutral-200 text-neutral-600",
      tier: "Silver",
      tierBadge: "border border-neutral-300 text-neutral-500",
      totalOrders: 5,
      totalSpend: "52.500.000₫",
      lastPurchase: "3 tuần trước",
    },
    {
      id: 5,
      name: "Olivia Chen",
      email: "olivia.chen@nyc-arts.org",
      phone: "+1 212 555 0199",
      address: "740 Park Avenue, New York",
      initials: "OC",
      avatarBg: "bg-[#ece1ce] text-[#201b0f]",
      tier: "Gold",
      tierBadge: "border border-black text-black",
      totalOrders: 21,
      totalSpend: "393.750.000₫",
      lastPurchase: "4 ngày trước",
    },
  ];

  const filteredCustomers = customersData.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "ALL") return matchesSearch;
    if (activeTab === "PLATINUM") return matchesSearch && cust.tier === "Platinum";
    if (activeTab === "GOLD") return matchesSearch && cust.tier === "Gold";
    if (activeTab === "SILVER") return matchesSearch && cust.tier === "Silver";
    return matchesSearch;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCustomers(filteredCustomers.map((c) => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter((item) => item !== id));
    } else {
      setSelectedCustomers([...selectedCustomers, id]);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  return (
    <div className="flex bg-[#fbf9f9] min-h-screen text-black font-sans select-none text-left">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab="customers" />

      {/* Main Content */}
      <div className="ml-56 flex-1 min-h-screen flex flex-col">
        <AdminHeader />

        <main className="p-8 md:p-12 max-w-[1440px] w-full mx-auto flex-1">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-16 right-8 z-50 bg-black text-white px-6 py-3.5 shadow-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 animate-fade-in border border-neutral-700">
              <FiCheck className="text-emerald-400 text-lg" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Breadcrumb & Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <nav className="flex mb-3 space-x-2 text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
                <span>Admin</span>
                <span>/</span>
                <span className="text-black">Customers</span>
              </nav>
              <h2 className="font-serif text-3xl md:text-5xl font-bold uppercase tracking-tight text-black">
                Relationship Management
              </h2>
              <p className="text-xs md:text-sm text-neutral-500 font-light mt-2 max-w-2xl">
                Quản lý phân hạng & hồ sơ khách hàng VIP toàn cầu. Theo dõi lịch sử mua hàng, hạn mức chi tiêu và đặc quyền hạng thành viên Lumière.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const csvContent =
                    "data:text/csv;charset=utf-8," +
                    ["ID,Name,Email,Tier,Total Orders,Total Spend,Last Purchase"]
                      .concat(
                        customersData.map(
                          (c) =>
                            `${c.id},"${c.name}","${c.email}",${c.tier},${c.totalOrders},"${c.totalSpend}","${c.lastPurchase}"`
                        )
                      )
                      .join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "lumiere_customers.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-6 py-3 bg-white border border-black text-black text-xs font-bold tracking-widest uppercase transition-all duration-200 hover:bg-black hover:text-white cursor-pointer active:scale-95 shadow-xs"
              >
                Export CSV
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-black text-white text-xs font-bold tracking-widest uppercase transition-all duration-200 hover:bg-neutral-800 cursor-pointer active:scale-95 shadow-xs flex items-center gap-2"
              >
                <FiPlus size={14} />
                Thêm Khách Hàng
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 border border-neutral-200 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                TOTAL CUSTOMERS
              </p>
              <p className="font-serif text-3xl font-bold text-black">12.842</p>
              <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                <FiTrendingUp size={14} /> +12% tháng này
              </p>
            </div>

            <div className="bg-white p-6 border border-neutral-200 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                ACTIVE THIS WEEK
              </p>
              <p className="font-serif text-3xl font-bold text-black">3.104</p>
              <p className="text-xs text-neutral-500 font-light mt-2">
                Tỷ lệ tương tác 24%
              </p>
            </div>

            <div className="bg-white p-6 border border-neutral-200 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                AVERAGE LTV
              </p>
              <p className="font-serif text-3xl font-bold text-black">
                107.000.000₫
              </p>
              <p className="text-xs text-neutral-500 font-light mt-2">
                Trung bình Hạng 1
              </p>
            </div>

            <div className="bg-white p-6 border border-neutral-200 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                RETENTION RATE
              </p>
              <p className="font-serif text-3xl font-bold text-black">88.2%</p>
              <p className="text-xs text-amber-600 font-bold mt-2 flex items-center gap-1">
                <FiStar size={14} /> Khách hàng thân thiết
              </p>
            </div>
          </div>

          {/* Filters & Search Row */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6 pb-4 border-b border-neutral-300">
            {/* Filter Tabs */}
            <div className="flex items-center gap-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`text-xs font-bold uppercase tracking-widest pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "ALL"
                    ? "border-black text-black"
                    : "border-transparent text-neutral-400 hover:text-black"
                }`}
              >
                TẤT CẢ KHÁCH HÀNG ({customersData.length})
              </button>
              <button
                onClick={() => setActiveTab("PLATINUM")}
                className={`text-xs font-bold uppercase tracking-widest pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "PLATINUM"
                    ? "border-black text-black"
                    : "border-transparent text-neutral-400 hover:text-black"
                }`}
              >
                PLATINUM TIER
              </button>
              <button
                onClick={() => setActiveTab("GOLD")}
                className={`text-xs font-bold uppercase tracking-widest pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "GOLD"
                    ? "border-black text-black"
                    : "border-transparent text-neutral-400 hover:text-black"
                }`}
              >
                GOLD TIER
              </button>
              <button
                onClick={() => setActiveTab("SILVER")}
                className={`text-xs font-bold uppercase tracking-widest pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "SILVER"
                    ? "border-black text-black"
                    : "border-transparent text-neutral-400 hover:text-black"
                }`}
              >
                SILVER TIER
              </button>
            </div>

            {/* Search Box */}
            <div className="relative flex items-center w-full md:w-72 border-b border-neutral-300 pb-1">
              <input
                type="text"
                placeholder="Tìm Tên, Email khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-xs text-black placeholder-neutral-400 pr-6 py-1"
              />
              <FiSearch
                size={14}
                className="absolute right-0 text-neutral-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-white border border-neutral-200 overflow-hidden shadow-xs mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f5f4f2] border-b border-neutral-200">
                    <th className="py-4 px-4 w-12 text-center">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          selectedCustomers.length === filteredCustomers.length &&
                          filteredCustomers.length > 0
                        }
                        className="rounded-none border-neutral-300 text-black focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-4 font-bold text-[10px] uppercase text-neutral-500 tracking-widest">
                      Khách hàng
                    </th>
                    <th className="py-4 px-4 font-bold text-[10px] uppercase text-neutral-500 tracking-widest">
                      Phân hạng
                    </th>
                    <th className="py-4 px-4 font-bold text-[10px] uppercase text-neutral-500 tracking-widest text-right">
                      Tổng đơn
                    </th>
                    <th className="py-4 px-4 font-bold text-[10px] uppercase text-neutral-500 tracking-widest text-right">
                      Tổng chi tiêu
                    </th>
                    <th className="py-4 px-4 font-bold text-[10px] uppercase text-neutral-500 tracking-widest text-right">
                      Mua gần nhất
                    </th>
                    <th className="py-4 px-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-xs font-sans">
                  {filteredCustomers.map((cust) => {
                    const isSelected = selectedCustomers.includes(cust.id);
                    return (
                      <tr
                        key={cust.id}
                        className={`group hover:bg-neutral-50 transition-colors ${
                          isSelected ? "bg-neutral-50" : ""
                        }`}
                      >
                        <td className="py-5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(cust.id)}
                            className="rounded-none border-neutral-300 text-black focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex items-center">
                            {cust.avatarImg ? (
                              <div className="w-10 h-10 overflow-hidden border border-neutral-200 mr-4 shrink-0">
                                <img
                                  src={cust.avatarImg}
                                  alt={cust.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                className={`w-10 h-10 flex items-center justify-center font-bold text-xs mr-4 shrink-0 ${cust.avatarBg}`}
                              >
                                {cust.initials}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-black text-sm">
                                {cust.name}
                              </p>
                              <p className="text-[11px] text-neutral-400 lowercase">
                                {cust.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <span
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest inline-block ${cust.tierBadge}`}
                          >
                            {cust.tier}
                          </span>
                        </td>
                        <td className="py-5 px-4 text-right font-semibold text-black">
                          {cust.totalOrders}
                        </td>
                        <td className="py-5 px-4 text-right font-bold text-black">
                          {cust.totalSpend}
                        </td>
                        <td className="py-5 px-4 text-right text-neutral-500">
                          {cust.lastPurchase}
                        </td>
                        <td className="py-5 px-4 text-right">
                          <button
                            onClick={() => setSelectedCustomerDetail(cust)}
                            className="p-2 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <FiMoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 bg-[#f5f4f2] border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Hiển thị 1 đến {filteredCustomers.length} của {customersData.length} khách hàng
              </p>
              <div className="flex items-center space-x-1.5">
                <button
                  disabled
                  className="w-8 h-8 flex items-center justify-center border border-neutral-300 bg-white text-black opacity-30 cursor-not-allowed"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center bg-black text-white border border-black text-xs font-bold">
                  1
                </button>
                <button
                  disabled
                  className="w-8 h-8 flex items-center justify-center border border-neutral-300 bg-white text-black opacity-30 cursor-not-allowed"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Customer Detail Drawer Modal */}
      {selectedCustomerDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-fade-in"
          onClick={() => setSelectedCustomerDetail(null)}
        >
          <div
            className="bg-white max-w-xl w-full p-6 md:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col border border-neutral-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                  HỒ SƠ KHÁCH HÀNG VIP
                </span>
                <h3 className="font-serif text-2xl font-bold uppercase text-black">
                  {selectedCustomerDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomerDetail(null)}
                className="text-neutral-500 hover:text-black p-2 transition-colors cursor-pointer rounded-full hover:bg-neutral-100"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-6 text-xs">
              <div className="bg-[#f5f4f2] p-4 border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-neutral-500 font-bold block mb-1">HẠNG THÀNH VIÊN</span>
                  <span
                    className={`inline-block px-3 py-1 text-[10px] font-bold uppercase ${selectedCustomerDetail.tierBadge}`}
                  >
                    {selectedCustomerDetail.tier} Member
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 font-bold block mb-1">TỔNG TÍCH LŨY</span>
                  <span className="font-bold text-sm text-black">
                    {selectedCustomerDetail.totalSpend}
                  </span>
                </div>
              </div>

              <div className="space-y-3 border-b border-neutral-200 pb-4">
                <div className="flex items-center gap-3">
                  <FiMail className="text-neutral-400" size={16} />
                  <span className="text-neutral-700">{selectedCustomerDetail.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiPhone className="text-neutral-400" size={16} />
                  <span className="text-neutral-700">{selectedCustomerDetail.phone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <FiMapPin className="text-neutral-400 shrink-0 mt-0.5" size={16} />
                  <span className="text-neutral-700">{selectedCustomerDetail.address}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-black mb-3">
                  Thống kê mua sắm
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border border-neutral-200">
                    <span className="text-neutral-500 block mb-1">Tổng số đơn hàng</span>
                    <span className="font-bold text-base text-black">
                      {selectedCustomerDetail.totalOrders} đơn
                    </span>
                  </div>
                  <div className="p-3 border border-neutral-200">
                    <span className="text-neutral-500 block mb-1">Lần mua gần nhất</span>
                    <span className="font-bold text-base text-black">
                      {selectedCustomerDetail.lastPurchase}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white max-w-md w-full p-6 md:p-8 relative shadow-2xl border border-neutral-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
              <h3 className="font-serif text-xl font-bold uppercase text-black">
                Thêm Khách Hàng Mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-500 hover:text-black p-1 transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsAddModalOpen(false);
                showToast("Đã thêm hồ sơ khách hàng mới thành công!");
              }}
              className="space-y-4 text-xs font-sans"
            >
              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Anh Tuấn"
                  className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0912 345 678"
                  className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Phân hạng ban đầu
                </label>
                <select className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black bg-white">
                  <option value="Silver">Silver Tier</option>
                  <option value="Gold">Gold Tier</option>
                  <option value="Platinum">Platinum Tier</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 border border-neutral-300 hover:border-black text-black font-bold uppercase text-[10px] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 font-bold uppercase text-[10px] cursor-pointer"
                >
                  Lưu Khách Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
