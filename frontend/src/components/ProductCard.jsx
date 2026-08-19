import React from "react";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

const ProductCard = ({
  id,
  image,
  name,
  price,
  slug,
  color,
  isLiked = false,
  onToggleLike,
  onClick,
  layout = "home",
  className = "",
}) => {
  return (
    <div
      onClick={onClick}
      className={`group flex flex-col cursor-pointer select-none ${className}`}
    >
      {/* 2:3 Aspect Ratio Image Container */}
      <div className="w-full aspect-[2/3] overflow-hidden bg-surface-container relative">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Floating Like / Wishlist Button */}
        {onToggleLike && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(e);
            }}
            aria-label={isLiked ? "Bỏ yêu thích" : "Yêu thích sản phẩm"}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-xs cursor-pointer ${
              isLiked
                ? "bg-white/90 text-red-600 opacity-100 scale-100"
                : "bg-white/70 text-neutral-600 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black hover:scale-110 active:scale-95"
            }`}
          >
            {isLiked ? (
              <FaHeart size={14} className="text-red-600 animate-pulse-once" />
            ) : (
              <FiHeart size={14} />
            )}
          </button>
        )}
      </div>

      {/* Details Row */}
      <div className="mt-4 flex flex-col gap-1">
        {layout === "collection" ? (
          // COLLECTION PAGE LAYOUT
          <>
            <div className="flex justify-between items-start gap-2">
              <h3 className="body-md text-black font-normal leading-snug line-clamp-2">
                {name}
              </h3>
            </div>
            <span className="body-md text-black font-semibold mt-1 block">
              {price}
            </span>
          </>
        ) : (
          // HOME PAGE LAYOUT
          <>
            <div className="flex justify-between items-baseline gap-4">
              <h3 className="body-md text-black font-normal truncate max-w-[70%]">
                {name}
              </h3>
              <span className="label-sm text-black font-semibold flex-shrink-0">
                {price}
              </span>
            </div>
            {color && (
              <p className="label-sm text-outline font-medium tracking-widest text-[10px] uppercase">
                {color}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
