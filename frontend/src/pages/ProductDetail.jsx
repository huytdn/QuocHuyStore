import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiChevronRight, FiChevronDown, FiZoomIn, FiX, FiArrowRight, FiHeart } from "react-icons/fi";
import Footer from "../components/Footer";

// Full images assets matching the editorial premium vibe
const IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBAVfwZZC3wbQRfoNbBX29JVOMCprvpdf-UsTJfGfddV4Y6oIYi-ySNQ_5Vu9CXxHtJcjW8q4iiKC1DOxre6TeFETWFnHcskTZEuDZ_vkQ6z7Hp-jEiPRv54gnHC1wDWSeSTolJj2OcBIZ699r_4JqNXKenYSM3douDrhl7f_43cmlMqnTS2x8bfkDgjsbmukI8hyAJ-IckYR2OrSsW8l66whbp-gn5w69xQSJFGNXK2Eb0I8VBPpV3HYEgKV3IeaP-jVO0bpXbxiY", // Model edit
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCJ-a8_FrRzM1_7YPcmTsOD5Gr9caPcos8_KSHUjDyIrzRwc0qkFSnh_4qnJb6DzQHV3UyNk-_LjziJCXRlct5GuDo1VtLqVl-zBLKpHxmsG5NyPxZ2G5-Cbzu1BORDkC1pcybAb_Xg1xFv-ZkTsDy8aG3mwwQK3l3hxBr_HHFxeK-lv9Op_sO806NNdblrBCeQX5c0bfqBlZdxMgsbRl6OCgkXy_i_pPwN7p6Cn3tGMPgBxqyy_m1ozzF4vWPVUlapVhiUHCntFo8", // Texture detail
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBIfjAyveRzDoQou89oPEoZHdSPyEXxSrZ2GtxP9FTzT6Bs3_pjIA-fiHIkb_Ihd0xsyuomcuvW9PVem6TdkmpfJheoEN0J5YMzqxTwAJ7g9l6X3nYD-UScQUgnecn7OeSb_t7dA5Y6TgdLgcU-9d2DjAcBABEz_ePEq8n-p6rlIz940lxNhgqN4oJbWcyeGoOK3bAM498aV1LU4_4bgxAKR3qma1l04VA4WZjatADpHALVE2c_Sro6te6VYdCVQzV6twPTEMi8GTI", // Mannequin view
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAEjHQyYJiD0ub0XzDT_FH_og6U4Pe2xPkUzuXs4qDkBctcZmMW3whTr_ICXrtbrDQ8fmCtUbbaeApqSGq40dHpzysaXoPtxY0_5p2oAL8eZTqtHPGY880kLQOgTtZw6DYnZnEoCJ3erFaxDr3dGQe-NgXq8WG93KigLLUGduvFwDjW6kXX7VBlroHi4NO-fsCHUf864aNrJCBQ96QVT3q6Xt2VRO7PR3mAG-dEyeOX0Hw2cKwJ7F3hSaWRu0or9WRufAJYqb2cNto", // Cuff detail
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBr4HWrFhVeBTmZuophqkP1mbEw70HY8aYotHtxD92GhdziA-ck3nG5SiXXx4Lh5pbAmMgeBwURrasY-Jk-J7k-O8UOgYb8RPshoznDpwShmXlX1bpWbH11u2CsoTHXU2MI3PO63NGONoRAWAAbdnF46Ad04LyhomoysMtlDk5ZsnBrP9dmfY1tZ0900R3p4WI0fZaX5s2QzZM9Tk7MK0f2VqalQwRzL-Gsd6xd8ZQpBMfXo5t0745IgGLQLx9leJZdYImh6T_KqCQ" // Back view
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const [activeImage, setActiveImage] = useState(IMAGES[0]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [isZoomed, setIsZoomed] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [careOpen, setCareOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const sizes = ["S", "M", "L", "XL"];

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    alert(`Đã thêm sản phẩm Silk Blazer (Kích thước: ${selectedSize}) vào giỏ hàng và chuyển hướng tới thanh toán.`);
  };

  // Reusable style items
  const styleWithItems = [
    {
      id: "pants",
      name: "Silk Tailored Trousers",
      price: "2.200.000₫",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwBZTMGybELG9ALyIXiKUOPJdettCyClMPekdbvxpcO1Jfc3kdZGRsWkfR4AQpyMxfVb7bfsY4dRanDjH-5X1IwQS2loRJSnN0BI422hfBZzzXCUtriBcQCkWCAxN081LTgMg7cyIiuJQIBdtiEOan1CWOCRfjQlH419I1voKxPzHLJ3AB15dTHCHbWuwh1lkeFeXIxInyCd3L8th-zEs5TMUBqraL2WMSPdZYhUtX1JEnIbiYgHlIpRmWWlJjL1Vj6P9RXhtu3L4"
    },
    {
      id: "heels",
      name: "Pointed Leather Heels",
      price: "3.500.000₫",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlMQQz0uDvTZQ0gDBFlLk9x4TBLG1XUjG4Vjqf10rlUwwV0mnlcMDfH1qumyKCxTJKAS78EpF3SDYUEI1T8MkWRRRfDT_QQSV9AK80o-OLFKRCbMOokgMVDihOBJebxUuSqcWJ6hjPcYrScIoIajxVg6F5pGbFFtZHPgm9rjdNCHp-hsYlIGYn0dY2LwUpWqTQlHLiczub4StNJIQXwD6sBQytYWwKec_x3f3SlTej5C-cAUZ-qE3Z_5injsjfM-d3QZ3gNwzkycs"
    },
    {
      id: "choker",
      name: "Geometric Silver Choker",
      price: "1.800.000₫",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGcyKGa-EPwXbeWteo1B3lGDRhdVFFXFaqWSZiR1NVv9C31VYGwRl7iC57BO-rQk-n50m80EFD0O_dMCnFArMi7S5rU0TChQ2kpUg47PoYYC0BiD05gmqeH5hfui5IzWPwWTJkz94oJI8lw3P8if5vbPJgU5OA2nqYQUIYnUiH6HzThVYtfJtFw9NP9KXbJsy2SJHvxd8o__sfHrdBietz7s3MRJOzLTU0iW_yRZ4nMqiIu1_EM2jFqG1IUYWgZXJmtrirREn9lRs"
    }
  ];

  // Related products
  const relatedProducts = [
    {
      id: "wool-blazer",
      name: "Oversized Wool Blazer - Sand",
      price: "4.200.000₫",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAL7SMDf3dZef4MbN54e4kwuIeN0XaAIALwjSETYwXtlZL1KgR_bop7sdvi-gbZ7XyK9kfIcRwqr9QqHu3Kwnrv11OmiYfHk6w3R13dYM6yp7xl-LwDbZ5jzwqyTo96Pz3T3BIVp23P-VB5zbpcETGRttKdcZPZAklUO1pV0BmlS86l7_xhEItJiE5DX7IgYfFd9Fegt21JmGa0K9Hv21oWRkklzoiwCQ5PnOsZ9Ih8ge_qd3cf9Pia4p1ermHwn6DRahIw5PsyJkc"
    },
    {
      id: "navy-blazer",
      name: "Double-Breasted Navy Blazer",
      price: "4.800.000₫",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5TaOvSm8W3M8qg4J8qgNZ4dFxUB8uO3wiSnIxiG5Q_d23pnMqB5XrEwX0ba1hNnHMtMLjXFt2JOXw1UfxnALeRxPRvB0FZ5Pl7rzurGBaezb79YR8qCCpvkUmJxcHc3vdWd9FnwWnswjAdwctbxh9YCwujtgyfKFOBbsvrfYHVB6dA32CMTs_td1Zjdbj2nlObS3IJzNiwIegQIPxAbHOyYm1Yt09ZcN35F_1SfYndrTVVC9Og2bJcoFsF9vn9fnejSGPHpmPagQ"
    },
    {
      id: "silk-vest",
      name: "Tailored Silk Vest - Charcoal",
      price: "2.400.000₫",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxj_CS8-asC_iMiHCaiqzzFMgFOhUCVIsy7T73UJztydHD8-fsJ39loMOFklQOGnafdltE_qEL3b1CCikaS5uSly2Zhu-4a9R96tOOGI3y2CsV3U1iWOT--lFMDr2MlqfKJHZg4o2iRnIBD0IM2i9pxumX61byDrfuWiVyB2fKkoQu-VLhPglUzeb2eMLTpRj3_GAuRxztXuY65cYlHCjWfsMI0WTOHGmTUh7ly83J4k8zFH3GqVYVq3yKXWZ_eLP-cFj7O9EQlg0"
    },
    {
      id: "structured-blazer",
      name: "Structured Silk Blazer - Ivory",
      price: "4.500.000₫",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDQIu_TBMdEFb2V5qPyZWSYg7FxEzUDGiWL_0N94CEbu0MTI7tvWSnJurF2MtPQN6Txb1FjAcQbGCTjdfjNWcmmlYlAX8SaIWdTznWpe3NHBHOFdgjgwuOV0v3_a1lB34inaBg5PUWm2GomDaa6MHrq5crN332YQ3jgkGqAYVQ6c5xF-tP1OgHe3iGTAXhamk4rzH36pbjSayYEgxCFe5ta7b7nN-JUT8RvQx2d8jKczSf80y65aX7QxHhMPNx3D-buLhETCJlcWU"
    }
  ];

  return (
    <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
      {/* Main Container */}
      <main className="pt-32 pb-24 max-w-[1440px] mx-auto w-full px-6 md:px-16 flex-grow">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-12 label-sm text-[10px] text-neutral-500 tracking-widest select-none">
          <Link to="/" className="hover:text-black transition-colors">Trang chủ</Link>
          <FiChevronRight size={12} className="text-neutral-400" />
          <Link to="/product" className="hover:text-black transition-colors">Áo khoác</Link>
          <FiChevronRight size={12} className="text-neutral-400" />
          <span className="text-black font-semibold">Silk Blazer - Midnight Black</span>
        </nav>

        {/* Product Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Gallery Column */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Main Product Image */}
            <div className="w-full aspect-[2/3] overflow-hidden bg-[#efeded] relative group select-none">
              <img
                src={activeImage}
                alt="Silk Blazer Midnight Black Editorial"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                <button
                  onClick={() => setIsZoomed(true)}
                  className="bg-white/70 hover:bg-white text-black p-3.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                  aria-label="Zoom Image"
                >
                  <FiZoomIn size={18} />
                </button>
              </div>
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-5 gap-3 mt-4 select-none">
              {IMAGES.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-[2/3] overflow-hidden bg-[#efeded] cursor-pointer border transition-all duration-300 ${
                    activeImage === img
                      ? "border-black scale-[0.98] shadow-sm"
                      : "border-transparent opacity-80 hover:opacity-100 hover:scale-[1.02]"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Product Details Column */}
          <div className="lg:col-span-5 flex flex-col gap-8 lg:pl-6">
            
            {/* Title & Price */}
            <div className="flex flex-col gap-3">
              <h1 className="font-serif text-[36px] md:text-[44px] leading-tight font-medium tracking-normal text-black">
                Silk Blazer - Midnight Black
              </h1>
              <p className="font-serif text-xl md:text-2xl text-black font-medium tracking-wide">
                4.500.000₫
              </p>
            </div>

            {/* Description */}
            <p className="body-md text-neutral-600 leading-relaxed text-sm md:text-base">
              Một thiết kế biểu tượng của LUMIÈRE, chiếc áo blazer này được chế tác từ lụa tơ tằm cao cấp với sắc đen Midnight sâu thẳm. Đường cắt may tinh xảo tạo nên phom dáng kiến trúc, mang lại vẻ đẹp quyền lực nhưng vẫn vô cùng mềm mại.
            </p>

            {/* Size Selector */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <span className="label-sm text-xs font-bold text-black tracking-widest">Kích thước</span>
                <button className="label-sm text-[10px] text-neutral-500 underline underline-offset-4 hover:text-black transition-colors">
                  Bảng size
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-3 select-none">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 border transition-all duration-300 font-sans font-semibold text-xs tracking-wider flex items-center justify-center cursor-pointer ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 hover:border-black text-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Button */}
            <div className="flex flex-col gap-3.5 mt-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white h-14 label-sm font-semibold tracking-[0.2em] hover:bg-neutral-800 transition-all duration-300 active:scale-[0.99] cursor-pointer flex items-center justify-center"
              >
                {addedToCart ? "Đã thêm vào giỏ hàng!" : "Thêm vào giỏ hàng"}
              </button>
              
              <button
                onClick={handleBuyNow}
                className="w-full border border-black text-black bg-transparent h-14 label-sm font-semibold tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 active:scale-[0.99] cursor-pointer"
              >
                Mua ngay
              </button>
            </div>

            {/* Product Details Accordion */}
            <div className="border-t border-neutral-200 pt-6 mt-4">
              {/* Tab 1: Chi tiết sản phẩm */}
              <div className="border-b border-neutral-200/60 pb-4">
                <button
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="w-full flex justify-between items-center cursor-pointer font-sans text-xs uppercase tracking-widest font-bold text-black py-2 hover:text-neutral-600 transition-colors"
                >
                  <span>Chi tiết sản phẩm</span>
                  <span className={`transform transition-transform duration-350 ${detailsOpen ? 'rotate-180' : ''}`}>
                    <FiChevronDown size={18} />
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-350 ease-in-out ${
                    detailsOpen ? 'max-h-60 mt-4 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="font-sans text-sm text-neutral-600 flex flex-col gap-2 pb-2">
                    <div className="flex justify-between border-b border-neutral-100 py-2">
                      <span className="font-medium text-black">Chất liệu</span>
                      <span>100% Lụa tơ tằm tự nhiên</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 py-2">
                      <span className="font-medium text-black">Lớp lót</span>
                      <span>Viscose lụa mềm mại</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 py-2">
                      <span className="font-medium text-black">Sản xuất</span>
                      <span>Thủ công tại Việt Nam</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab 2: Hướng dẫn bảo quản */}
              <div className="border-b border-neutral-200/60 py-4">
                <button
                  onClick={() => setCareOpen(!careOpen)}
                  className="w-full flex justify-between items-center cursor-pointer font-sans text-xs uppercase tracking-widest font-bold text-black py-2 hover:text-neutral-600 transition-colors"
                >
                  <span>Hướng dẫn bảo quản</span>
                  <span className={`transform transition-transform duration-350 ${careOpen ? 'rotate-180' : ''}`}>
                    <FiChevronDown size={18} />
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-350 ease-in-out ${
                    careOpen ? 'max-h-60 mt-4 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="font-sans text-sm text-neutral-600 flex flex-col gap-2.5 pb-2 leading-relaxed">
                    <p>• Chỉ giặt khô chuyên nghiệp</p>
                    <p>• Không sử dụng hóa chất tẩy</p>
                    <p>• Ủi nhẹ ở nhiệt độ thấp nếu cần thiết</p>
                    <p>• Bảo quản trong túi treo vải chống bụi</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Style With Section */}
        <section className="mt-32 border-t border-neutral-200 pt-16">
          <h2 className="font-serif text-[28px] md:text-[34px] font-medium tracking-normal text-center mb-16 text-black uppercase">
            Style With
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {styleWithItems.map((item) => (
              <div key={item.id} className="group cursor-pointer flex flex-col">
                <div className="aspect-[2/3] overflow-hidden bg-[#efeded] mb-6 relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Xem nhanh ${item.name}`);
                      }}
                      className="bg-white text-black text-[10px] font-bold tracking-widest uppercase px-5 py-3 hover:bg-black hover:text-white transition-colors duration-300"
                    >
                      Xem nhanh
                    </button>
                  </div>
                </div>
                <h3 className="body-md text-black font-normal">{item.name}</h3>
                <p className="label-sm text-neutral-500 font-semibold mt-1.5">{item.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Products Section */}
        <section className="mt-32 border-t border-neutral-200 pt-16">
          <div className="flex justify-between items-end mb-16">
            <h2 className="font-serif text-[28px] md:text-[34px] font-medium tracking-normal text-black uppercase">
              Sản phẩm liên quan
            </h2>
            <Link
              to="/product"
              className="label-sm text-xs font-semibold text-neutral-500 hover:text-black underline underline-offset-8 transition-colors select-none"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="group cursor-pointer flex flex-col"
              >
                <div className="aspect-[2/3] overflow-hidden bg-[#efeded] mb-5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <h3 className="body-md text-black font-normal truncate pr-4">{product.name}</h3>
                <p className="label-sm text-neutral-500 font-semibold mt-1.5">{product.price}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer variant="detailed" />

      {/* Image Fullscreen Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 text-white hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer p-2"
            aria-label="Close Zoom"
          >
            <FiX size={32} />
          </button>
          <img
            src={activeImage}
            alt="Zoomed detail"
            className="max-w-full max-h-[92vh] object-contain select-none shadow-2xl transition-transform duration-300"
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
