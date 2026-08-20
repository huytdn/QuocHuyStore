import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiChevronDown,
  FiCreditCard,
  FiShield,
  FiCheckCircle,
  FiTag,
  FiGift,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import { useAuthStore } from "../store/useAuthStore";
import { useAddresses, useCreateAddress } from "../hooks/api/useAddress";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "../hooks/api/useCart";
import { useCreateOrder } from "../hooks/api/useOrders";
import { usePublicVouchers, useValidateVoucher } from "../hooks/api/useVouchers";

const Cart = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isUserLoggedIn = useAuthStore((state) => !!state.accessToken);

  const { data: cartItems, isLoading: isCartLoading } = useCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const createOrderMutation = useCreateOrder();

  // Voucher Hooks & States
  const { data: publicVouchers = [], isLoading: isVouchersLoading } = usePublicVouchers();
  const validateVoucherMutation = useValidateVoucher();

  const items = cartItems || [];

  const [discountCode, setDiscountCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null); // { code, discountAmount, title }
  const [discountError, setDiscountError] = useState("");
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const { data: addressPage } = useAddresses({ page: 0, size: 50 });
  const backendAddresses = addressPage?.content || [];
  const createAddressMutation = useCreateAddress();

  const [selectedAddress, setSelectedAddress] = useState("");
  const [newAddressOpen, setNewAddressOpen] = useState(false);
  const [newAddressText, setNewAddressText] = useState("");
  const [addresses, setAddresses] = useState([]);

  // Synchronize selectedAddress when backendAddresses load
  useEffect(() => {
    if (isUserLoggedIn && backendAddresses.length > 0) {
      const defaultAddr = backendAddresses.find((addr) => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(String(defaultAddr.id));
      } else {
        setSelectedAddress(String(backendAddresses[0].id));
      }
    } else if (addresses.length > 0) {
      setSelectedAddress(String(addresses[0].id));
    }
  }, [backendAddresses, addresses, isUserLoggedIn]);

  const displayAddresses = isUserLoggedIn && backendAddresses.length > 0
    ? backendAddresses.map((addr) => ({
        id: String(addr.id),
        label: `${addr.receiverName} (${addr.receiverPhone}) - ${addr.addressDetail}`,
      }))
    : addresses;

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState(null);

  // Formatting currency helper
  const formatPrice = (val) => {
    if (val === null || val === undefined || isNaN(Number(val))) return "0đ";
    return Number(val).toLocaleString("vi-VN") + "đ";
  };

  // Quantity updates
  const handleQuantityChange = (cartItemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    updateCartItemMutation.mutate({ cartItemId, quantity: newQty }, {
      onError: (err) => {
        toast.error(err.response?.data?.message || "Cập nhật số lượng thất bại!");
      }
    });
  };

  // Remove item
  const handleRemoveItem = (cartItemId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      removeFromCartMutation.mutate(cartItemId, {
        onSuccess: () => {
          toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Xóa sản phẩm thất bại!");
        }
      });
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.priceAtPurchase ?? item.unitPrice ?? 0;
    return sum + Number(itemPrice) * item.quantity;
  }, 0);
  const shippingFee = 0; // Free shipping
  const discountAmount = appliedVoucher ? Number(appliedVoucher.discountAmount || 0) : 0;
  const total = Math.max(0, subtotal + shippingFee - discountAmount);

  // Apply discount code via API
  const handleApplyPromo = (e) => {
    if (e) e.preventDefault();
    const code = discountCode.trim();
    if (!code) {
      setDiscountError("Vui lòng nhập mã giảm giá");
      toast.warn("Vui lòng nhập mã giảm giá");
      return;
    }

    validateVoucherMutation.mutate(
      { code, orderAmount: subtotal },
      {
        onSuccess: (res) => {
          const validCode = res.voucherCode || res.code || code;
          const appliedObj = {
            code: validCode,
            discountAmount: res.discountAmount || 0,
            name: res.voucherName || res.name || `Voucher ${validCode}`,
          };
          setAppliedVoucher(appliedObj);
          setDiscountCode(validCode);
          setDiscountError("");
          setIsVoucherModalOpen(false);
          toast.success(`Áp dụng mã ${validCode} thành công! Giảm ${formatPrice(res.discountAmount || 0)}`);
        },
        onError: (err) => {
          const msg = err.response?.data?.message || "Mã giảm giá không hợp lệ hoặc chưa đủ điều kiện!";
          setDiscountError(msg);
          toast.error(msg);
        },
      }
    );
  };

  const handleSelectVoucherFromList = (v) => {
    validateVoucherMutation.mutate(
      { code: v.code, orderAmount: subtotal },
      {
        onSuccess: (res) => {
          const validCode = res.voucherCode || res.code || v.code;
          const appliedObj = {
            code: validCode,
            discountAmount: res.discountAmount || 0,
            name: res.voucherName || res.name || v.name || `Voucher ${validCode}`,
          };
          setAppliedVoucher(appliedObj);
          setDiscountCode(validCode);
          setDiscountError("");
          setIsVoucherModalOpen(false);
          toast.success(`Áp dụng mã ${validCode} thành công! Giảm ${formatPrice(res.discountAmount || 0)}`);
        },
        onError: (err) => {
          const msg = err.response?.data?.message || `Mã ${v.code} chưa đủ điều kiện đơn hàng tối thiểu!`;
          toast.error(msg);
        },
      }
    );
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountCode("");
    setDiscountError("");
    toast.info("Đã hủy áp dụng mã giảm giá");
  };

  // Add new address
  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;

    if (isUserLoggedIn) {
      createAddressMutation.mutate(
        {
          receiverName: user?.displayName || "Người nhận",
          receiverPhone: user?.phone || "0900000000",
          addressDetail: newAddressText.trim(),
          isDefault: backendAddresses.length === 0,
        },
        {
          onSuccess: (newAddr) => {
            setSelectedAddress(newAddr.id);
            setNewAddressText("");
            setNewAddressOpen(false);
            toast.success("Thêm địa chỉ giao hàng thành công!");
          },
          onError: (err) => {
            toast.error(err.response?.data?.message || "Thêm địa chỉ thất bại!");
          },
        }
      );
    } else {
      const nextId = String(addresses.length + 1);
      setAddresses((prev) => [
        ...prev,
        { id: nextId, label: newAddressText }
      ]);
      setSelectedAddress(nextId);
      setNewAddressText("");
      setNewAddressOpen(false);
      toast.success("Đã thêm địa chỉ giao hàng!");
    }
  };

  // Checkout handling
  const handleCheckout = () => {
    if (items.length === 0) {
      toast.warn("Giỏ hàng của bạn đang trống!");
      return;
    }

    let receiverName = user?.displayName || "Khách hàng";
    let receiverPhone = user?.phone || "0900000000";
    let shippingAddressDetail = "";

    if (isUserLoggedIn && backendAddresses.length > 0) {
      const chosenAddr = backendAddresses.find((a) => String(a.id) === String(selectedAddress)) || backendAddresses[0];
      receiverName = chosenAddr.receiverName || receiverName;
      receiverPhone = chosenAddr.receiverPhone || receiverPhone;
      shippingAddressDetail = chosenAddr.addressDetail;
    } else {
      const chosenLocal = addresses.find((a) => String(a.id) === String(selectedAddress));
      shippingAddressDetail = chosenLocal ? chosenLocal.label : newAddressText;
    }

    if (!shippingAddressDetail || shippingAddressDetail.trim() === "") {
      toast.warn("Vui lòng chọn hoặc nhập địa chỉ giao hàng!");
      return;
    }

    const paymentMethodPayload = paymentMethod === "cod" ? "COD" : "ONLINE_PAYMENT";

    createOrderMutation.mutate(
      {
        receiverName,
        receiverPhone,
        shippingAddressDetail: shippingAddressDetail.trim(),
        paymentMethod: paymentMethodPayload,
        voucherCode: appliedVoucher?.code || undefined,
      },
      {
        onSuccess: (orderResponse) => {
          if (orderResponse.paymentUrl) {
            // Online PayOS payment link -> redirect
            window.location.href = orderResponse.paymentUrl;
          } else {
            // COD -> Show Success View
            setCreatedOrderData(orderResponse);
            setCheckoutComplete(true);
            toast.success("Đặt hàng thành công!");
          }
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại!");
        },
      }
    );
  };

  if (checkoutComplete) {
    return (
      <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
        <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 md:px-16 py-32 flex flex-col items-center justify-center text-center">
          <div className="bg-neutral-100 p-8 rounded-full mb-8 text-black animate-bounce">
            <FiCheckCircle size={64} className="stroke-[1.5]" />
          </div>
          <h1 className="font-serif text-[36px] md:text-[48px] font-bold mb-4 uppercase">ĐẶT HÀNG THÀNH CÔNG</h1>
          
          {createdOrderData && (
            <div className="bg-[#f5f4f2] p-6 border border-neutral-300 max-w-md w-full mb-8 text-left text-xs space-y-2">
              <p className="font-bold text-sm text-black border-b border-neutral-200 pb-2">
                MÃ ĐƠN HÀNG: #LM-{createdOrderData.orderId}
              </p>
              <p className="text-neutral-700">
                <span className="font-bold text-black">Người nhận:</span> {createdOrderData.receiverName} ({createdOrderData.receiverPhone})
              </p>
              <p className="text-neutral-700">
                <span className="font-bold text-black">Địa chỉ:</span> {createdOrderData.shippingAddressDetail}
              </p>
              <p className="text-neutral-700">
                <span className="font-bold text-black">Thanh toán:</span> {createdOrderData.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Thanh toán trực tuyến PayOS"}
              </p>
              <p className="font-serif text-lg font-bold text-black pt-2 border-t border-neutral-200">
                Tổng tiền: {formatPrice(createdOrderData.totalPrice || total)}
              </p>
            </div>
          )}

          <p className="body-md text-neutral-600 max-w-lg mb-8 leading-relaxed">
            Cảm ơn bạn đã lựa chọn LUMIÈRE. Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ cập nhật trạng thái đơn hàng sớm nhất.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/orders")}
              className="bg-white border border-black text-black px-8 py-4 label-sm tracking-widest font-semibold hover:bg-black hover:text-white transition-all cursor-pointer"
            >
              XEM ĐƠN HÀNG CỦA TÔI
            </button>
            <button
              onClick={() => navigate("/product")}
              className="bg-black text-white px-8 py-4 label-sm tracking-widest font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              TIẾP TỤC MUA SẮM
            </button>
          </div>
        </main>
        <Footer variant="detailed" />
      </div>
    );
  }

  if (!isUserLoggedIn) {
    return (
      <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
        <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 md:px-16 py-32 flex flex-col items-center justify-center text-center">
          <h1 className="font-serif text-[36px] md:text-[48px] font-bold mb-4 uppercase">YÊU CẦU ĐĂNG NHẬP</h1>
          <p className="body-md text-neutral-600 max-w-lg mb-8 leading-relaxed">
            Vui lòng đăng nhập tài khoản của bạn để xem và quản lý giỏ hàng.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-black text-white px-8 py-4.5 label-sm tracking-widest font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            ĐĂNG NHẬP NGAY
          </button>
        </main>
        <Footer variant="detailed" />
      </div>
    );
  }

  if (isCartLoading) {
    return (
      <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
        <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 md:px-16 py-32 flex flex-col items-center justify-center text-center">
          <svg className="animate-spin h-10 w-10 text-black mb-4 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-semibold tracking-wider text-neutral-500">ĐANG TẢI GIỎ HÀNG...</span>
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
                    key={item.cartItemId}
                    className="grid grid-cols-1 md:grid-cols-12 py-8 border-b border-neutral-200/80 items-center gap-6"
                  >
                    {/* Image & Details */}
                    <div className="md:col-span-6 flex items-center gap-6">
                      <div className="w-24 h-32 bg-neutral-100 overflow-hidden flex-shrink-0 select-none">
                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex flex-col items-start text-left">
                        <h3 className="font-serif text-lg md:text-xl font-medium text-black mb-1.5">{item.productName}</h3>
                        <p className="text-neutral-500 text-xs md:text-sm font-light mb-1">Màu: {item.colorName}</p>
                        <p className="text-neutral-500 text-xs md:text-sm font-light">Size: {item.size}</p>
                        
                        <button
                          onClick={() => handleRemoveItem(item.cartItemId)}
                          className="mt-4 text-[10px] text-neutral-400 hover:text-red-600 underline uppercase tracking-widest font-semibold transition-colors cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 md:text-center flex md:block justify-between items-center">
                      <span className="md:hidden text-neutral-400 label-sm text-[10px]">Đơn giá:</span>
                      <p className="body-md text-black">{formatPrice(item.unitPrice)}</p>
                    </div>

                    {/* Quantity Toggles */}
                    <div className="md:col-span-2 flex md:justify-center justify-between items-center select-none">
                      <span className="md:hidden text-neutral-400 label-sm text-[10px]">Số lượng:</span>
                      <div className="flex items-center border border-neutral-300 h-10">
                        <button
                          onClick={() => handleQuantityChange(item.cartItemId, item.quantity, -1)}
                          className="px-3 text-neutral-500 hover:bg-neutral-100 h-full flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="px-4 text-sm font-semibold text-black w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.cartItemId, item.quantity, 1)}
                          className="px-3 text-neutral-500 hover:bg-neutral-100 h-full flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2 md:text-right flex md:block justify-between items-center">
                      <span className="md:hidden text-neutral-400 label-sm text-[10px]">Thành tiền:</span>
                      <p className="body-md font-semibold text-black">{formatPrice(item.totalItemPrice)}</p>
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
                  {appliedVoucher && (
                    <div className="flex justify-between items-center text-sm text-emerald-700 font-medium">
                      <span>Mã giảm giá ({appliedVoucher.code})</span>
                      <span className="font-mono">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="py-6 border-b border-neutral-300">
                  <p className="label-sm text-[10px] uppercase tracking-widest text-neutral-500 mb-3.5">
                    ĐỊA CHỈ GIAO HÀNG
                  </p>
                  
                  {displayAddresses.length > 0 ? (
                    <div className="relative mb-3">
                      <select
                        value={selectedAddress}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="w-full bg-surface-bg border border-neutral-300 focus:ring-black focus:border-black text-sm px-4 py-3.5 pr-10 rounded-none appearance-none cursor-pointer text-black"
                      >
                        {displayAddresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.label.length > 35 ? addr.label.slice(0, 35) + "..." : addr.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                        <FiChevronDown size={18} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 font-medium mb-3 italic">
                      Chưa có địa chỉ giao hàng được chọn.
                    </p>
                  )}

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

                {/* Promo Code & Voucher Picker */}
                <div className="py-6 border-b border-neutral-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="label-sm text-[10px] uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-1.5">
                      <FiTag size={13} className="text-black" /> Mã giảm giá / Voucher
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsVoucherModalOpen(true)}
                      className="text-[11px] font-bold text-black hover:underline tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <FiGift size={13} className="text-amber-600" />
                      <span>Chọn voucher ({publicVouchers.length})</span>
                    </button>
                  </div>

                  {appliedVoucher ? (
                    <div className="bg-emerald-50 border border-emerald-300 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          %
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-black uppercase font-mono tracking-wider">
                              {appliedVoucher.code}
                            </span>
                            <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.5 uppercase">
                              Đã áp dụng
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                            Giảm {formatPrice(appliedVoucher.discountAmount || 0)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveVoucher}
                        className="text-neutral-400 hover:text-red-600 p-1.5 transition-colors cursor-pointer"
                        title="Hủy áp dụng"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã giảm giá..."
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        className="flex-grow bg-white border border-neutral-300 focus:ring-black focus:border-black text-xs px-4 py-3 rounded-none text-black font-mono tracking-wider uppercase"
                      />
                      <button
                        type="submit"
                        disabled={validateVoucherMutation.isPending}
                        className="px-5 bg-black text-white label-sm text-[10px] font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {validateVoucherMutation.isPending ? "ĐANG LỌC..." : "ÁP DỤNG"}
                      </button>
                    </form>
                  )}

                  {discountError && <p className="text-red-600 text-xs mt-1 font-medium">{discountError}</p>}
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
                        Thanh toán trực tuyến (Thẻ nội địa, Visa, Mastercard qua PayOS)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Total Section */}
                <div className="pt-6 pb-8 space-y-2 border-b border-neutral-200">
                  <div className="flex justify-between items-center text-xs text-neutral-600">
                    <span>Tạm tính:</span>
                    <span className="font-mono">{formatPrice(subtotal)}</span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between items-center text-xs text-emerald-700 font-bold">
                      <span>Giảm giá ({appliedVoucher.code}):</span>
                      <span className="font-mono">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-3">
                    <span className="text-sm font-semibold text-black uppercase tracking-wider">Tổng cộng</span>
                    <div className="text-right">
                      <p className="font-serif text-[26px] md:text-[30px] font-bold text-black leading-tight">
                        {formatPrice(total)}
                      </p>
                      <p className="text-[10px] text-neutral-500">Đã bao gồm thuế GTGT</p>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-black text-white py-5 label-sm font-bold tracking-[0.25em] hover:bg-neutral-800 transition-colors mb-4 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>ĐANG XỬ LÝ...</span>
                    </>
                  ) : (
                    "MUA HÀNG"
                  )}
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

      {/* ============================================================ */}
      {/* MODAL: SELECT PUBLIC VOUCHERS */}
      {/* ============================================================ */}
      {isVoucherModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsVoucherModalOpen(false)}
        >
          <div
            className="bg-white max-w-lg w-full p-6 relative shadow-2xl overflow-y-auto max-h-[85vh] flex flex-col border border-neutral-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold uppercase text-black flex items-center gap-2">
                  <FiGift className="text-amber-600" /> Vouchers & Ưu đãi
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Chọn mã giảm giá phù hợp cho đơn hàng của bạn
                </p>
              </div>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="text-neutral-400 hover:text-black p-1.5 transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Vouchers List */}
            <div className="space-y-3">
              {isVouchersLoading ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  Đang tải danh sách voucher khả dụng...
                </div>
              ) : publicVouchers.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400 italic border border-dashed border-neutral-200">
                  Hiện chưa có mã giảm giá công khai nào khả dụng.
                </div>
              ) : (
                publicVouchers.map((v) => {
                  const isEligible = subtotal >= (v.minOrderAmount || 0);
                  const isCurrentApplied = appliedVoucher?.code === v.code;
                  const voucherExpiry = v.endAt || v.expiredAt;

                  return (
                    <div
                      key={v.id || v.code}
                      className={`p-4 border transition-all flex items-center justify-between gap-4 ${
                        isCurrentApplied
                          ? "bg-emerald-50/70 border-emerald-400"
                          : isEligible
                          ? "bg-white border-neutral-200 hover:border-black"
                          : "bg-neutral-50 border-neutral-200 opacity-60"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-black bg-neutral-100 border border-neutral-300 px-2 py-0.5 tracking-wider">
                            {v.code}
                          </span>
                          {isCurrentApplied && (
                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 uppercase">
                              Đã chọn
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-black mt-1.5">
                          {v.name || v.title || (v.discountPercent ? `Giảm ${v.discountPercent}%` : `Giảm ${formatPrice(v.maxDiscountAmount || 0)}`)}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Đơn tối thiểu: <strong className="text-black">{formatPrice(v.minOrderAmount || 0)}</strong>
                        </p>
                        {voucherExpiry && (
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            HSD: {new Date(voucherExpiry).toLocaleDateString("vi-VN")}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleSelectVoucherFromList(v)}
                        disabled={isCurrentApplied}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                          isCurrentApplied
                            ? "bg-emerald-600 text-white cursor-default"
                            : isEligible
                            ? "bg-black text-white hover:bg-neutral-800"
                            : "bg-neutral-200 text-neutral-500"
                        }`}
                      >
                        {isCurrentApplied ? "ĐÃ DÙNG" : "ÁP DỤNG"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

