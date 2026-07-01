import React, { useState } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";

// Curated Unsplash editorial images matching each item description
const IMG_COAT = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop";
const IMG_DRESS = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop";
const IMG_CHARCOAL_PANTS = "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop";
const IMG_BAG = "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop";
const IMG_SHIRT = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop";
const IMG_SWEATER = "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop";
const IMG_BOOTS = "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=600&auto=format&fit=crop";
const IMG_NAVY_COAT = "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600&auto=format&fit=crop";

const Collection = () => {
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

  const filteredProducts = initialProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-[#fbf9f9] min-h-screen w-full flex flex-col font-dmsans text-black pt-28">
      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-16 py-12 flex-grow">
        
        {/* 1. HERO TITLE SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 mb-16 items-start">
          <div className="lg:col-span-7">
            <span className="label-sm text-neutral-500 tracking-[0.25em] text-[10px] md:text-xs font-semibold mb-3 block">
              SẢN PHẨM
            </span>
            <h1 className="font-serif text-[42px] md:text-[54px] font-bold leading-[1.1] uppercase tracking-normal">
              Tất cả sản phẩm
            </h1>
          </div>
          <div className="lg:col-span-5 lg:pt-8">
            <p className="body-md text-neutral-600 font-light leading-relaxed text-sm md:text-base">
              Khám phá toàn bộ danh mục sản phẩm thời trang cao cấp của LUMIÈRE. Những thiết kế tối giản, chất liệu tuyển chọn tinh tế tôn vinh vẻ đẹp trường tồn.
            </p>
          </div>
        </section>

        {/* 2. FILTERS & SEARCH ROW */}
        <section className="border-t border-b border-[#e0e0e0] py-4 flex flex-col md:flex-row justify-between items-center gap-6 mb-12 select-none">
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
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {paginatedProducts.map((product) => (
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

export default Collection;
