import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiCheck,
  FiCalendar,
  FiTag,
  FiPercent,
  FiEyeOff,
  FiEye,
  FiX,
  FiLayers,
  FiActivity,
  FiAlertCircle,
} from "react-icons/fi";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  useAdminVouchers,
  useCreateVoucher,
  useUpdateVoucher,
  useDeleteVoucher,
} from "../../hooks/api/useVouchers";

const AdminVouchers = () => {
  const [activePage, setActivePage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, ACTIVE, INACTIVE

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null); // null = create, object = edit

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    discountPercent: 10,
    maxDiscountAmount: "",
    minOrderAmount: 0,
    usageLimitPerUser: 1,
    startAt: "",
    endAt: "",
    isActive: true,
    isHidden: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [copiedCode, setCopiedCode] = useState(null);

  // Queries & Mutations
  const { data: pageData, isLoading } = useAdminVouchers({
    page: activePage - 1,
    size: 10,
    search: searchQuery.trim() || undefined,
    isActive: statusFilter === "ALL" ? undefined : statusFilter === "ACTIVE",
  });

  const createVoucherMutation = useCreateVoucher();
  const updateVoucherMutation = useUpdateVoucher();
  const deleteVoucherMutation = useDeleteVoucher();

  const vouchers = pageData?.content || [];
  const totalElements = pageData?.totalElements || 0;
  const totalPages = pageData?.totalPages || 1;

  // Formatting helpers
  const formatPrice = (val) => {
    if (val === null || val === undefined || val === "")
      return "Không giới hạn";
    return Number(val).toLocaleString("vi-VN") + "₫";
  };

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

  // Convert ISO string to format required by <input type="datetime-local" />
  const toDatetimeLocal = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  };

  // Convert datetime-local value to ISO 8601 string
  const toISOStringWithTZ = (localString) => {
    if (!localString) return null;
    const date = new Date(localString);
    return date.toISOString();
  };

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = totalElements;
    const active = vouchers.filter((v) => v.isActive).length;
    const hidden = vouchers.filter((v) => v.isHidden).length;
    const inactive = vouchers.filter((v) => !v.isActive).length;
    return { total, active, hidden, inactive };
  }, [totalElements, vouchers]);

  // Handle Copy Code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.info(`Đã sao chép mã "${code}"`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const now = new Date();
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    setEditingVoucher(null);
    setFormData({
      code: "",
      name: "",
      discountPercent: 10,
      maxDiscountAmount: "",
      minOrderAmount: 0,
      usageLimitPerUser: 1,
      startAt: toDatetimeLocal(now.toISOString()),
      endAt: toDatetimeLocal(oneMonthLater.toISOString()),
      isActive: true,
      isHidden: false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      name: voucher.name,
      discountPercent: voucher.discountPercent,
      maxDiscountAmount:
        voucher.maxDiscountAmount !== null &&
        voucher.maxDiscountAmount !== undefined
          ? String(voucher.maxDiscountAmount)
          : "",
      minOrderAmount: voucher.minOrderAmount || 0,
      usageLimitPerUser: voucher.usageLimitPerUser || 1,
      startAt: toDatetimeLocal(voucher.startAt),
      endAt: toDatetimeLocal(voucher.endAt),
      isActive: voucher.isActive ?? true,
      isHidden: voucher.isHidden ?? false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.code.trim()) {
      errors.code = "Mã voucher không được để trống";
    } else if (!/^[A-Z0-9_-]+$/i.test(formData.code.trim())) {
      errors.code =
        "Mã voucher chỉ được chứa chữ cái, số, gạch nối hoặc gạch dưới";
    }

    if (!formData.name.trim()) {
      errors.name = "Tên voucher không được để trống";
    }

    const pct = Number(formData.discountPercent);
    if (!pct || pct < 1 || pct > 100) {
      errors.discountPercent = "Phần trăm giảm giá phải từ 1 đến 100%";
    }

    if (formData.minOrderAmount < 0) {
      errors.minOrderAmount = "Giá trị đơn hàng tối thiểu không thể âm";
    }

    if (formData.usageLimitPerUser < 1) {
      errors.usageLimitPerUser = "Giới hạn dùng/user tối thiểu là 1";
    }

    if (!formData.startAt) {
      errors.startAt = "Vui lòng chọn thời điểm bắt đầu";
    }

    if (!formData.endAt) {
      errors.endAt = "Vui lòng chọn thời điểm kết thúc";
    }

    if (formData.startAt && formData.endAt) {
      const start = new Date(formData.startAt);
      const end = new Date(formData.endAt);
      if (start >= end) {
        errors.endAt = "Thời điểm kết thúc phải sau thời điểm bắt đầu";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form (Create / Update)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warn("Vui lòng kiểm tra lại thông tin nhập!");
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      discountPercent: Number(formData.discountPercent),
      maxDiscountAmount:
        formData.maxDiscountAmount !== "" && formData.maxDiscountAmount !== null
          ? Number(formData.maxDiscountAmount)
          : null,
      minOrderAmount: Number(formData.minOrderAmount) || 0,
      usageLimitPerUser: Number(formData.usageLimitPerUser) || 1,
      startAt: toISOStringWithTZ(formData.startAt),
      endAt: toISOStringWithTZ(formData.endAt),
      isActive: Boolean(formData.isActive),
      isHidden: Boolean(formData.isHidden),
    };

    if (editingVoucher) {
      // Update
      updateVoucherMutation.mutate(
        { id: editingVoucher.id, payload },
        {
          onSuccess: () => {
            toast.success(`Cập nhật voucher "${payload.code}" thành công!`);
            setIsModalOpen(false);
          },
          onError: (err) => {
            toast.error(
              err.response?.data?.message || "Cập nhật voucher thất bại!",
            );
          },
        },
      );
    } else {
      // Create
      createVoucherMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(`Tạo mới voucher "${payload.code}" thành công!`);
          setIsModalOpen(false);
        },
        onError: (err) => {
          toast.error(
            err.response?.data?.message || "Tạo mới voucher thất bại!",
          );
        },
      });
    }
  };

  // Handle Soft Delete / Deactivate
  const handleDeleteVoucher = (voucher) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn vô hiệu hóa voucher "${voucher.code}"? Voucher này sẽ không thể áp dụng cho các đơn hàng mới.`,
      )
    ) {
      deleteVoucherMutation.mutate(voucher.id, {
        onSuccess: () => {
          toast.success(`Đã vô hiệu hóa voucher "${voucher.code}" thành công!`);
        },
        onError: (err) => {
          toast.error(
            err.response?.data?.message || "Vô hiệu hóa voucher thất bại!",
          );
        },
      });
    }
  };

  // Determine Voucher Time Status
  const getValidityBadge = (startAt, endAt, isActive) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase tracking-wider border border-neutral-300">
          Đã vô hiệu hóa
        </span>
      );
    }

    const now = new Date();
    const start = new Date(startAt);
    const end = new Date(endAt);

    if (now < start) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
          Sắp diễn ra
        </span>
      );
    } else if (now > end) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wider border border-rose-200">
          Đã hết hạn
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
          Đang áp dụng
        </span>
      );
    }
  };

  return (
    <div className="flex bg-[#fcfbf9] min-h-screen text-black font-dmsans">
      {/* Sidebar */}
      <AdminSidebar activeTab="vouchers" />

      {/* Main Content Area */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        <AdminHeader title="Quản lý Voucher & Khuyến mãi" />

        <main className="p-8 space-y-8 flex-grow">
          {/* Top Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-black uppercase">
                Danh sách Voucher
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Tạo mã giảm giá, thiết lập tỷ lệ chiết khấu, hạn mức và kiểm
                soát chiến dịch ưu đãi.
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="bg-black text-white hover:bg-neutral-800 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiPlus size={16} />
              <span>Tạo Voucher mới</span>
            </button>
          </div>

          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-neutral-200 p-5 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Tổng số Voucher
                </p>
                <p className="text-2xl font-serif font-bold text-black mt-1">
                  {totalElements}
                </p>
              </div>
              <div className="w-11 h-11 bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                <FiTag size={20} />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-5 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Đang hoạt động
                </p>
                <p className="text-2xl font-serif font-bold text-emerald-600 mt-1">
                  {vouchers.filter((v) => v.isActive).length}
                </p>
              </div>
              <div className="w-11 h-11 bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <FiActivity size={20} />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-5 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Mã Voucher ẩn
                </p>
                <p className="text-2xl font-serif font-bold text-amber-600 mt-1">
                  {vouchers.filter((v) => v.isHidden).length}
                </p>
              </div>
              <div className="w-11 h-11 bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <FiEyeOff size={20} />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-5 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Đã vô hiệu hóa
                </p>
                <p className="text-2xl font-serif font-bold text-neutral-400 mt-1">
                  {vouchers.filter((v) => !v.isActive).length}
                </p>
              </div>
              <div className="w-11 h-11 bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500">
                <FiLayers size={20} />
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white border border-neutral-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã hoặc tên..."
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

            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                Trạng thái:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setActivePage(1);
                }}
                className="bg-[#fbf9f9] border border-neutral-300 px-3 py-2 text-xs font-semibold text-black outline-none focus:border-black transition-colors cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Đã vô hiệu hóa</option>
              </select>
            </div>
          </div>

          {/* Vouchers Data Table */}
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
                  Đang tải danh sách voucher...
                </p>
              </div>
            ) : vouchers.length === 0 ? (
              <div className="py-20 text-center select-none">
                <FiTag
                  size={48}
                  className="text-neutral-300 mx-auto mb-3 stroke-[1.2]"
                />
                <h3 className="font-serif text-lg font-bold text-black mb-1">
                  Chưa có voucher nào phù hợp
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
                  {searchQuery
                    ? "Không tìm thấy kết quả phù hợp với từ khóa tìm kiếm."
                    : "Bắt đầu tạo mã voucher đầu tiên để triển khai các chương trình khuyến mãi."}
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  Tạo voucher mới
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f5f4f2] text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-200">
                      <th className="py-3.5 px-4">Mã Code</th>
                      <th className="py-3.5 px-4">Mô tả</th>
                      <th className="py-3.5 px-4 text-center">Giảm giá</th>
                      <th className="py-3.5 px-4 text-right">Đơn tối thiểu</th>
                      <th className="py-3.5 px-4 text-center">Lượt/User</th>
                      <th className="py-3.5 px-4">Thời gian hiệu lực</th>
                      <th className="py-3.5 px-4 text-center">Hiển thị</th>
                      <th className="py-3.5 px-4 text-center">Trạng thái</th>
                      <th className="py-3.5 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {vouchers.map((voucher) => (
                      <tr
                        key={voucher.id}
                        className="hover:bg-neutral-50/60 transition-colors"
                      >
                        {/* Code Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-black text-white px-2.5 py-1 tracking-wider shadow-xs">
                              {voucher.code}
                            </span>
                            <button
                              onClick={() => handleCopyCode(voucher.code)}
                              className="text-neutral-400 hover:text-black transition-colors cursor-pointer p-1"
                              title="Sao chép mã"
                            >
                              {copiedCode === voucher.code ? (
                                <FiCheck
                                  size={14}
                                  className="text-emerald-600"
                                />
                              ) : (
                                <FiCopy size={14} />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Name Column */}
                        <td className="py-3.5 px-4 font-semibold text-black max-w-[200px] truncate">
                          {voucher.name}
                        </td>

                        {/* Discount Percent & Max */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-black text-sm">
                            {voucher.discountPercent}%
                          </span>
                          <span className="block text-[10px] text-neutral-500 mt-0.5">
                            Trần: {formatPrice(voucher.maxDiscountAmount)}
                          </span>
                        </td>

                        {/* Min Order Amount */}
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-black">
                          {formatPrice(voucher.minOrderAmount)}
                        </td>

                        {/* Usage Limit Per User */}
                        <td className="py-3.5 px-4 text-center font-bold text-black">
                          {voucher.usageLimitPerUser} lần
                        </td>

                        {/* Validity Dates */}
                        <td className="py-3.5 px-4 space-y-1">
                          <div className="text-[11px] text-neutral-700">
                            {formatDateDisplay(voucher.startAt)}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono">
                            đến {formatDateDisplay(voucher.endAt)}
                          </div>
                          <div>
                            {getValidityBadge(
                              voucher.startAt,
                              voucher.endAt,
                              voucher.isActive,
                            )}
                          </div>
                        </td>

                        {/* Visibility */}
                        <td className="py-3.5 px-4 text-center">
                          {voucher.isHidden ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-500 uppercase">
                              <FiEyeOff size={12} /> Ẩn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-black uppercase">
                              <FiEye size={12} /> Công khai
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          {voucher.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                              Bật
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-500 text-[10px] font-bold uppercase tracking-wider border border-neutral-300">
                              Tắt
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditModal(voucher)}
                            className="p-1.5 border border-neutral-300 hover:border-black text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Chỉnh sửa voucher"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          {voucher.isActive && (
                            <button
                              onClick={() => handleDeleteVoucher(voucher)}
                              className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors cursor-pointer"
                              title="Vô hiệu hóa voucher"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-neutral-200 flex items-center justify-between select-none">
                <span className="text-xs text-neutral-500">
                  Hiển thị trang {activePage} trên {totalPages} ({totalElements}{" "}
                  voucher)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={activePage === 1}
                    onClick={() =>
                      setActivePage((prev) => Math.max(prev - 1, 1))
                    }
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
                    onClick={() =>
                      setActivePage((prev) => Math.min(prev + 1, totalPages))
                    }
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
      {/* MODAL: CREATE / EDIT VOUCHER */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white max-w-2xl w-full p-6 md:p-8 relative shadow-2xl overflow-y-auto max-h-[92vh] flex flex-col border border-neutral-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold uppercase text-black">
                  {editingVoucher
                    ? `Chỉnh sửa Voucher #${editingVoucher.code}`
                    : "Tạo mới Voucher khuyến mãi"}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Thiết lập mã giảm giá áp dụng trực tiếp cho đơn hàng.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-black p-2 transition-colors cursor-pointer rounded-full hover:bg-neutral-100"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Row 1: Code & Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-bold uppercase tracking-wider mb-1.5">
                    Mã Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: LUMIERE10, VIP20"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className={`w-full bg-[#fbf9f9] border px-3.5 py-2.5 font-mono font-bold text-black outline-none transition-colors ${
                      formErrors.code
                        ? "border-red-500"
                        : "border-neutral-300 focus:border-black"
                    }`}
                  />
                  {formErrors.code && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {formErrors.code}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-black font-bold uppercase tracking-wider mb-1.5">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Giảm 10% đơn hàng từ 200k"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full bg-[#fbf9f9] border px-3.5 py-2.5 text-black outline-none transition-colors ${
                      formErrors.name
                        ? "border-red-500"
                        : "border-neutral-300 focus:border-black"
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Discount Percent & Max Discount Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-bold uppercase tracking-wider mb-1.5">
                    Tỷ lệ giảm giá (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="10"
                      value={formData.discountPercent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountPercent: e.target.value,
                        })
                      }
                      className={`w-full bg-[#fbf9f9] border px-3.5 py-2.5 text-black outline-none transition-colors ${
                        formErrors.discountPercent
                          ? "border-red-500"
                          : "border-neutral-300 focus:border-black"
                      }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">
                      %
                    </span>
                  </div>
                  {formErrors.discountPercent && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {formErrors.discountPercent}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-black font-bold uppercase tracking-wider mb-1.5">
                    Số tiền giảm tối đa (Trần giảm)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="Để trống = Không giới hạn"
                      value={formData.maxDiscountAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxDiscountAmount: e.target.value,
                        })
                      }
                      className="w-full bg-[#fbf9f9] border border-neutral-300 focus:border-black px-3.5 py-2.5 text-black outline-none transition-colors"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">
                      ₫
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Nếu để trống, số tiền giảm sẽ bằng đúng % của tổng tiền
                    hàng.
                  </p>
                </div>
              </div>

              {/* Row 3: Min Order Amount & Usage Limit Per User */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-bold uppercase tracking-wider mb-1.5">
                    Đơn hàng tối thiểu (₫){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderAmount: e.target.value,
                      })
                    }
                    className="w-full bg-[#fbf9f9] border border-neutral-300 focus:border-black px-3.5 py-2.5 text-black outline-none transition-colors"
                  />
                  {formErrors.minOrderAmount && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {formErrors.minOrderAmount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-black font-bold uppercase tracking-wider mb-1.5">
                    Giới hạn lượt dùng / User{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.usageLimitPerUser}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usageLimitPerUser: e.target.value,
                      })
                    }
                    className="w-full bg-[#fbf9f9] border border-neutral-300 focus:border-black px-3.5 py-2.5 text-black outline-none transition-colors"
                  />
                  {formErrors.usageLimitPerUser && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {formErrors.usageLimitPerUser}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 4: Start Date & End Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-bold uppercase tracking-wider mb-1.5">
                    Thời điểm bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startAt}
                    onChange={(e) =>
                      setFormData({ ...formData, startAt: e.target.value })
                    }
                    className={`w-full bg-[#fbf9f9] border px-3.5 py-2.5 text-black outline-none transition-colors ${
                      formErrors.startAt
                        ? "border-red-500"
                        : "border-neutral-300 focus:border-black"
                    }`}
                  />
                  {formErrors.startAt && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {formErrors.startAt}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-black font-bold uppercase tracking-wider mb-1.5">
                    Thời điểm kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endAt}
                    onChange={(e) =>
                      setFormData({ ...formData, endAt: e.target.value })
                    }
                    className={`w-full bg-[#fbf9f9] border px-3.5 py-2.5 text-black outline-none transition-colors ${
                      formErrors.endAt
                        ? "border-red-500"
                        : "border-neutral-300 focus:border-black"
                    }`}
                  />
                  {formErrors.endAt && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {formErrors.endAt}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 5: Flags (isActive & isHidden) */}
              <div className="bg-[#f5f4f2] p-4 border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-black block">
                      Kích hoạt vận hành
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Cho phép khách hàng áp dụng voucher này khi đặt hàng.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isHidden}
                    onChange={(e) =>
                      setFormData({ ...formData, isHidden: e.target.checked })
                    }
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-black block">
                      Ẩn voucher công khai
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Không hiển thị trong danh sách chung, chỉ áp khi nhập đúng
                      mã.
                    </span>
                  </div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-neutral-200 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-neutral-300 text-neutral-700 font-bold uppercase text-[11px] hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={
                    createVoucherMutation.isPending ||
                    updateVoucherMutation.isPending
                  }
                  className="px-8 py-2.5 bg-black text-white font-bold uppercase text-[11px] tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {createVoucherMutation.isPending ||
                  updateVoucherMutation.isPending
                    ? "Đang lưu..."
                    : editingVoucher
                      ? "Cập nhật Voucher"
                      : "Tạo mới Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVouchers;
