import React from "react";

const ProductCard = ({
  id,
  image,
  name,
  price,
  slug,
  color,
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
