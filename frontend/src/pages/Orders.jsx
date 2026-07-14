import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCheck,
  FiTruck,
  FiClock,
} from "react-icons/fi";
import Footer from "../components/Footer";
import { useAuthStore } from "../store/useAuthStore";
import { useLogout } from "../hooks/api/useAuth";

const MOCK_ORDERS = [
  {
    id: "#LM8892",
    date: "14/10/2024",
    status: "delivered", // delivered | transit | pending
    statusLabel: "Đã giao",
    total: "12.450.000₫",
    shippingAddress: "Nguyễn Văn A, 123 Đường Lê Lợi, Quận 1, TP. HCM",
    paymentMethod: "Thanh toán trực tuyến (Visa)",
    items: [
      {
        id: "gown",
        name: "Silk Evening Gown",
        color: "Midnight Black",
        size: "S",
        price: "8.950.000₫",
        quantity: 1,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDDNFa5ITeyqkrfO-a5jyZM4k_c8orAuDIFdp1sRlMRn0YtYAf3lP_hoqo6Eu-lLDnShVpKCpgYTo2poGoLpzaFYeIpL9d5h5UHycZ-KFB3UEyifSUss4M3VWjgHpaAtbITFisGCo0UWisYrtVSMCUmSDilOLBqv6D1Z9Kqbb5WCf1ZrV9osgD8ToOR7saE0G-d5gX138Dh-ogbGv1SkcS6bBe3n68KgIS0lq92IFmzDWLm_DmxJzRl9p1qPrENUfaudZNXZ2DQsGA",
      },
      {
        id: "handbag",
        name: "Ivory Leather Handbag",
        color: "Ivory White",
        size: "One Size",
        price: "3.500.000₫",
        quantity: 1,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDexoUYjzxOLXzASqYxDLMfxvFXF_J3uULvYEsmwKLx81yvdmLsFjKwd4SbqP-ip2SZ_Yqs1Ud6ixwW6zBOl1r5gZQDduHog-Ee9rlz2vIu1nnqlpVTUie4KvEcyzCIpflEHDpJnEsJI_Pp6zBrMSNcmwjtyI3BPFhUZGwVmoGH6MXWuhYglQWUgJ9nec7xKNwO1twFZ-KZR9eJ8v1vbs7PtamhoDWIY-jxjNMBMYrd2zWMlXH1N6p7M_V3PzCc-40pfFe8pLQVe34",
      },
    ],
  },
  {
    id: "#LM8741",
    date: "08/10/2024",
    status: "transit",
    statusLabel: "Đang vận chuyển",
    total: "8.200.000₫",
    shippingAddress: "Nguyễn Văn A, 123 Đường Lê Lợi, Quận 1, TP. HCM",
    paymentMethod: "Thanh toán khi nhận hàng (COD)",
    items: [
      {
        id: "overcoat",
        name: "Charcoal Wool Overcoat",
        color: "Charcoal Grey",
        size: "L",
        price: "8.200.000₫",
        quantity: 1,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBd6NxgcX8-OgWAmGuxyjivtjIdrBTfu6H5xN1xh33TQV6fxo4BEYQtv8cQ_Lzb9gD3oljDPDztDmzSsrbhEo5LO2lSduTHNGaewv2xDdqWmnlLQ6m0vA146l7ToZrXsDoJNnCXs53SGvRt_11rsInjxo9QMnC0-W3xaClLKluB_-Yfl3HqxfGpOSegsuLfJIlE4FlfapS9x7Y6vKcPbsUXxSIjLENwA7ZbCigyOK58FuMmVZ953S5ZUtvRMtV7N6mY5iuB2oqk5f4",
      },
    ],
  },
  {
    id: "#LM8605",
    date: "02/10/2024",
    status: "pending",
    statusLabel: "Chờ xác nhận",
    total: "3.500.000₫",
    shippingAddress: "Nguyễn Văn A, 123 Đường Lê Lợi, Quận 1, TP. HCM",
    paymentMethod: "Thanh toán khi nhận hàng (COD)",
    items: [
      {
        id: "pearl",
        name: "Delicate Pearl Necklace",
        color: "Gold / Pearl",
        size: "One Size",
        price: "3.500.000₫",
        quantity: 1,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCNqDIbSUQs8dEbhxJU4vmWvYrjBgDUHuh9a0R7_wQdz6M2VTWZeRbKvvVqx7yE1G6UkclrL0uO4Bfx_JdHFX2dpu6bIxKb9ZSZvqMFpynfz9HjDH5m1ErfHlGO0Gr7uDzr1XmbUGaMY9BBuMuZxW9fVrABuw3YOz_qoqfnDeAx29MfujksRfzSU6cvwkdttrCGsd5NFk-iBHUDiFZ_JN2HLmNZssYZ_xtskRd4EO2HvDUjy5M4n8Be9I0TbdDCp1z6keTh1LvBJxs",
      },
    ],
  },
];

const Orders = () => {
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const user = useAuthStore((state) => state.user);

  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState("orders"); // profile | orders | addresses | wishlist
  const [activePage, setActivePage] = useState(1);

  const handleLogout = () => {
    logoutMutation.mutate(null, {
      onSettled: () => {
        navigate("/login");
      },
    });
  };

  // Render status badge style
  const renderStatusBadge = (status, label) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 border border-neutral-200 text-black text-[10px] label-sm font-semibold tracking-wider">
            <FiCheck className="text-emerald-700" size={10} />
            {label}
          </span>
        );
      case "transit":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e9dfcb] border border-[#cfc5b3] text-[#696253] text-[10px] label-sm font-semibold tracking-wider">
            <FiTruck size={10} />
            {label}
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f3f3] border border-neutral-300 text-neutral-500 text-[10px] label-sm font-semibold tracking-wider">
            <FiClock size={10} />
            {label}
          </span>
        );
    }
  };

  return (
    <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
      {/* Main Container */}
      <main className="max-w-[1440px] mx-auto w-full px-6 md:px-16 pt-32 pb-24 flex-grow text-left">
        {/* Breadcrumb */}
        <div className="mb-12 select-none">
          <div className="flex items-center gap-2 mb-4 label-sm text-[10px] text-neutral-500 tracking-widest uppercase">
            <Link to="/" className="hover:text-black transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="hover:text-black transition-colors">
              Tài khoản
            </span>
            <span>/</span>
            <span className="text-black font-bold">Lịch sử đơn hàng</span>
          </div>
          <h1 className="font-serif text-[32px] md:text-[44px] font-semibold text-black uppercase tracking-normal">
            Đơn hàng của tôi
          </h1>
        </div>

        {/* Layout Container */}
        <div className="w-full">
          {/* Orders Section */}
          <section className="w-full">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center select-none">
                <FiClock
                  size={54}
                  className="text-neutral-300 mb-4 stroke-[1.2]"
                />
                <h2 className="font-serif text-2xl mb-2 text-black font-semibold">
                  Bạn chưa có đơn hàng nào
                </h2>
                <p className="body-md text-neutral-500 mb-8 max-w-sm">
                  Hãy khám phá các bộ sưu tập mới nhất của chúng tôi và tìm cho
                  mình những món đồ ưng ý nhất.
                </p>
                <Link
                  to="/product"
                  className="bg-black text-white px-12 py-4.5 label-sm tracking-widest font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Khám phá ngay
                </Link>
              </div>
            ) : (
              <>
                {/* Orders Table Headers (Desktop) */}
                <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-black text-neutral-500 label-sm text-[11px] font-bold uppercase tracking-wider select-none">
                  <div className="col-span-2">Đơn hàng</div>
                  <div className="col-span-2">Ngày đặt</div>
                  <div className="col-span-3">Sản phẩm</div>
                  <div className="col-span-2 text-center">Trạng thái</div>
                  <div className="col-span-1 text-right">Tổng cộng</div>
                  <div className="col-span-2 text-right">Hành động</div>
                </div>

                {/* Orders List entries */}
                <div className="divide-y divide-neutral-200">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() =>
                        navigate(`/orders/${order.id.replace("#", "")}`)
                      }
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 py-8 items-center hover:bg-neutral-50/50 transition-colors px-0 md:px-4 -mx-0 md:-mx-4 group cursor-pointer"
                    >
                      {/* Order Code */}
                      <div className="col-span-2 flex md:block justify-between items-baseline">
                        <span className="font-serif text-[18px] font-bold text-black group-hover:text-neutral-600 transition-colors">
                          {order.id}
                        </span>
                        <p className="md:hidden text-neutral-400 label-sm text-[10px] tracking-wider mt-1.5">
                          {order.date}
                        </p>
                      </div>

                      {/* Date (Desktop) */}
                      <div className="hidden md:block md:col-span-2 text-sm text-neutral-500">
                        {order.date}
                      </div>

                      {/* Products thumbnails */}
                      <div className="col-span-3 flex items-center gap-3">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div
                            key={item.id}
                            className="relative w-16 h-20 overflow-hidden bg-neutral-100 flex-shrink-0"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover opacity-90 select-none"
                            />
                            {idx === 1 && order.items.length > 2 && (
                              <div className="absolute inset-0 bg-black/45 flex items-center justify-center text-white text-[10px] font-bold select-none">
                                +{order.items.length - 2}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex justify-start md:justify-center">
                        {renderStatusBadge(order.status, order.statusLabel)}
                      </div>

                      {/* Total */}
                      <div className="col-span-1 text-left md:text-right text-sm font-semibold text-black">
                        {order.total}
                      </div>

                      {/* Action */}
                      <div className="col-span-2 text-right select-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/orders/${order.id.replace("#", "")}`);
                          }}
                          className="label-sm text-[10px] text-black uppercase border-b border-black font-semibold hover:opacity-75 transition-opacity cursor-pointer"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-16 flex justify-center items-center gap-3 select-none">
                  <button
                    onClick={() => setActivePage(1)}
                    className="w-10 h-10 flex items-center justify-center border border-neutral-300 text-neutral-500 hover:border-black hover:text-black transition-colors cursor-pointer"
                    aria-label="Previous Page"
                  >
                    <FiChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActivePage(1)}
                    className={`w-10 h-10 flex items-center justify-center font-sans font-semibold text-xs tracking-wider ${
                      activePage === 1
                        ? "bg-black text-white"
                        : "border border-neutral-300 text-neutral-500 hover:border-black hover:text-black"
                    }`}
                  >
                    1
                  </button>
                  <button
                    onClick={() => setActivePage(2)}
                    className={`w-10 h-10 flex items-center justify-center font-sans font-semibold text-xs tracking-wider ${
                      activePage === 2
                        ? "bg-black text-white"
                        : "border border-neutral-300 text-neutral-500 hover:border-black hover:text-black"
                    }`}
                  >
                    2
                  </button>
                  <button
                    onClick={() => setActivePage(2)}
                    className="w-10 h-10 flex items-center justify-center border border-neutral-300 text-neutral-500 hover:border-black hover:text-black transition-colors cursor-pointer"
                    aria-label="Next Page"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <Footer variant="detailed" />
    </div>
  );
};

export default Orders;
