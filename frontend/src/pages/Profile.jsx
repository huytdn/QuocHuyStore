import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiPhone,
  FiEdit2,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiX,
  FiClock,
  FiAlertTriangle,
  FiShield,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/useAuthStore";
import { useUpdateProfile, useProfile, useSoftDeleteAccount } from "../hooks/api/useAuth";
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from "../hooks/api/useAddress";
import { useUserOrders } from "../hooks/api/useOrders";
import Footer from "../components/Footer";

const Profile = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const softDeleteMutation = useSoftDeleteAccount();
  const isUpdating = updateProfileMutation.isPending;
  const isDeleting = softDeleteMutation.isPending;

  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  // Real Recent Orders API (Limit to 3 recent orders)
  const { data: recentOrdersPage, isLoading: isOrdersLoading } = useUserOrders({
    page: 0,
    size: 3,
  });
  const recentOrders = (recentOrdersPage?.content || []).slice(0, 3);

  // Profile User Info
  const [userInfo, setUserInfo] = useState({
    name: user?.displayName || "Người dùng LUMIÈRE",
    email: user?.username || "khachhang@lumiere.com",
    phone: user?.phone || "Chưa cập nhật SĐT",
  });

  useEffect(() => {
    const activeUser = profile || user;
    if (activeUser) {
      setUserInfo({
        name: activeUser.displayName || "Người dùng LUMIÈRE",
        email: activeUser.username || "khachhang@lumiere.com",
        phone: activeUser.phone || "Chưa cập nhật SĐT",
      });
    }
  }, [profile, user]);

  // Address React Query integration
  const { data: addressPage, isLoading: isAddressesLoading } = useAddresses({ page: 0, size: 50 });
  const addresses = addressPage?.content || [];

  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();

  // Edit Profile Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userInfo.name,
    phone: userInfo.phone,
  });

  // Sync editForm state when modal opens
  useEffect(() => {
    if (isEditModalOpen) {
      setEditForm({
        name: userInfo.name,
        phone: userInfo.phone,
      });
    }
  }, [isEditModalOpen, userInfo]);

  // Add Address States
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    receiverName: "",
    receiverPhone: "",
    addressDetail: "",
    isDefault: false,
  });

  // Edit Address States
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [editAddressForm, setEditAddressForm] = useState({
    id: null,
    receiverName: "",
    receiverPhone: "",
    addressDetail: "",
    isDefault: false,
  });

  const handleOpenAddAddress = () => {
    const activeUser = profile || user;
    setAddressForm({
      receiverName: activeUser?.displayName || "",
      receiverPhone: activeUser?.phone || "",
      addressDetail: "",
      isDefault: false,
    });
    setIsAddAddressOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditAddressForm({
      id: addr.id,
      receiverName: addr.receiverName,
      receiverPhone: addr.receiverPhone,
      addressDetail: addr.addressDetail,
      isDefault: addr.isDefault,
    });
    setIsEditAddressOpen(true);
  };

  const handleEditProfileSubmit = (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      toast.warn("Vui lòng điền đầy đủ họ tên và số điện thoại.");
      return;
    }

    updateProfileMutation.mutate(
      {
        displayName: editForm.name.trim(),
        phone: editForm.phone.trim(),
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          toast.success("Cập nhật hồ sơ thành công!");
        },
        onError: (err) => {
          const errMsg = err.response?.data?.message || "Cập nhật hồ sơ thất bại, vui lòng thử lại!";
          toast.error(errMsg);
        },
      }
    );
  };

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (
      !addressForm.receiverName.trim() ||
      !addressForm.receiverPhone.trim() ||
      !addressForm.addressDetail.trim()
    ) {
      toast.warn("Vui lòng nhập đầy đủ thông tin địa chỉ.");
      return;
    }
    createAddressMutation.mutate(
      {
        receiverName: addressForm.receiverName.trim(),
        receiverPhone: addressForm.receiverPhone.trim(),
        addressDetail: addressForm.addressDetail.trim(),
        isDefault: addressForm.isDefault,
      },
      {
        onSuccess: () => {
          setIsAddAddressOpen(false);
          toast.success("Thêm địa chỉ giao hàng thành công!");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Thêm địa chỉ thất bại!");
        },
      }
    );
  };

  const handleEditAddressSubmit = (e) => {
    e.preventDefault();
    if (
      !editAddressForm.receiverName.trim() ||
      !editAddressForm.receiverPhone.trim() ||
      !editAddressForm.addressDetail.trim()
    ) {
      toast.warn("Vui lòng nhập đầy đủ thông tin địa chỉ.");
      return;
    }
    updateAddressMutation.mutate(
      {
        addressId: editAddressForm.id,
        payload: {
          receiverName: editAddressForm.receiverName.trim(),
          receiverPhone: editAddressForm.receiverPhone.trim(),
          addressDetail: editAddressForm.addressDetail.trim(),
          isDefault: editAddressForm.isDefault,
        },
      },
      {
        onSuccess: () => {
          setIsEditAddressOpen(false);
          toast.success("Cập nhật địa chỉ thành công!");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Cập nhật địa chỉ thất bại!");
        },
      }
    );
  };

  const handleSetDefaultAddress = (addr) => {
    updateAddressMutation.mutate(
      {
        addressId: addr.id,
        payload: {
          receiverName: addr.receiverName,
          receiverPhone: addr.receiverPhone,
          addressDetail: addr.addressDetail,
          isDefault: true,
        },
      },
      {
        onSuccess: () => {
          toast.success("Đã đặt làm địa chỉ mặc định!");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Đặt địa chỉ mặc định thất bại!");
        },
      }
    );
  };

  const handleRemoveAddress = (addressId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      deleteAddressMutation.mutate(addressId, {
        onSuccess: () => {
          toast.success("Xóa địa chỉ thành công!");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Xóa địa chỉ thất bại!");
        },
      });
    }
  };

  const handleConfirmSoftDeleteAccount = () => {
    softDeleteMutation.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteAccountOpen(false);
        toast.success("Tài khoản của bạn đã được vô hiệu hóa thành công.");
        navigate("/login");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Vô hiệu hóa tài khoản thất bại!");
      },
    });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "DELIVERED":
        return { label: "Đã giao", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "IN_TRANSIT":
        return { label: "Đang giao", style: "bg-blue-50 text-blue-700 border-blue-200" };
      case "AWAITING_PICKUP":
        return { label: "Chờ lấy hàng", style: "bg-amber-50 text-amber-800 border-amber-200" };
      case "PENDING_APPROVAL":
        return { label: "Chờ duyệt", style: "bg-yellow-50 text-yellow-800 border-yellow-200" };
      case "PENDING_PAYMENT":
        return { label: "Chờ thanh toán", style: "bg-purple-50 text-purple-700 border-purple-200" };
      case "DELIVERY_FAILED":
        return { label: "Giao thất bại", style: "bg-rose-50 text-rose-700 border-rose-200" };
      case "CANCELED":
      default:
        return { label: "Đã hủy", style: "bg-neutral-100 text-neutral-500 border-neutral-300" };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (val) => {
    return Number(val || 0).toLocaleString("vi-VN") + "₫";
  };

  return (
    <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
      <main className="pt-32 pb-24 max-w-[1440px] mx-auto w-full px-6 md:px-16 flex-grow text-left">
        {/* User Profile Header section */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
              {/* Luxury Initial Avatar */}
              <div className="relative select-none">
                <div className="w-36 h-36 md:w-40 md:h-40 bg-black text-white border border-neutral-300 flex items-center justify-center font-serif text-5xl md:text-6xl font-bold shadow-xs">
                  {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
                </div>
              </div>

              {/* User basic meta info */}
              <div className="text-center md:text-left">
                <h1 className="font-serif text-[36px] md:text-[48px] font-semibold text-black leading-tight mb-3">
                  {userInfo.name}
                </h1>

                <div className="flex flex-col gap-1.5 text-neutral-500 text-sm md:text-base font-light">
                  <p className="flex items-center justify-center md:justify-start gap-2.5">
                    <FiMail size={16} className="text-neutral-400" />
                    <span>{userInfo.email}</span>
                  </p>
                  <p className="flex items-center justify-center md:justify-start gap-2.5">
                    <FiPhone size={16} className="text-neutral-400" />
                    <span>{userInfo.phone}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Profile editing triggers */}
            <div className="w-full md:w-auto select-none">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full md:w-auto bg-black text-white px-12 py-4.5 label-sm tracking-widest font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>
        </section>

        {/* Layout Grid Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Main Account Details (Left Side, 8 Columns) - ADDRESS BOOK */}
          <div className="lg:col-span-8 w-full">
            <div>
              <div className="flex items-center justify-between mb-8 select-none">
                <div>
                  <h2 className="font-serif text-[26px] md:text-[32px] font-semibold text-black">
                    Sổ địa chỉ giao hàng
                  </h2>
                  <p className="text-xs text-neutral-500 font-light mt-1">
                    Quản lý danh sách địa chỉ nhận hàng của bạn ({addresses.length})
                  </p>
                </div>
                <button
                  onClick={handleOpenAddAddress}
                  className="flex items-center gap-2 label-sm text-[10px] tracking-widest uppercase font-semibold border-b border-black pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors cursor-pointer"
                >
                  <FiPlus size={12} />
                  Thêm địa chỉ mới
                </button>
              </div>

                {isAddressesLoading ? (
                  <div className="text-center py-16 select-none">
                    <svg className="animate-spin h-8 w-8 text-black mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-neutral-500 font-light text-sm">Đang tải sổ địa chỉ...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="border border-neutral-200 border-dashed p-16 text-center select-none">
                    <FiMapPin
                      size={36}
                      className="text-neutral-300 mx-auto mb-4 stroke-[1.2]"
                    />
                    <p className="text-neutral-500 font-light text-sm">
                      Chưa có địa chỉ giao hàng nào được lưu.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`border p-6 flex justify-between items-start transition-all ${
                          addr.isDefault
                            ? "border-black bg-neutral-50/50"
                            : "border-neutral-200"
                        }`}
                      >
                        <div className="space-y-2.5 text-left">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-base text-black">
                              {addr.receiverName}
                            </span>
                            {addr.isDefault && (
                              <span className="bg-black text-white text-[9px] px-2 py-0.5 tracking-wider font-semibold uppercase">
                                Mặc định
                              </span>
                            )}
                          </div>

                          <p className="text-neutral-500 text-sm">
                            {addr.receiverPhone}
                          </p>
                          <p className="text-neutral-800 text-sm leading-relaxed font-light">
                            {addr.addressDetail}
                          </p>

                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr)}
                              className="mt-4 text-[10px] font-bold uppercase text-neutral-500 hover:text-black tracking-wider transition-colors cursor-pointer select-none"
                            >
                              Đặt làm mặc định
                            </button>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEditAddress(addr)}
                            className="text-neutral-400 hover:text-black p-1.5 transition-colors cursor-pointer select-none"
                            aria-label="Edit Address"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveAddress(addr.id)}
                            className="text-neutral-400 hover:text-red-600 p-1.5 transition-colors cursor-pointer select-none"
                            aria-label="Remove Address"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Account Security & Danger Zone Section */}
              <div className="mt-14 pt-10 border-t border-neutral-200">
                <div className="flex items-center gap-2 mb-2 select-none">
                  <FiShield size={18} className="text-black" />
                  <h3 className="font-serif text-xl font-semibold text-black uppercase tracking-wider">
                    Bảo mật & Thiết lập tài khoản
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 font-light mb-6">
                  Quản lý các tùy chọn bảo mật và trạng thái tài khoản của bạn trên hệ thống.
                </p>

                <div className="border border-red-200 bg-red-50/40 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FiAlertTriangle size={16} className="text-red-600" />
                      <h4 className="font-semibold text-sm text-red-900">
                        Vô hiệu hóa tài khoản
                      </h4>
                    </div>
                    <p className="text-xs text-neutral-600 font-light leading-relaxed">
                      Tạm ngưng hoạt động tài khoản và đăng xuất khỏi tất cả thiết bị. Dữ liệu của bạn sẽ được bảo lưu an toàn.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDeleteAccountOpen(true)}
                    className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap select-none"
                  >
                    Vô hiệu hóa
                  </button>
                </div>
              </div>
          </div>

          {/* Activity Panel (Right Side, 4 Columns) - REAL DATA */}
          <div className="lg:col-span-4 w-full">
            <h2 className="font-serif text-[26px] md:text-[32px] font-semibold text-black mb-8 select-none">
              Hoạt động gần đây
            </h2>

            {isOrdersLoading ? (
              <div className="border border-neutral-200 border-dashed p-10 text-center select-none bg-white">
                <svg className="animate-spin h-6 w-6 text-black mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xs text-neutral-500 font-medium">Đang tải hoạt động...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="border border-neutral-200 border-dashed p-10 text-center select-none bg-white">
                <FiClock size={32} className="text-neutral-300 mx-auto mb-3 stroke-[1.2]" />
                <p className="text-xs text-neutral-500 font-light mb-4">
                  Chưa có hoạt động mua hàng gần đây.
                </p>
                <Link
                  to="/product"
                  className="bg-black text-white px-6 py-2.5 label-sm text-[10px] tracking-widest font-semibold hover:bg-neutral-800 transition-colors uppercase inline-block"
                >
                  Mua sắm ngay
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {recentOrders.map((order) => {
                  const badgeInfo = getStatusBadgeStyle(order.status);
                  return (
                    <div
                      key={order.orderId}
                      onClick={() => navigate("/orders")}
                      className="border border-neutral-200 p-6 flex flex-col gap-4 text-left bg-white hover:border-neutral-400 hover:shadow-sm transition-all shadow-xs cursor-pointer group"
                    >
                      <div className="flex justify-between items-start select-none">
                        <div>
                          <p className="label-sm text-[10px] text-neutral-400 font-bold uppercase mb-1 group-hover:text-black transition-colors">
                            MÃ ĐƠN #LM-{order.orderId}
                          </p>
                          <p className="text-xs font-semibold text-black">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border ${badgeInfo.style}`}>
                          {badgeInfo.label}
                        </span>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-1 text-xs">
                        {order.items && order.items.length > 0 ? (
                          order.items.slice(0, 2).map((item, idx) => (
                            <p key={idx} className="text-neutral-700 truncate">
                              <span className="font-semibold text-black">{item.productName}</span>
                              <span className="text-neutral-400 ml-1.5">x{item.quantity}</span>
                            </p>
                          ))
                        ) : (
                          <p className="text-neutral-400 italic">Đơn hàng không có chi tiết</p>
                        )}
                        {order.items && order.items.length > 2 && (
                          <p className="text-[10px] text-neutral-400 font-semibold uppercase">
                            + {order.items.length - 2} sản phẩm khác
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-neutral-100 select-none">
                        <span className="text-[11px] font-medium text-neutral-500 uppercase">
                          Tổng cộng:
                        </span>
                        <p className="text-sm font-bold text-black">{formatPrice(order.totalPrice)}</p>
                      </div>
                    </div>
                  );
                })}

                {/* View All Orders CTA */}
                <button
                  onClick={() => navigate("/orders")}
                  className="w-full border border-black py-4.5 label-sm tracking-widest font-semibold hover:bg-black hover:text-white transition-colors cursor-pointer select-none text-center uppercase"
                >
                  XEM TẤT CẢ ĐƠN HÀNG
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer variant="detailed" />

      {/* Edit Profile Modal Dialog */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-[2px]">
          <div className="bg-white text-black w-full max-w-[450px] shadow-2xl relative flex flex-col p-6 text-left">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-neutral-200">
              <h3 className="font-serif text-xl font-semibold text-black uppercase tracking-wide">
                Chỉnh sửa hồ sơ
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-400 hover:text-black transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>
            </div>

            <form
              onSubmit={handleEditProfileSubmit}
              className="space-y-5 text-sm"
            >
              <div className="flex flex-col gap-1.5">
                <label className="label-sm text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  disabled={isUpdating}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border-neutral-300 focus:border-black focus:ring-0 text-black px-3 py-2 text-sm disabled:bg-neutral-100 disabled:text-neutral-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="label-sm text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  disabled={isUpdating}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full border-neutral-300 focus:border-black focus:ring-0 text-black px-3 py-2 text-sm disabled:bg-neutral-100 disabled:text-neutral-400"
                />
              </div>

              <div className="pt-4 flex gap-4 select-none">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-black text-white py-3 label-sm font-semibold tracking-wider hover:bg-neutral-800 transition-colors uppercase text-center cursor-pointer disabled:bg-neutral-400"
                >
                  {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 border border-neutral-300 py-3 label-sm font-semibold tracking-wider hover:bg-neutral-100 transition-colors uppercase text-center cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal Dialog */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-[2px]">
          <div className="bg-white text-black w-full max-w-[450px] shadow-2xl relative flex flex-col p-6 text-left">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-neutral-200">
              <h3 className="font-serif text-xl font-semibold text-black uppercase tracking-wide">
                Thêm địa chỉ giao hàng
              </h3>
              <button
                onClick={() => setIsAddAddressOpen(false)}
                className="text-neutral-400 hover:text-black transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>
            </div>

            <form
              onSubmit={handleAddAddressSubmit}
              className="space-y-4 text-sm"
            >
              <div className="flex flex-col gap-1.5">
                <label className="label-sm text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Tên người nhận
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={addressForm.receiverName}
                  onChange={(e) => setAddressForm({ ...addressForm, receiverName: e.target.value })}
                  placeholder="Nhập tên người nhận..."
                  className="w-full border border-neutral-300 focus:border-black focus:ring-0 text-black px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="label-sm text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Số điện thoại nhận hàng
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  value={addressForm.receiverPhone}
                  onChange={(e) => setAddressForm({ ...addressForm, receiverPhone: e.target.value })}
                  placeholder="Nhập số điện thoại nhận hàng..."
                  className="w-full border border-neutral-300 focus:border-black focus:ring-0 text-black px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="label-sm text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Địa chỉ chi tiết
                </label>
                <textarea
                  rows={3}
                  value={addressForm.addressDetail}
                  onChange={(e) => setAddressForm({ ...addressForm, addressDetail: e.target.value })}
                  placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  className="w-full border border-neutral-300 focus:border-black focus:ring-0 text-black px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefaultAdd"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="border-neutral-300 text-black focus:ring-black h-4 w-4"
                />
                <label htmlFor="isDefaultAdd" className="text-xs text-neutral-600 font-medium select-none cursor-pointer">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <div className="pt-4 flex gap-4 select-none">
                <button
                  type="submit"
                  disabled={createAddressMutation.isPending}
                  className="flex-1 bg-black text-white py-3 label-sm font-semibold tracking-wider hover:bg-neutral-800 transition-colors uppercase text-center cursor-pointer disabled:opacity-50"
                >
                  {createAddressMutation.isPending ? "ĐANG THÊM..." : "Thêm địa chỉ"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="flex-1 border border-neutral-300 py-3 label-sm font-semibold tracking-wider hover:bg-neutral-100 transition-colors uppercase text-center cursor-pointer"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Address Modal Dialog */}
      {isEditAddressOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-[2px]">
          <div className="bg-white text-black w-full max-w-[450px] shadow-2xl relative flex flex-col p-6 text-left">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-neutral-200">
              <h3 className="font-serif text-xl font-semibold text-black uppercase tracking-wide">
                Chỉnh sửa địa chỉ
              </h3>
              <button
                onClick={() => setIsEditAddressOpen(false)}
                className="text-neutral-400 hover:text-black transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>
            </div>

            <form
              onSubmit={handleEditAddressSubmit}
              className="space-y-4 text-sm"
            >
              <div className="flex flex-col gap-1.5">
                <label className="label-sm text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Tên người nhận
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={editAddressForm.receiverName}
                  onChange={(e) => setEditAddressForm({ ...editAddressForm, receiverName: e.target.value })}
                  placeholder="Nhập tên người nhận..."
                  className="w-full border border-neutral-300 focus:border-black focus:ring-0 text-black px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="label-sm text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Số điện thoại nhận hàng
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  value={editAddressForm.receiverPhone}
                  onChange={(e) => setEditAddressForm({ ...editAddressForm, receiverPhone: e.target.value })}
                  placeholder="Nhập số điện thoại nhận hàng..."
                  className="w-full border border-neutral-300 focus:border-black focus:ring-0 text-black px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="label-sm text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Địa chỉ chi tiết
                </label>
                <textarea
                  rows={3}
                  value={editAddressForm.addressDetail}
                  onChange={(e) => setEditAddressForm({ ...editAddressForm, addressDetail: e.target.value })}
                  placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  className="w-full border border-neutral-300 focus:border-black focus:ring-0 text-black px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefaultEdit"
                  checked={editAddressForm.isDefault}
                  onChange={(e) => setEditAddressForm({ ...editAddressForm, isDefault: e.target.checked })}
                  disabled={editAddressForm.isDefault}
                  className="border-neutral-300 text-black focus:ring-black h-4 w-4 disabled:opacity-50"
                />
                <label htmlFor="isDefaultEdit" className="text-xs text-neutral-600 font-medium select-none cursor-pointer disabled:opacity-50">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <div className="pt-4 flex gap-4 select-none">
                <button
                  type="submit"
                  disabled={updateAddressMutation.isPending}
                  className="flex-1 bg-black text-white py-3 label-sm font-semibold tracking-wider hover:bg-neutral-800 transition-colors uppercase text-center cursor-pointer disabled:opacity-50"
                >
                  {updateAddressMutation.isPending ? "ĐANG LƯU..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditAddressOpen(false)}
                  className="flex-1 border border-neutral-300 py-3 label-sm font-semibold tracking-wider hover:bg-neutral-100 transition-colors uppercase text-center cursor-pointer"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Deactivation Confirmation Modal */}
      {isDeleteAccountOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-[2px]">
          <div className="bg-white text-black w-full max-w-[450px] shadow-2xl relative flex flex-col p-6 text-left border border-neutral-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2 text-red-600">
                <FiAlertTriangle size={20} />
                <h3 className="font-serif text-lg font-semibold text-black uppercase tracking-wide">
                  Xác nhận vô hiệu hóa
                </h3>
              </div>
              <button
                onClick={() => setIsDeleteAccountOpen(false)}
                className="text-neutral-400 hover:text-black transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>
            </div>

            <p className="text-sm text-neutral-600 font-light leading-relaxed mb-6">
              Bạn có chắc chắn muốn vô hiệu hóa tài khoản của mình? Bạn sẽ bị đăng xuất ngay lập tức và tài khoản sẽ được tạm ngưng trên hệ thống.
            </p>

            <div className="flex gap-3 select-none">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmSoftDeleteAccount}
                className="flex-1 bg-red-600 text-white py-3 text-xs font-semibold uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Đang xử lý..." : "Xác nhận vô hiệu hóa"}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteAccountOpen(false)}
                className="flex-1 border border-neutral-300 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
