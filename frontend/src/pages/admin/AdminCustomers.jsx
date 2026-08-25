import React, { useState } from "react";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  useAdminUsersSummary,
  useAdminUserList,
  useRecalculateAllSpent,
  useBroadcastMessage,
} from "../../hooks/api/useAdminUsers";
import {
  FiSearch,
  FiUsers,
  FiTrendingUp,
  FiSend,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiUserCheck,
  FiDollarSign,
  FiAward,
  FiFilter,
} from "react-icons/fi";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

const getMemberTier = (totalSpent = 0) => {
  const spent = Number(totalSpent) || 0;
  if (spent >= 10000000) {
    return {
      name: "Kim Cương (VIP)",
      badgeClass: "bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 text-white font-extrabold shadow-sm border border-purple-400",
      tierTag: "DIAMOND",
      icon: "💎",
    };
  }
  if (spent >= 5000000) {
    return {
      name: "Hạng Vàng",
      badgeClass: "bg-amber-400 text-amber-950 font-bold border border-amber-500 shadow-2xs",
      tierTag: "GOLD",
      icon: "🥇",
    };
  }
  if (spent >= 2000000) {
    return {
      name: "Hạng Bạc",
      badgeClass: "bg-slate-200 text-slate-800 font-bold border border-slate-300",
      tierTag: "SILVER",
      icon: "🥈",
    };
  }
  return {
    name: "Hạng Đồng",
    badgeClass: "bg-amber-900/10 text-amber-900 font-semibold border border-amber-700/30",
    tierTag: "BRONZE",
    icon: "🥉",
  };
};

const AdminCustomers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activePage, setActivePage] = useState(0);
  const [selectedTierFilter, setSelectedTierFilter] = useState("ALL");
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    content: "",
    minTotalSpent: 0,
  });

  // API Queries
  const { data: summary, isLoading: isSummaryLoading } = useAdminUsersSummary();
  const { data: userPage, isLoading: isUsersLoading, refetch } = useAdminUserList({
    search: searchQuery || undefined,
    page: activePage,
    size: 10,
    sortBy: "totalSpent",
    sortDirection: "DESC",
  });

  const recalculateMutation = useRecalculateAllSpent();
  const broadcastMutation = useBroadcastMessage();

  const rawUsers = userPage?.content || [];
  const totalElements = userPage?.totalElements || 0;
  const totalPages = userPage?.totalPages || 1;

  // Filter users by client-side Tier selection if specified
  const filteredUsers = rawUsers.filter((u) => {
    if (selectedTierFilter === "ALL") return true;
    const tierTag = getMemberTier(u.totalSpent).tierTag;
    return tierTag === selectedTierFilter;
  });

  // Handle Recalculate All Spent
  const handleRecalculateAll = () => {
    toast.info("Đang đối soát lại tổng chi tiêu cho toàn bộ người dùng...");
    recalculateMutation.mutate(null, {
      onSuccess: (res) => {
        toast.success(res.message || `Đã cập nhật chi tiêu cho ${res.affectedUsers || 0} tài khoản!`);
        refetch();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Đối soát thất bại!");
      },
    });
  };

  // Handle Broadcast Submission
  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.content.trim()) {
      toast.warn("Vui lòng nhập nội dung tin nhắn gửi hàng loạt!");
      return;
    }

    broadcastMutation.mutate(
      {
        content: broadcastForm.content.trim(),
        minTotalSpent: Number(broadcastForm.minTotalSpent) || 0,
      },
      {
        onSuccess: (res) => {
          toast.success(
            `Đã gửi thành công tin nhắn hàng loạt tới ${res.totalSent || 0} khách hàng!`
          );
          setIsBroadcastModalOpen(false);
          setBroadcastForm({ content: "", minTotalSpent: 0 });
        },
        onError: (err) => {
          toast.error(
            err.response?.data?.message || "Gửi tin nhắn hàng loạt thất bại!"
          );
        },
      }
    );
  };

  return (
    <div className="flex bg-[#fbf9f9] min-h-screen text-black font-sans select-none text-left">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab="customers" />

      {/* Main Content */}
      <div className="ml-56 flex-1 min-h-screen flex flex-col">
        <AdminHeader />

        <main className="p-8 md:p-12 max-w-[1440px] w-full mx-auto flex-1 space-y-8">
          
          {/* Header & Page Title */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 border border-neutral-200 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.25em] block mb-1">
                LUMIÈRE MANAGEMENT
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold uppercase tracking-tight text-black">
                Quản Lý Khách Hàng & Phân Hạng Thành Viên
              </h2>
              <p className="text-xs text-neutral-500 font-light mt-1">
                Theo dõi chi tiêu, đối soát tổng chi tiêu tích lũy và gửi thông điệp chăm sóc khách hàng hàng loạt.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleRecalculateAll}
                disabled={recalculateMutation.isPending}
                className="px-4 py-2.5 bg-white border border-neutral-300 hover:border-black text-black text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 shadow-2xs"
                title="Tính toán và đồng bộ lại tổng số tiền đã tiêu từ các đơn giao thành công"
              >
                <FiRefreshCw className={recalculateMutation.isPending ? "animate-spin" : ""} size={14} />
                Đối soát chi tiêu toàn bộ
              </button>

              <button
                onClick={() => setIsBroadcastModalOpen(true)}
                className="px-5 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
              >
                <FiSend size={14} />
                Gửi tin nhắn hàng loạt
              </button>
            </div>
          </div>

          {/* KPI Analytics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Customers */}
            <div className="bg-white p-6 border border-neutral-200 shadow-2xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Tổng Số Khách Hàng
                </span>
                <div className="p-2 bg-neutral-100 rounded-full text-black">
                  <FiUsers size={16} />
                </div>
              </div>
              <div className="font-serif text-2xl font-bold text-black mb-1">
                {isSummaryLoading ? "..." : `${summary?.totalCustomers || 0} tài khoản`}
              </div>
              <p className="text-[11px] text-neutral-400">Tài khoản hoạt động chính thức</p>
            </div>

            {/* New Customers */}
            <div className="bg-white p-6 border border-neutral-200 shadow-2xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Khách Hàng Mới
                </span>
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-full">
                  <FiTrendingUp size={16} />
                </div>
              </div>
              <div className="font-serif text-2xl font-bold text-black mb-1">
                {isSummaryLoading ? "..." : `${summary?.newCustomers || 0} khách`}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold">
                {summary?.newCustomersGrowthRate ? `+${summary.newCustomersGrowthRate}% tăng trưởng` : "Đăng ký trong kỳ"}
              </p>
            </div>

            {/* Paying & Conversion */}
            <div className="bg-white p-6 border border-neutral-200 shadow-2xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Tỷ Lệ Mua Hàng
                </span>
                <div className="p-2 bg-blue-50 text-blue-700 rounded-full">
                  <FiUserCheck size={16} />
                </div>
              </div>
              <div className="font-serif text-2xl font-bold text-black mb-1">
                {isSummaryLoading ? "..." : `${summary?.buyerConversionRate || 0}%`}
              </div>
              <p className="text-[11px] text-neutral-500">
                {summary?.payingCustomersCount || 0} / {summary?.totalCustomers || 0} khách có đơn
              </p>
            </div>

            {/* ARPU */}
            <div className="bg-white p-6 border border-neutral-200 shadow-2xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Doanh Thu / Khách (ARPU)
                </span>
                <div className="p-2 bg-purple-50 text-purple-700 rounded-full">
                  <FiDollarSign size={16} />
                </div>
              </div>
              <div className="font-serif text-xl font-bold text-black mb-1">
                {isSummaryLoading ? "..." : formatCurrency(summary?.arpu)}
              </div>
              <p className="text-[11px] text-neutral-500">
                Lặp lại: <strong className="text-black">{summary?.repeatCustomerRate || 0}%</strong> ({summary?.repeatCustomersCount || 0} khách mua &ge; 2 lần)
              </p>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white p-6 border border-neutral-200 shadow-2xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActivePage(0);
                }}
                placeholder="Tìm tên tài khoản, tên hiển thị hoặc SĐT..."
                className="w-full bg-[#fbf9f9] border border-neutral-300 pl-10 pr-4 py-2.5 text-xs text-black outline-none focus:border-black transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Tier Quick Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
                <FiFilter size={14} /> Hạng:
              </span>
              {[
                { key: "ALL", label: "Tất cả" },
                { key: "DIAMOND", label: "💎 Kim Cương (&ge;10M)" },
                { key: "GOLD", label: "🥇 Vàng (&ge;5M)" },
                { key: "SILVER", label: "🥈 Bạc (&ge;2M)" },
                { key: "BRONZE", label: "🥉 Đồng (<2M)" },
              ].map((tier) => (
                <button
                  key={tier.key}
                  onClick={() => setSelectedTierFilter(tier.key)}
                  className={`px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                    selectedTierFilter === tier.key
                      ? "bg-black text-white"
                      : "bg-[#f8f7f5] text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* User List Table */}
          <div className="bg-white border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-neutral-200 bg-[#fbf9f9] flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Danh sách khách hàng ({totalElements} kết quả)
              </span>
              <span className="text-[11px] text-neutral-400 italic">
                * Tự động sắp xếp theo Tổng chi tiêu tích lũy cao nhất
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f5f4f2] border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Tài khoản / Người dùng</th>
                    <th className="py-3.5 px-4">Số điện thoại</th>
                    <th className="py-3.5 px-4 text-center">Hạng Thành Viên</th>
                    <th className="py-3.5 px-4 text-right">Tổng Chi Tiêu (`totalSpent`)</th>
                    <th className="py-3.5 px-4 text-center">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Ngày tham gia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {isUsersLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-400">
                        Đang tải danh sách khách hàng...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-400 italic">
                        Không tìm thấy khách hàng phù hợp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const tier = getMemberTier(user.totalSpent);

                      return (
                        <tr key={user.id} className="hover:bg-[#fcfbf9] transition-colors">
                          {/* User info */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none">
                                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div>
                                <div className="font-bold text-black text-sm">{user.displayName || user.username}</div>
                                <div className="text-[11px] text-neutral-400 font-mono">@{user.username}</div>
                              </div>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="py-4 px-4 font-mono font-medium text-neutral-700">
                            {user.phone || "Chưa cập nhật"}
                          </td>

                          {/* Member Tier Badge */}
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] rounded-full ${tier.badgeClass}`}>
                              <span>{tier.icon}</span>
                              <span>{tier.name}</span>
                            </span>
                          </td>

                          {/* Total Spent */}
                          <td className="py-4 px-4 text-right">
                            <div className="font-serif font-bold text-base text-black">
                              {formatCurrency(user.totalSpent)}
                            </div>
                          </td>

                          {/* Is Active */}
                          <td className="py-4 px-4 text-center">
                            {user.isActive ? (
                              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase border border-emerald-200 rounded-full">
                                Hoạt động
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-rose-50 text-rose-800 text-[10px] font-bold uppercase border border-rose-200 rounded-full">
                                Đã khóa
                              </span>
                            )}
                          </td>

                          {/* Created date */}
                          <td className="py-4 px-4 text-right text-neutral-500 font-mono text-[11px]">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-neutral-200 flex justify-between items-center bg-[#fbf9f9]">
                <span className="text-xs text-neutral-500">
                  Trang <strong className="text-black">{activePage + 1}</strong> / {totalPages}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={activePage === 0}
                    onClick={() => setActivePage((prev) => Math.max(0, prev - 1))}
                    className="p-2 border border-neutral-300 hover:border-black disabled:opacity-30 cursor-pointer"
                  >
                    <FiChevronLeft size={16} />
                  </button>
                  <button
                    disabled={activePage >= totalPages - 1}
                    onClick={() => setActivePage((prev) => prev + 1)}
                    className="p-2 border border-neutral-300 hover:border-black disabled:opacity-30 cursor-pointer"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Broadcast Message Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-300 max-w-lg w-full p-6 md:p-8 shadow-2xl animate-fade-in relative text-left">
            <button
              onClick={() => setIsBroadcastModalOpen(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-black cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                LUMIÈRE BROADCAST CONCIERGE
              </span>
              <h3 className="font-serif text-xl font-bold uppercase text-black">
                Gửi Tin Nhắn Hàng Loạt
              </h3>
              <p className="text-xs text-neutral-500 font-light mt-1">
                Phát thông điệp quảng bá hoặc chương trình ưu đãi VIP trực tiếp vào cuộc trò chuyện của khách hàng.
              </p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-5">
              {/* Message Content */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Nội dung tin nhắn <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  maxLength={2000}
                  value={broadcastForm.content}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
                  placeholder="Nhập nội dung thông điệp gửi tới khách hàng tại đây..."
                  className="w-full bg-[#fbf9f9] border border-neutral-300 p-3 text-xs md:text-sm text-black outline-none focus:border-black resize-none"
                />
              </div>

              {/* Min Total Spent Threshold */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Điều kiện chi tiêu tối thiểu (`minTotalSpent`)
                </label>
                <p className="text-[11px] text-neutral-400 italic mb-2">
                  Nhập `0` để gửi cho toàn bộ khách hàng, hoặc chọn mốc chi tiêu để tri ân VIP:
                </p>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { label: "Tất cả (0₫)", val: 0 },
                    { label: "&ge; 2 Trđ (Bạc)", val: 2000000 },
                    { label: "&ge; 5 Trđ (Vàng)", val: 5000000 },
                    { label: "&ge; 10 Trđ (Diamond)", val: 10000000 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setBroadcastForm({ ...broadcastForm, minTotalSpent: preset.val })}
                      className={`py-1.5 px-2 text-[10px] font-bold uppercase border transition-colors cursor-pointer ${
                        Number(broadcastForm.minTotalSpent) === preset.val
                          ? "bg-black text-white border-black"
                          : "bg-neutral-50 text-neutral-700 border-neutral-300 hover:bg-neutral-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={broadcastForm.minTotalSpent}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, minTotalSpent: e.target.value })}
                    className="w-full bg-[#fbf9f9] border border-neutral-300 px-3 py-2 text-xs font-mono font-bold text-black outline-none focus:border-black"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">VND</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-5 py-2.5 border border-neutral-300 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={broadcastMutation.isPending}
                  className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer disabled:opacity-40 shadow-xs"
                >
                  {broadcastMutation.isPending ? "Đang phát tin nhắn..." : "Xác nhận phát tin nhắn"}
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
