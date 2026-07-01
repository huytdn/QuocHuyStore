import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiMinus, FiTrash2, FiChevronDown, FiCreditCard, FiShield, FiCheckCircle } from "react-icons/fi";
import Footer from "../components/Footer";

const INITIAL_ITEMS = [
  {
    id: "blazer",
    name: "Silk Blazer",
    color: "Midnight Black",
    size: "M",
    price: 4500000,
    quantity: 1,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmJ7xDwIsdolQJiw7PwYvAaIH7FizONpRtYW-_9GXCKrUuhSJpqlrZZKsC_CyPNL9drXnqeOgbkKdI7HZLIpAaUcGV4IvPc01yxQfad6XK4HL3dmR50uHqjGJ18GesoBhBMtmrFnKaqLzPsvjw2sVeXXcQXyBADNkl3_rc4OTjrgDkd7_ab4jEoMz7Tr6jWs1NhW6h-pcs1ZhZcO-d9UxzCINUcTgLvcuDh3V71PTkcmgS9Lnt0lDh88I_Wk2tzK2Yqt4u4dXwguI"
  },
  {
    id: "trousers",
    name: "Pleated Trousers",
    color: "Ivory White",
    size: "S",
    price: 2800000,
    quantity: 1,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB30N42U3l73e0UhKJLAPRNovGkm2IRm6cbZcdBy2caQMvj9QkPI8bTCrX83ojR8tGrBhspztyRkfD5twPiF4nic0vkNNUH2vso_phxjLsCayJr1mbCeRCp-0sqOf0GXJk40QhzbM53ywKA1rSr4HsjkxXfEsduYrXEdP98F_X43fGzdt4gJiGw3ZNL7D_yID6XcmbVTIl192BGsnnMMS1dokxhsnahEdTRT1hzRVRsJyLLZy8HVqFziR40AQXo-AVvgposBk9f-dA"
  }
];

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [discountValue, setDiscountValue] = useState(0); // 0.1 for 10%
  const [selectedAddress, setSelectedAddress] = useState("1");
  const [newAddressOpen, setNewAddressOpen] = useState(false);
  const [newAddressText, setNewAddressText] = useState("");
  const [addresses, setAddresses] = useState([
    { id: "1", label: "Địa chỉ mặc định: 123 Đường Lê Lợi, Quận 1, TP. HCM" }
  ]);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  // Formatting currency helper
  const formatPrice = (val) => {
    return val.toLocaleString("vi-VN") + "đ";
  };

  // Quantity updates
  const handleQuantityChange = (id, delta) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      })
    );
  };

  // Remove item
  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 0; // Free shipping
  const discountAmount = subtotal * discountValue;
  const total = Math.max(0, subtotal + shippingFee - discountAmount);

  // Apply discount code
  const handleApplyPromo = (e) => {
    e.preventDefault();
    setDiscountError("");
    if (discountCode.toUpperCase() === "LUMIERE10") {
      setDiscountApplied(true);
      setDiscountValue(0.1); // 10% off
    } else if (discountCode.trim() === "") {
      setDiscountError("Vui lòng nhập mã giảm giá");
    } else {
      setDiscountError("Mã giảm giá không hợp lệ. Thử: LUMIERE10");
      setDiscountApplied(false);
      setDiscountValue(0);
    }
  };

  // Add new address
  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (newAddressText.trim()) {
      const nextId = String(addresses.length + 1);
      setAddresses((prev) => [
        ...prev,
        { id: nextId, label: newAddressText }
      ]);
      setSelectedAddress(nextId);
      setNewAddressText("");
      setNewAddressOpen(false);
    }
  };

  // Checkout handling
  const handleCheckout = () => {
    if (items.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    setCheckoutComplete(true);
    // In a real app, this would clear the cart store/cookie
  };

  if (checkoutComplete) {
    return (
      <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
        <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 md:px-16 py-32 flex flex-col items-center justify-center text-center">
          <div className="bg-neutral-100 p-8 rounded-full mb-8 text-black animate-bounce">
            <FiCheckCircle size={64} className="stroke-[1.5]" />
          </div>
          <h1 className="font-serif text-[36px] md:text-[48px] font-bold mb-4 uppercase">ĐẶT HÀNG THÀNH CÔNG</h1>
          <p className="body-md text-neutral-600 max-w-lg mb-8 leading-relaxed">
            Cảm ơn bạn đã lựa chọn LUMIÈRE. Đơn hàng của bạn đang được xử lý. Chúng tôi đã gửi email xác nhận chi tiết đơn hàng cùng mã vận đơn đến email của bạn.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/product")}
              className="bg-black text-white px-8 py-4.5 label-sm tracking-widest font-semibold hover:bg-neutral-800 transition-colors"
            >
              TIẾP TỤC MUA SẮM
            </button>
          </div>
        </main>
        <Footer variant="detailed" />
      </div>
    );
  }

  return (
    <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
      {/* Main Section */}
      <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 md:px-16 pt-32 pb-24">
        <h1 className="font-serif text-[32px] md:text-[44px] mb-12 text-center font-semibold uppercase tracking-normal">
          GIỎ HÀNG CỦA BẠN
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-6">
            <p className="body-lg text-neutral-500 font-light">Giỏ hàng của bạn đang trống.</p>
            <Link
              to="/product"
              className="bg-black text-white px-8 py-4 label-sm font-semibold tracking-widest hover:bg-neutral-800 transition-colors"
            >
              QUAY LẠI MUA SẮM
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Items Column */}
            <div className="lg:col-span-8">
              {/* Desktop Headers */}
              <div className="hidden md:grid grid-cols-12 pb-4 border-b border-neutral-300 text-neutral-500 font-semibold label-sm text-[11px] uppercase tracking-wider">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Tổng</div>
              </div>

              {/* Items List */}
              <div className="flex flex-col">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-12 py-8 border-b border-neutral-200/80 items-center gap-6"
                  >
                    {/* Image & Details */}
                    <div className="md:col-span-6 flex items-center gap-6">
                      <div className="w-24 h-32 bg-neutral-100 overflow-hidden flex-shrink-0 select-none">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex flex-col items-start text-left">
                        <h3 className="font-serif text-lg md:text-xl font-medium text-black mb-1.5">{item.name}</h3>
                        <p className="text-neutral-500 text-xs md:text-sm font-light mb-1">Màu: {item.color}</p>
                        <p className="text-neutral-500 text-xs md:text-sm font-light">Size: {item.size}</p>
                        
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="mt-4 text-[10px] text-neutral-400 hover:text-red-600 underline uppercase tracking-widest font-semibold transition-colors cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 md:text-center flex md:block justify-between items-center">
                      <span className="md:hidden text-neutral-400 label-sm text-[10px]">Đơn giá:</span>
                      <p className="body-md text-black">{formatPrice(item.price)}</p>
                    </div>

                    {/* Quantity Toggles */}
                    <div className="md:col-span-2 flex md:justify-center justify-between items-center select-none">
                      <span className="md:hidden text-neutral-400 label-sm text-[10px]">Số lượng:</span>
                      <div className="flex items-center border border-neutral-300 h-10">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="px-3 text-neutral-500 hover:bg-neutral-100 h-full flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="px-4 text-sm font-semibold text-black w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="px-3 text-neutral-500 hover:bg-neutral-100 h-full flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2 md:text-right flex md:block justify-between items-center">
                      <span className="md:hidden text-neutral-400 label-sm text-[10px]">Thành tiền:</span>
                      <p className="body-md font-semibold text-black">{formatPrice(item.price * item.quantity)}</p>
                    </div>

                  </div>
                ))}
              </div>

              {/* Continue Shopping Link */}
              <div className="mt-8 flex justify-start">
                <Link
                  to="/product"
                  className="label-sm text-xs font-semibold uppercase tracking-widest flex items-center gap-2 hover:text-neutral-500 transition-colors group select-none"
                >
                  <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 lg:pl-4">
              <div className="bg-[#f5f3f3] p-8 border border-neutral-200/50 sticky top-32 text-left">
                <h2 className="font-serif text-[24px] mb-8 font-medium text-black">Tóm tắt đơn hàng</h2>
                
                {/* Breakdowns */}
                <div className="space-y-4 pb-6 border-b border-neutral-300">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">Tạm tính</span>
                    <span className="font-medium text-black">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">Phí vận chuyển</span>
                    <span className="text-black font-semibold uppercase text-xs tracking-wider">Miễn phí</span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between items-center text-sm text-emerald-700 font-medium">
                      <span>Mã giảm giá (10%)</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="py-6 border-b border-neutral-300">
                  <p className="label-sm text-[10px] uppercase tracking-widest text-neutral-500 mb-3.5">
                    ĐỊA CHỈ GIAO HÀNG
                  </p>
                  
                  <div className="relative mb-3">
                    <select
                      value={selectedAddress}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="w-full bg-surface-bg border border-neutral-300 focus:ring-black focus:border-black text-sm px-4 py-3.5 pr-10 rounded-none appearance-none cursor-pointer text-black"
                    >
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.label.length > 35 ? addr.label.slice(0, 35) + "..." : addr.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                      <FiChevronDown size={18} />
                    </div>
                  </div>

                  {!newAddressOpen ? (
                    <button
                      onClick={() => setNewAddressOpen(true)}
                      className="text-[10px] label-sm font-semibold uppercase tracking-widest underline underline-offset-4 hover:text-neutral-500 transition-colors cursor-pointer"
                    >
                      + Thêm địa chỉ mới
                    </button>
                  ) : (
                    <form onSubmit={handleAddAddressSubmit} className="mt-3 flex flex-col gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Nhập địa chỉ mới của bạn..."
                        value={newAddressText}
                        onChange={(e) => setNewAddressText(e.target.value)}
                        className="w-full border border-neutral-300 bg-white p-2.5 text-xs text-black outline-none focus:border-black"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setNewAddressOpen(false);
                            setNewAddressText("");
                          }}
                          className="px-3 py-1.5 border border-neutral-300 text-[10px] font-bold tracking-wider hover:bg-neutral-100"
                        >
                          HỦY
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-black text-white text-[10px] font-bold tracking-wider hover:bg-neutral-800"
                        >
                          LƯU
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Promo Code */}
                <div className="py-6 border-b border-neutral-300">
                  <p className="label-sm text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
                    Mã giảm giá
                  </p>
                  
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã của bạn (LUMIERE10)"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      disabled={discountApplied}
                      className="flex-grow bg-white border border-neutral-300 focus:ring-black focus:border-black text-xs px-4 py-3 rounded-none text-black disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={discountApplied}
                      className="px-5 bg-black text-white label-sm text-[10px] font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:bg-neutral-300 cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  </form>
                  {discountApplied && (
                    <p className="text-emerald-700 text-xs mt-2 font-medium">Mã LUMIERE10 áp dụng thành công!</p>
                  )}
                  {discountError && <p className="text-red-600 text-xs mt-2 font-medium">{discountError}</p>}
                </div>

                {/* Payment Methods */}
                <div className="py-6 border-b border-neutral-300">
                  <p className="label-sm text-[10px] uppercase tracking-widest text-neutral-500 mb-4">
                    PHƯƠNG THỨC THANH TOÁN
                  </p>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                      <input
                        type="radio"
                        name="payment_method"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="w-4 h-4 text-black border-neutral-300 focus:ring-black accent-black cursor-pointer"
                      />
                      <span className="text-xs md:text-sm text-neutral-600 group-hover:text-black transition-colors">
                        Thanh toán khi nhận hàng (COD)
                      </span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                      <input
                        type="radio"
                        name="payment_method"
                        value="online"
                        checked={paymentMethod === "online"}
                        onChange={() => setPaymentMethod("online")}
                        className="w-4 h-4 text-black border-neutral-300 focus:ring-black accent-black cursor-pointer"
                      />
                      <span className="text-xs md:text-sm text-neutral-600 group-hover:text-black transition-colors">
                        Thanh toán trực tuyến (Thẻ nội địa, Visa, Mastercard)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Total Section */}
                <div className="pt-6 pb-8 flex justify-between items-end">
                  <span className="text-sm font-semibold text-black uppercase tracking-wider">Tổng cộng</span>
                  <div className="text-right">
                    <p className="font-serif text-[26px] md:text-[30px] font-bold text-black leading-tight">
                      {formatPrice(total)}
                    </p>
                    <p className="text-[10px] text-neutral-500">Đã bao gồm thuế GTGT</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-5 label-sm font-bold tracking-[0.25em] hover:bg-neutral-800 transition-colors mb-4 cursor-pointer"
                >
                  THANH TOÁN
                </button>

                {/* Secure checkout badges */}
                <div className="flex items-center justify-center gap-5 opacity-40 select-none">
                  <FiCreditCard size={18} />
                  <FiShield size={18} />
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer variant="detailed" />
    </div>
  );
};

export default Cart;
