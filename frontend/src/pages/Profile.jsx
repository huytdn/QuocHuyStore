import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiPhone,
  FiEdit2,
  FiHeart,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { useAuthStore } from "../store/useAuthStore";
import { useUpdateProfile } from "../hooks/api/useAuth";
import Footer from "../components/Footer";

const INITIAL_LIKED_PRODUCTS = [
  {
    id: "blazer",
    name: "Structured Silk Blazer",
    price: "4.200.000₫",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAraeNd1IbrgBk_MDLrOtbWVE-rDZgAEkbJxwmPZwwbiZgMlSs-rtwQEQtnqWe0QGTWTbIEvYDG_Yb6ItS96uChasxGw0WalmlYY3W1ywjAe5by4nX_53qK52maDLAIp0w69WX4i-mN4osDlhao4jdoGmuPc4wbhCaCAwLe2n5EKP_brBN9CiGlp8s3uf3SjEXWFE634P9FzTNgVrnS5eOqQ-d4XA2pGlI1QzgzKPD2f1ygMHeh6lZxy4RzaWj4J7fGKdVguQ7HoBo",
  },
  {
    id: "pleated-trousers",
    name: "Architectural Pleated Trousers",
    price: "2.850.000₫",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDrLc3e4ABFx_nE6fNGjt7go6J6PJrvTNGcqnEudUIA6XZNz9qC_y5gDdfWqXXaZtuE32L-BDHq_qDNjToHhzQKltFBtOWWKwEKtNJQDxp_hCnDRHn_dzpMd41cv4SRGGDMdcHEtBfNBEuaT1LJeXz_jhT0YuL4S6f_TjAr6tiM1EtR9GegGuOJYdL1oVJngGw0cQm5R-tyr-bhcuQ2rODnMakNhWX7k1IYSUVUmacKKk9GicuHgYZMT3jLcl_8rBXKDC4kU1w9fzc",
  },
];

const INITIAL_ADDRESSES = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    phone: "090 123 4567",
    address:
      "Tầng 12, Bitexco Financial Tower, 2 Hải Triều, Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    isDefault: true,
  },
  {
    id: 2,
    name: "Nguyễn Văn A",
    phone: "090 123 4567",
    address: "123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    isDefault: false,
  },
];

const Profile = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateProfileMutation = useUpdateProfile();
  const isUpdating = updateProfileMutation.isPending;

  // Profile States
  const [userInfo, setUserInfo] = useState({
    name: user?.displayName || "Nguyễn Văn A",
    email: user?.username || "vana.nguyen@lumiere.archive",
    phone: user?.phone || "+84 90 123 4567",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCG4IywXw0BENTX3mmyKVAUoudTnMTN0fNp5B32fQMNfQJOxECeJ-RyiqYDk_bhLUqZ9xfaBLvNv7ygWeKAtzntWP0ecYldtXVWv1dVr9gZEJ4kx59UcUwqFRPs1VwYbjc9vuNvnkgy6OOgCVKHdl0RVXRNyug5v1Au-IhCIobt3QQB6Cg8cXf5kOUrNae0QLKTgO1yjYmKydOsdMSE22Xvw-IahY6pEohmwAsfDTHKWVjmNagIAhAGTMPNTYVvhiYMQeTofGUHS0Y",
  });

  useEffect(() => {
    if (user) {
      setUserInfo((prev) => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.username || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const [activeTab, setActiveTab] = useState("favorites"); // favorites | addresses
  const [likedProducts, setLikedProducts] = useState(INITIAL_LIKED_PRODUCTS);
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);

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

  // Add Address Modal States
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newAddress, setNewAddress] = useState("");

  const handleEditProfileSubmit = (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      alert("Vui lòng điền đầy đủ họ tên và số điện thoại.");
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
        },
        onError: (err) => {
          const errMsg = err.response?.data?.message || "Cập nhật hồ sơ thất bại, vui lòng thử lại!";
          alert(errMsg);
        },
      }
    );
  };

  const handleRemoveFavorite = (productId, e) => {
    e.stopPropagation();
    setLikedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    const item = {
      id: Date.now(),
      name: userInfo.name,
      phone: userInfo.phone,
      address: newAddress,
      isDefault: addresses.length === 0,
    };
    setAddresses((prev) => [...prev, item]);
    setNewAddress("");
    setIsAddAddressOpen(false);
  };

  const handleSetDefaultAddress = (addressId) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      })),
    );
  };

  const handleRemoveAddress = (addressId) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
  };

  return (
    <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
      <main className="pt-32 pb-24 max-w-[1440px] mx-auto w-full px-6 md:px-16 flex-grow text-left">
        {/* User Profile Header section */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
              {/* Profile Avatar (Static) */}
              <div className="relative select-none">
                <div className="w-36 h-36 md:w-40 md:h-40 overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG4IywXw0BENTX3mmyKVAUoudTnMTN0fNp5B32fQMNfQJOxECeJ-RyiqYDk_bhLUqZ9xfaBLvNv7ygWeKAtzntWP0ecYldtXVWv1dVr9gZEJ4kx59UcUwqFRPs1VwYbjc9vuNvnkgy6OOgCVKHdl0RVXRNyug5v1Au-IhCIobt3QQB6Cg8cXf5kOUrNae0QLKTgO1yjYmKydOsdMSE22Xvw-IahY6pEohmwAsfDTHKWVjmNagIAhAGTMPNTYVvhiYMQeTofGUHS0Y"
                    alt={userInfo.name}
                    className="w-full h-full object-cover grayscale transition-transform duration-700 hover:scale-105"
                  />
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

        {/* Tab navigations */}
        <div className="flex border-b border-neutral-200/80 mb-12 overflow-x-auto hide-scrollbar select-none">
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-8 py-4.5 border-b-2 font-bold label-sm text-[11px] tracking-widest whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "favorites"
                ? "border-black text-black"
                : "border-transparent text-neutral-400 hover:text-black"
            }`}
          >
            SẢN PHẨM YÊU THÍCH ({likedProducts.length})
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`px-8 py-4.5 border-b-2 font-bold label-sm text-[11px] tracking-widest whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "addresses"
                ? "border-black text-black"
                : "border-transparent text-neutral-400 hover:text-black"
            }`}
          >
            SỔ ĐỊA CHỈ ({addresses.length})
          </button>
        </div>

        {/* Layout Grid Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Main Account Details (Left Side, 8 Columns) */}
          <div className="lg:col-span-8 w-full">
            {/* Tab 1: Favorites content */}
            {activeTab === "favorites" && (
              <div>
                <div className="flex items-center justify-between mb-8 select-none">
                  <h2 className="font-serif text-[26px] md:text-[32px] font-semibold text-black">
                    Danh sách yêu thích
                  </h2>
                  {likedProducts.length > 0 && (
                    <Link
                      to="/product"
                      className="label-sm text-[10px] tracking-widest uppercase font-semibold border-b border-black hover:opacity-75 transition-opacity"
                    >
                      Xem tất cả
                    </Link>
                  )}
                </div>

                {likedProducts.length === 0 ? (
                  <div className="border border-neutral-200 border-dashed p-16 text-center select-none">
                    <FiHeart
                      size={36}
                      className="text-neutral-300 mx-auto mb-4 stroke-[1.2]"
                    />
                    <p className="text-neutral-500 font-light text-sm mb-6">
                      Bạn chưa lưu sản phẩm yêu thích nào.
                    </p>
                    <Link
                      to="/product"
                      className="bg-black text-white px-8 py-3.5 label-sm text-[10px] tracking-widest font-semibold hover:bg-neutral-800 transition-colors"
                    >
                      Mua sắm ngay
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-12">
                    {likedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => navigate(`/product/${prod.id}`)}
                        className="group cursor-pointer flex flex-col text-left"
                      >
                        <div className="aspect-[2/3] overflow-hidden bg-neutral-100 relative mb-4">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          <button
                            onClick={(e) => handleRemoveFavorite(prod.id, e)}
                            className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2.5 transition-colors cursor-pointer shadow-sm text-black"
                            aria-label="Remove from Favorites"
                          >
                            <FiHeart
                              size={14}
                              className="fill-black text-black"
                            />
                          </button>
                        </div>
                        <h3 className="body-md text-black font-normal uppercase tracking-tight group-hover:opacity-70 transition-opacity truncate pr-4">
                          {prod.name}
                        </h3>
                        <p className="label-sm text-neutral-500 font-semibold mt-1">
                          {prod.price}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Addresses content */}
            {activeTab === "addresses" && (
              <div>
                <div className="flex items-center justify-between mb-8 select-none">
                  <h2 className="font-serif text-[26px] md:text-[32px] font-semibold text-black">
                    Sổ địa chỉ giao hàng
                  </h2>
                  <button
                    onClick={() => setIsAddAddressOpen(true)}
                    className="flex items-center gap-2 label-sm text-[10px] tracking-widest uppercase font-semibold border-b border-black hover:opacity-75 transition-opacity cursor-pointer"
                  >
                    <FiPlus size={12} />
                    Thêm địa chỉ mới
                  </button>
                </div>

                {addresses.length === 0 ? (
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
                              {addr.name}
                            </span>
                            {addr.isDefault && (
                              <span className="bg-black text-white text-[9px] px-2 py-0.5 tracking-wider font-semibold uppercase">
                                Mặc định
                              </span>
                            )}
                          </div>

                          <p className="text-neutral-500 text-sm">
                            {addr.phone}
                          </p>
                          <p className="text-neutral-800 text-sm leading-relaxed font-light">
                            {addr.address}
                          </p>

                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="mt-4 text-[10px] font-bold uppercase text-neutral-500 hover:text-black tracking-wider transition-colors cursor-pointer select-none"
                            >
                              Đặt làm mặc định
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveAddress(addr.id)}
                          className="text-neutral-400 hover:text-red-600 p-1.5 transition-colors cursor-pointer select-none"
                          aria-label="Remove Address"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Panel (Right Side, 4 Columns) */}
          <div className="lg:col-span-4 w-full">
            <h2 className="font-serif text-[26px] md:text-[32px] font-semibold text-black mb-8 select-none">
              Hoạt động gần đây
            </h2>

            <div className="flex flex-col gap-6">
              {/* Activity Card 1 */}
              <div className="border border-neutral-200 p-6 flex flex-col gap-4 text-left">
                <div className="flex justify-between items-start select-none">
                  <div>
                    <p className="label-sm text-[10px] text-neutral-400 font-bold uppercase mb-1">
                      MÃ ĐƠN #LM8892
                    </p>
                    <p className="text-sm font-semibold text-black">
                      14/10/2024
                    </p>
                  </div>
                  <span className="bg-neutral-100 border border-neutral-200 text-black px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider">
                    Đã giao
                  </span>
                </div>

                {/* Thumbnails list */}
                <div className="flex -space-x-2.5 overflow-hidden select-none">
                  <div className="w-11 h-14 border border-white bg-neutral-100 flex-shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDNFa5ITeyqkrfO-a5jyZM4k_c8orAuDIFdp1sRlMRn0YtYAf3lP_hoqo6Eu-lLDnShVpKCpgYTo2poGoLpzaFYeIpL9d5h5UHycZ-KFB3UEyifSUss4M3VWjgHpaAtbITFisGCo0UWisYrtVSMCUmSDilOLBqv6D1Z9Kqbb5WCf1ZrV9osgD8ToOR7saE0G-d5gX138Dh-ogbGv1SkcS6bBe3n68KgIS0lq92IFmzDWLm_DmxJzRl9p1qPrENUfaudZNXZ2DQsGA"
                      alt="Gown thumb"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-11 h-14 border border-white bg-neutral-100 flex-shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDexoUYjzxOLXzASqYxDLMfxvFXF_J3uULvYEsmwKLx81yvdmLsFjKwd4SbqP-ip2SZ_Yqs1Ud6ixwW6zBOl1r5gZQDduHog-Ee9rlz2vIu1nnqlpVTUie4KvEcyzCIpflEHDpJnEsJI_Pp6zBrMSNcmwjtyI3BPFhUZGwVmoGH6MXWuhYglQWUgJ9nec7xKNwO1twFZ-KZR9eJ8v1vbs7PtamhoDWIY-jxjNMBMYrd2zWMlXH1N6p7M_V3PzCc-40pfFe8pLQVe34"
                      alt="Handbag thumb"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-11 h-14 border border-white bg-neutral-200 flex items-center justify-center flex-shrink-0">
                    <span className="label-sm text-[9px] text-neutral-600 font-bold">
                      +1
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-neutral-100 select-none">
                  <p className="text-sm font-bold text-black">12.450.000₫</p>
                  <button
                    onClick={() => navigate("/orders/LM8892")}
                    className="label-sm text-[10px] text-black uppercase border-b border-black font-semibold hover:opacity-75 transition-opacity cursor-pointer"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>

              {/* Activity Card 2 */}
              <div className="border border-neutral-200 p-6 flex flex-col gap-4 text-left">
                <div className="flex justify-between items-start select-none">
                  <div>
                    <p className="label-sm text-[10px] text-neutral-400 font-bold uppercase mb-1">
                      MÃ ĐƠN #LM8741
                    </p>
                    <p className="text-sm font-semibold text-black">
                      08/10/2024
                    </p>
                  </div>
                  <span className="bg-[#e9dfcb] border border-[#cfc5b3] text-[#696253] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider">
                    Đang giao
                  </span>
                </div>

                {/* Thumbnails list */}
                <div className="flex -space-x-2.5 overflow-hidden select-none">
                  <div className="w-11 h-14 border border-white bg-neutral-100 flex-shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBd6NxgcX8-OgWAmGuxyjivtjIdrBTfu6H5xN1xh33TQV6fxo4BEYQtv8cQ_Lzb9gD3oljDPDztDmzSsrbhEo5LO2lSduTHNGaewv2xDdqWmnlLQ6m0vA146l7ToZrXsDoJNnCXs53SGvRt_11rsInjxo9QMnC0-W3xaClLKluB_-Yfl3HqxfGpOSegsuLfJIlE4FlfapS9x7Y6vKcPbsUXxSIjLENwA7ZbCigyOK58FuMmVZ953S5ZUtvRMtV7N6mY5iuB2oqk5f4"
                      alt="Overcoat thumb"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-neutral-100 select-none">
                  <p className="text-sm font-bold text-black">8.200.000₫</p>
                  <button
                    onClick={() => navigate("/orders/LM8741")}
                    className="label-sm text-[10px] text-black uppercase border-b border-black font-semibold hover:opacity-75 transition-opacity cursor-pointer"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>

              {/* View All Orders CTA */}
              <button
                onClick={() => navigate("/orders")}
                className="w-full border border-black py-4.5 label-sm tracking-widest font-semibold hover:bg-black hover:text-white transition-colors cursor-pointer select-none text-center"
              >
                XEM TẤT CẢ ĐƠN HÀNG
              </button>
            </div>
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
              className="space-y-5 text-sm"
            >
              <div className="flex flex-col gap-1.5">
                <label className="label-sm text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Địa chỉ chi tiết
                </label>
                <textarea
                  rows={3}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  className="w-full border-neutral-300 focus:border-black focus:ring-0 text-black px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="pt-4 flex gap-4 select-none">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-3 label-sm font-semibold tracking-wider hover:bg-neutral-800 transition-colors uppercase text-center cursor-pointer"
                >
                  Thêm địa chỉ
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
    </div>
  );
};

export default Profile;
