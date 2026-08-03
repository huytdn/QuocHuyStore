import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { useProducts } from "../hooks/api/useProducts";

// Curated Unsplash editorial images matching each item description
const IMG_COAT = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop";
const IMG_DRESS = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop";
const IMG_CHARCOAL_PANTS = "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop";
const IMG_BAG = "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop";
const IMG_SHIRT = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop";
const IMG_SWEATER = "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop";
const IMG_BOOTS = "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=600&auto=format&fit=crop";
const IMG_NAVY_COAT = "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600&auto=format&fit=crop";

const Product = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [wishlist, setWishlist] = useState({});

  // 24 product items matching design exactly
  const initialProducts = [
    {
      id: "1",
      name: "Áo Khoác Cashmere Oversized",
      price: "12.500.000 VND",
      image: IMG_COAT,
    },
    {
      id: "2",
      name: "Đầm Lụa Slip Dress Đen",
      price: "8.000.000 VND",
      image: IMG_DRESS,
    },
    {
      id: "3",
      name: "Quần Tây Ống Rộng Charcoal",
      price: "4.200.000 VND",
      image: IMG_CHARCOAL_PANTS,
    },
    {
      id: "4",
      name: "Túi Cầm Tay Da Thuần",
      price: "15.800.000 VND",
      image: IMG_BAG,
    },
    {
      id: "5",
      name: "Áo Sơ Mi Poplin Cấu Trúc",
      price: "3.800.000 VND",
      image: IMG_SHIRT,
    },
    {
      id: "6",
      name: "Áo Len Dệt Ribbed Oatmeal",
      price: "5.600.000 VND",
      image: IMG_SWEATER,
    },
    {
      id: "7",
      name: "Giày Chelsea Leather Đen",
      price: "7.200.000 VND",
      image: IMG_BOOTS,
    },
    {
      id: "8",
      name: "Áo Khoác Wool Tailored Navy",
      price: "14.000.000 VND",
      image: IMG_NAVY_COAT,
    },
    {
      id: "9",
      name: "Áo Khoác Cashmere Dáng Lửng",
      price: "11.500.000 VND",
      image: IMG_COAT,
    },
    {
      id: "10",
      name: "Đầm Lụa Slip Dress Trắng",
      price: "8.500.000 VND",
      image: IMG_DRESS,
    },
    {
      id: "11",
      name: "Quần Tây Xếp Ly Charcoal",
      price: "4.500.000 VND",
      image: IMG_CHARCOAL_PANTS,
    },
    {
      id: "12",
      name: "Túi Xách Da Khâu Tay",
      price: "16.500.000 VND",
      image: IMG_BAG,
    },
    {
      id: "13",
      name: "Áo Sơ Mi Poplin Classic",
      price: "3.200.000 VND",
      image: IMG_SHIRT,
    },
    {
      id: "14",
      name: "Áo Len Dệt Oatmeal Cổ Lọ",
      price: "5.900.000 VND",
      image: IMG_SWEATER,
    },
    {
      id: "15",
      name: "Giày Chelsea Leather Nâu Da Bò",
      price: "7.800.000 VND",
      image: IMG_BOOTS,
    },
    {
      id: "16",
      name: "Áo Khoác Wool Dáng Dài Navy",
      price: "15.000.000 VND",
      image: IMG_NAVY_COAT,
    },
    {
      id: "17",
      name: "Áo Khoác Cashmere Cổ Điển",
      price: "13.200.000 VND",
      image: IMG_COAT,
    },
    {
      id: "18",
      name: "Đầm Lụa Dáng Dài Cổ V",
      price: "9.000.000 VND",
      image: IMG_DRESS,
    },
    {
      id: "19",
      name: "Quần Tây Ống Đứng Charcoal",
      price: "3.900.000 VND",
      image: IMG_CHARCOAL_PANTS,
    },
    {
      id: "20",
      name: "Túi Đeo Vai Da Cao Cấp",
      price: "14.500.000 VND",
      image: IMG_BAG,
    },
    {
      id: "21",
      name: "Áo Sơ Mi Lụa Mịn Màng",
      price: "4.200.000 VND",
      image: IMG_SHIRT,
    },
    {
      id: "22",
      name: "Áo Len Cổ V Màu Oatmeal",
      price: "5.200.000 VND",
      image: IMG_SWEATER,
    },
    {
      id: "23",
      name: "Bốt Chelsea Da Bóng",
      price: "8.200.000 VND",
      image: IMG_BOOTS,
    },
    {
      id: "24",
      name: "Áo Măng Tô Wool Cao Cấp",
      price: "16.000.000 VND",
      image: IMG_NAVY_COAT,
    },
  ];

  const handleWishlistToggle = (id, isWishlisted) => {
    setWishlist((prev) => ({
      ...prev,
      [id]: isWishlisted,
    }));
  };

  const { data: pageData, isLoading: isProductsLoading } = useProducts({
    page: activePage - 1,
    size: 12,
    search: searchQuery || undefined,
  });

  const backendProducts = pageData?.content || [];
  const totalPages = pageData ? pageData.totalPages : Math.ceil(initialProducts.length / 12);

  const displayProducts = backendProducts.length > 0
    ? backendProducts.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.minPrice ? (p.minPrice.toLocaleString("vi-VN") + "đ") : "Liên hệ",
        image: p.thumbnailUrl
      }))
    : initialProducts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice((activePage - 1) * 12, activePage * 12).map(p => ({
        ...p,
        slug: p.id
      }));

  return (
    <div className="bg-[#fbf9f9] min-h-screen w-full flex flex-col font-dmsans text-black pt-20">
      <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10 py-8 flex-grow">
        
        {/* 1. HERO TITLE SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 mb-10 items-start">
          <div className="lg:col-span-7">
            <span className="label-sm text-neutral-500 tracking-[0.25em] text-[10px] md:text-xs font-semibold mb-2 block">
              SẢN PHẨM
            </span>
            <h1 className="font-serif text-[30px] md:text-[38px] font-bold leading-[1.1] uppercase tracking-normal">
              Tất cả sản phẩm
            </h1>
          </div>
          <div className="lg:col-span-5 lg:pt-4">
            <p className="body-md text-neutral-600 font-light leading-relaxed text-xs md:text-sm">
              Khám phá toàn bộ danh mục sản phẩm thời trang cao cấp của LUMIÈRE. Những thiết kế tối giản, chất liệu tuyển chọn tinh tế tôn vinh vẻ đẹp trường tồn.
            </p>
          </div>
        </section>

        {/* 2. FILTERS & SEARCH ROW */}
        <section className="border-t border-b border-[#e0e0e0] py-3 flex flex-col md:flex-row justify-between items-center gap-4 mb-8 select-none">
          {/* Left dropdown filters */}
          <div className="flex flex-wrap items-center gap-6 lg:gap-10 w-full md:w-auto">
            <button className="flex items-center gap-2 label-sm text-[11px] font-semibold text-black tracking-widest hover:text-secondary transition-colors cursor-pointer">
              DANH MỤC
              <FiChevronDown size={14} />
            </button>
            <button className="flex items-center gap-2 label-sm text-[11px] font-semibold text-black tracking-widest hover:text-secondary transition-colors cursor-pointer">
              KÍCH CỠ
              <FiChevronDown size={14} />
            </button>
            <button className="flex items-center gap-2 label-sm text-[11px] font-semibold text-black tracking-widest hover:text-secondary transition-colors cursor-pointer">
              MÀU SẮC
              <FiChevronDown size={14} />
            </button>
            <button className="flex items-center gap-2 label-sm text-[11px] font-semibold text-black tracking-widest hover:text-secondary transition-colors cursor-pointer">
              GIÁ
              <FiChevronDown size={14} />
            </button>
          </div>

          {/* Right search input & sort */}
          <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex items-center border-b border-neutral-300 pb-1 w-full sm:w-[220px]">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActivePage(1);
                }}
                className="w-full bg-transparent outline-none font-dmsans text-xs placeholder-neutral-400 text-black pr-6"
              />
              <FiSearch size={14} className="absolute right-0 text-neutral-500 pointer-events-none" />
            </div>

            {/* Sắp xếp */}
            <button className="flex items-center gap-2 label-sm text-[11px] font-semibold text-black tracking-widest hover:text-secondary transition-colors whitespace-nowrap cursor-pointer">
              SẮP XẾP
              <FiChevronDown size={14} />
            </button>
          </div>
        </section>

        {/* 3. PRODUCT GRID */}
        <section className="mb-16">
          {isProductsLoading && backendProducts.length === 0 ? (
            <div className="text-center py-20">
              <svg className="animate-spin h-8 w-8 text-black mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-neutral-500 font-light text-sm">Đang tải danh sách sản phẩm...</p>
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  layout="collection"
                  showWishlist={true}
                  isWishlisted={!!wishlist[product.id]}
                  onWishlistToggle={(isWish) => handleWishlistToggle(product.id, isWish)}
                  onClick={() => navigate(`/product/${product.slug}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-neutral-500 font-light">
              Không tìm thấy sản phẩm phù hợp. Vui lòng tìm kiếm lại.
            </div>
          )}
        </section>

        {/* 4. PAGINATION */}
        <section className="flex flex-col items-center gap-8 py-4 select-none">
          <div className="flex items-center gap-4 mt-2">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNum = index + 1;
              const pageStr = String(pageNum).padStart(2, "0");
              const isActive = activePage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setActivePage(pageNum)}
                  className={`label-sm text-xs tracking-wider cursor-pointer ${
                    isActive
                      ? "text-black border-b border-black pb-0.5 font-bold"
                      : "text-neutral-500 hover:text-black pb-0.5"
                  }`}
                >
                  {pageStr}
                </button>
              );
            })}
          </div>
        </section>

      </div>

      {/* 5. COLLECTION FOOTER */}
      <Footer variant="collection" />
    </div>
  );
};

export default Product;
