import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiDownload, FiInfo } from "react-icons/fi";
import Footer from "../components/Footer";

const ORDER_DATABASE = {
  LM8892: {
    id: "#LM8892",
    date: "14 THÁNG 10, 2024",
    statusLabel: "ĐÃ GIAO HÀNG",
    shippingName: "Nguyễn Minh Tuấn",
    shippingPhone: "090 123 4567",
    shippingAddress:
      "Tầng 12, Bitexco Financial Tower, 2 Hải Triều, Bến Nghé, Quận 1, TP. Hồ Chí Minh, 700000",
    shippingNotes: "Giao hàng giờ hành chính, vui lòng gọi trước.",
    shippingMethod: "Giao hàng hỏa tốc (Standard Express)",
    paymentMethod: "Thẻ tín dụng (Visa ending in 4242)",
    subtotal: "20.700.000₫",
    shippingFee: "Miễn phí",
    discount: "-1.035.000₫",
    discountCode: "LUMIEREVIP",
    total: "19.665.000₫",
    items: [
      {
        id: "blazer",
        name: "Structured Silk Blazer",
        size: "M",
        color: "CHARCOAL",
        quantity: "01",
        price: "12.500.000₫",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBX8iRE5-KlNtxO6Z3BYlBMYECNanGhJtQBNN1jCJk13y_kS-QHWY4rAXDcgmiBFZArT4YOTFdIAn5UeWpxsUmjy_XgSEcU0ndGU2yycnoYPYH2qCXKbwioFlCh9JEmH4oSnv7470BOD4-hySS6Ec8Ej05Q47mk4WJkP_ufx2pG4PQ9I6lFpcgEBwQG1tiw6_tASyO89ZQezwWciHrbRykkVjo1MW5OgE9ayuigoOvl5VNycosnS_RH1NuIYqjzsKz350gp1sKnkwY",
      },
      {
        id: "pleated-trousers",
        name: "Architectural Pleated Trousers",
        size: "L",
        color: "MIDNIGHT BLUE",
        quantity: "01",
        price: "8.200.000₫",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB-S1bQxx4ZIZVx-uFBC-LG7nHclQvJafXcb_NgbtqhN-hRG_2pzSaTWWzoUZ9WrBm9c8yJekCdtHzT8Qdn4STzmTSZGyLu2bOb1tWvBG7dLWrNNqVJVO4MeMyo_GdzLefqLbzxIwbtjjrdUWXTLhqoPE0EfKQRs9Y1CZnuqhC_luBhB8rJcG0pncbgkoENAThk3sefWBQ6Ov1c_5zniHAx_ykj9QovAzxpMukIiy3mHy7OV-G3y4tcuWc2HaSzK9KjeeYsZDL2_4I",
      },
    ],
  },
  LM8741: {
    id: "#LM8741",
    date: "08 THÁNG 10, 2024",
    statusLabel: "ĐANG VẬN CHUYỂN",
    shippingName: "Nguyễn Minh Tuấn",
    shippingPhone: "090 123 4567",
    shippingAddress:
      "Tầng 12, Bitexco Financial Tower, 2 Hải Triều, Bến Nghé, Quận 1, TP. Hồ Chí Minh, 700000",
    shippingNotes: "",
    shippingMethod: "Giao hàng hỏa tốc (Standard Express)",
    paymentMethod: "Thanh toán khi nhận hàng (COD)",
    subtotal: "8.200.000₫",
    shippingFee: "Miễn phí",
    discount: "0₫",
    discountCode: "",
    total: "8.200.000₫",
    items: [
      {
        id: "wool-overcoat",
        name: "Structured Wool Overcoat",
        size: "L",
        color: "CHARCOAL GREY",
        quantity: "01",
        price: "8.200.000₫",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBd6NxgcX8-OgWAmGuxyjivtjIdrBTfu6H5xN1xh33TQV6fxo4BEYQtv8cQ_Lzb9gD3oljDPDztDmzSsrbhEo5LO2lSduTHNGaewv2xDdqWmnlLQ6m0vA146l7ToZrXsDoJNnCXs53SGvRt_11rsInjxo9QMnC0-W3xaClLKluB_-Yfl3HqxfGpOSegsuLfJIlE4FlfapS9x7Y6vKcPbsUXxSIjLENwA7ZbCigyOK58FuMmVZ953S5ZUtvRMtV7N6mY5iuB2oqk5f4",
      },
    ],
  },
  LM8605: {
    id: "#LM8605",
    date: "02 THÁNG 10, 2024",
    statusLabel: "CHỜ XÁC NHẬN",
    shippingName: "Nguyễn Minh Tuấn",
    shippingPhone: "090 123 4567",
    shippingAddress:
      "Tầng 12, Bitexco Financial Tower, 2 Hải Triều, Bến Nghé, Quận 1, TP. Hồ Chí Minh, 700000",
    shippingNotes: "",
    shippingMethod: "Giao hàng hỏa tốc (Standard Express)",
    paymentMethod: "Thanh toán khi nhận hàng (COD)",
    subtotal: "3.500.000₫",
    shippingFee: "Miễn phí",
    discount: "0₫",
    discountCode: "",
    total: "3.500.000₫",
    items: [
      {
        id: "pearl",
        name: "Delicate Pearl Necklace",
        size: "One Size",
        color: "GOLD / PEARL",
        quantity: "01",
        price: "3.500.000₫",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCNqDIbSUQs8dEbhxJU4vmWvYrjBgDUHuh9a0R7_wQdz6M2VTWZeRbKvvVqx7yE1G6UkclrL0uO4Bfx_JdHFX2dpu6bIxKb9ZSZvqMFpynfz9HjDH5m1ErfHlGO0Gr7uDzr1XmbUGaMY9BBuMuZxW9fVrABuw3YOz_qoqfnDeAx29MfujksRfzSU6cvwkdttrCGsd5NFk-iBHUDiFZ_JN2HLmNZssYZ_xtskRd4EO2HvDUjy5M4n8Be9I0TbdDCp1z6keTh1LvBJxs",
      },
    ],
  },
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find order in mock database, default to LM8892 if not found
  const normalizedId = id ? id.toUpperCase() : "LM8892";
  const order = ORDER_DATABASE[normalizedId] || ORDER_DATABASE.LM8892;

  const handleDownloadInvoice = () => {
    window.print();
  };

  const handleReorder = (item) => {
    alert(`Đã thêm lại sản phẩm "${item.name}" vào giỏ hàng.`);
    navigate("/cart");
  };

  const handleWriteReview = (item) => {
    alert(`Mở giao diện đánh giá cho sản phẩm "${item.name}".`);
  };

  const handleSupportClick = () => {
    alert("Bộ phận CSKH của LUMIÈRE sẽ liên hệ hỗ trợ bạn trong vòng 15 phút.");
  };

  return (
    <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
      <main className="pt-32 pb-24 max-w-[1000px] mx-auto w-full px-6 md:px-0 text-left">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 select-none">
          <div>
            <nav className="mb-4 flex items-center gap-1 text-neutral-400 label-sm text-[10px] tracking-widest uppercase">
              <Link to="/orders" className="hover:text-black transition-colors">
                Tài khoản
              </Link>
              <span className="text-[8px] mx-1">/</span>
              <Link to="/orders" className="hover:text-black transition-colors">
                Lịch sử đơn hàng
              </Link>
              <span className="text-[8px] mx-1">/</span>
              <span className="text-black font-bold">{order.id}</span>
            </nav>

            <h1 className="font-serif text-[32px] md:text-[44px] font-semibold text-black uppercase tracking-normal mb-2">
              Chi tiết đơn hàng
            </h1>

            <div className="flex items-center gap-3 text-neutral-500 label-sm text-xs font-semibold tracking-wider">
              <span>MÃ ĐƠN: {order.id}</span>
              <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
              <span>NGÀY ĐẶT: {order.date}</span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <span className="px-4 py-2 border border-black font-semibold label-sm text-[10px] tracking-widest uppercase mb-4 bg-black text-white">
              {order.statusLabel}
            </span>
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center gap-2 text-black font-semibold label-sm text-[10px] tracking-widest hover:underline underline-offset-4 transition-all uppercase cursor-pointer"
            >
              <FiDownload size={14} />
              TẢI HÓA ĐƠN (PDF)
            </button>
          </div>
        </div>

        {/* Order Items Grid */}
        <div className="space-y-12 mb-20">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row gap-8 items-start border-b border-neutral-200 pb-12 group"
            >
              {/* Product Image Thumbnail */}
              <div className="w-full md:w-40 aspect-[2/3] overflow-hidden bg-neutral-100 flex-shrink-0 relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Product Meta & Actions */}
              <div className="flex-1 flex flex-col justify-between h-full py-2 w-full">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-serif text-[24px] font-semibold text-black mb-3 leading-snug">
                      {item.name}
                    </h3>

                    <div className="space-y-1 text-neutral-400 label-sm text-[11px] tracking-widest uppercase font-semibold">
                      <p>
                        KÍCH CỠ:{" "}
                        <span className="text-black font-bold">
                          {item.size}
                        </span>
                      </p>
                      <p>
                        MÀU SẮC:{" "}
                        <span className="text-black font-bold">
                          {item.color}
                        </span>
                      </p>
                      <p>
                        SỐ LƯỢNG:{" "}
                        <span className="text-black font-bold">
                          {item.quantity}
                        </span>
                      </p>
                    </div>
                  </div>

                  <p className="font-serif text-[20px] font-semibold text-black">
                    {item.price}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="mt-8 flex gap-4 select-none">
                  <button
                    onClick={() => handleReorder(item)}
                    className="label-sm text-[10px] tracking-widest uppercase border border-black px-5 py-2.5 bg-white text-black font-bold hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    Mua lại
                  </button>
                  <button
                    onClick={() => handleWriteReview(item)}
                    className="label-sm text-[10px] tracking-widest uppercase text-neutral-500 font-bold hover:text-black transition-colors cursor-pointer"
                  >
                    Gửi đánh giá
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Information & Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Customer Info (Left Column) */}
          <div className="space-y-12 text-left">
            <div>
              <h4 className="label-sm text-[11px] tracking-widest uppercase text-neutral-400 font-bold mb-6 pb-2 border-b border-neutral-200 select-none">
                Thông tin vận chuyển
              </h4>

              <div className="space-y-2 text-black text-sm md:text-base">
                <p className="font-bold text-lg">{order.shippingName}</p>
                <p className="text-neutral-600">{order.shippingPhone}</p>
                <p className="text-neutral-600 leading-relaxed font-light">
                  {order.shippingAddress}
                </p>
                {order.shippingNotes && (
                  <p className="mt-4 pt-4 text-neutral-500 font-light border-t border-neutral-100 italic">
                    "{order.shippingNotes}"
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="label-sm text-[11px] tracking-widest uppercase text-neutral-400 font-bold mb-6 pb-2 border-b border-neutral-200 select-none">
                Phương thức
              </h4>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="label-sm text-[9px] text-neutral-400 tracking-widest mb-2 uppercase font-bold">
                    VẬN CHUYỂN
                  </p>
                  <p className="text-black text-sm font-semibold">
                    {order.shippingMethod}
                  </p>
                </div>
                <div>
                  <p className="label-sm text-[9px] text-neutral-400 tracking-widest mb-2 uppercase font-bold">
                    THANH TOÁN
                  </p>
                  <p className="text-black text-sm font-semibold">
                    {order.paymentMethod}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary (Right Column) */}
          <div className="bg-neutral-50 border border-neutral-200/80 p-8 flex flex-col h-fit text-left">
            <h4 className="label-sm text-xs tracking-widest uppercase text-black font-bold mb-8 border-b border-neutral-200 pb-4 select-none">
              Tóm tắt thanh toán
            </h4>

            <div className="space-y-6 text-sm">
              <div className="flex justify-between items-center text-neutral-500">
                <span>Tạm tính</span>
                <span className="font-semibold text-black">
                  {order.subtotal}
                </span>
              </div>

              <div className="flex justify-between items-center text-neutral-500">
                <span>Phí vận chuyển</span>
                <span className="font-semibold text-black">
                  {order.shippingFee}
                </span>
              </div>

              {order.discountCode && (
                <div className="flex justify-between items-center text-neutral-500">
                  <span>Giảm giá ({order.discountCode})</span>
                  <span className="font-semibold text-red-600">
                    {order.discount}
                  </span>
                </div>
              )}

              {/* Decorative luxury line divider */}
              <div className="h-[1px] bg-neutral-200 my-2" />

              <div className="flex justify-between items-center pt-2">
                <span className="label-sm text-xs tracking-widest uppercase text-black font-bold">
                  TỔNG CỘNG
                </span>
                <span className="font-serif text-2xl font-bold text-black">
                  {order.total}
                </span>
              </div>
            </div>

            <button
              onClick={handleSupportClick}
              className="mt-12 w-full bg-black text-white py-5 label-sm font-bold tracking-widest hover:bg-neutral-800 transition-colors uppercase flex items-center justify-center gap-2.5 cursor-pointer select-none"
            >
              HỖ TRỢ ĐƠN HÀNG
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-24 pt-12 border-t border-neutral-200 flex justify-center select-none">
          <Link
            to="/orders"
            className="flex items-center gap-2.5 group label-sm text-[11px] tracking-widest uppercase text-black font-bold"
          >
            <FiArrowLeft
              className="group-hover:-translate-x-1.5 transition-transform duration-300"
              size={16}
            />
            <span className="border-b border-transparent group-hover:border-black transition-all">
              QUAY LẠI ĐƠN HÀNG ĐÃ MUA
            </span>
          </Link>
        </div>
      </main>

      <Footer variant="detailed" />
    </div>
  );
};

export default OrderDetail;
