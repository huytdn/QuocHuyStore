import React from "react";
import { FiHeart } from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";

const ProductCard = ({
  id,
  image,
  name,
  price,
  slug,
  color,
  averageStar,
  reviewCount,
  isLiked = false,
  onToggleLike,
  onClick,
  layout = "home",
  className = "",
}) => {
  const displayRating =
    averageStar !== undefined && averageStar !== null
      ? Number(averageStar).toFixed(1)
      : null;

  return (
    <div
      onClick={onClick}
      className={`group flex flex-col cursor-pointer select-none ${className}`}
    >
      {/* 2:3 Aspect Ratio Image Container */}
      <div className="w-full aspect-[2/3] overflow-hidden bg-[#f2f0eb] relative">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      {/* Details Section */}
      <div className="mt-4 flex flex-col gap-1 text-left">
        {/* Row 1: Title (Left) + Wishlist Heart Icon (Right) */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-sans text-base md:text-lg text-black font-medium leading-snug line-clamp-1 group-hover:underline underline-offset-4 transition-all">
            {name}
          </h3>

          {onToggleLike && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(e);
              }}
              aria-label={isLiked ? "Bỏ yêu thích" : "Yêu thích sản phẩm"}
              className="p-1 text-neutral-700 hover:text-black transition-colors cursor-pointer shrink-0 mt-0.5"
            >
              {isLiked ? (
                <FaHeart size={18} className="text-red-600 animate-pulse-once" />
              ) : (
                <FiHeart size={18} className="stroke-[1.75]" />
              )}
            </button>
          )}
        </div>

        {/* Color Badge (if provided) */}
        {color && (
          <p className="label-sm text-neutral-400 font-medium tracking-widest text-[10px] uppercase">
            {color}
          </p>
        )}

        {/* Row 2: Price (Left) + Star Rating (Right) */}
        <div className="flex items-center justify-between gap-2 mt-1">
          {/* Price (Left) */}
          <span className="font-sans text-sm md:text-base font-semibold text-neutral-800 tracking-wide">
            {price}
          </span>

          {/* Rating Star Badge (Right) */}
          {displayRating && (
            <div
              className="flex items-center gap-1 text-xs font-bold text-neutral-800 bg-[#FAF6EE] border border-[#EADFCB] px-2 py-0.5 rounded-xs select-none shrink-0"
              title={`Đánh giá trung bình: ${displayRating} sao (${reviewCount || 0} nhận xét)`}
            >
              <FaStar size={12} className="text-[#E6A117]" />
              <span>{displayRating}</span>
              {reviewCount !== undefined && reviewCount > 0 && (
                <span className="text-[10px] text-neutral-400 font-normal ml-0.5">
                  ({reviewCount})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
