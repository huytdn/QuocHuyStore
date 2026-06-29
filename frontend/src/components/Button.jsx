import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  ...props
}) => {
  // Base classes according to label-sm design
  const baseClasses =
    "label-sm transition-all duration-300 font-semibold select-none flex items-center justify-center cursor-pointer outline-none active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  // Stylistic variants
  const variants = {
    primary:
      "bg-black border border-black text-white hover:bg-secondary hover:border-secondary hover:text-white px-8 py-4",
    secondary:
      "bg-transparent border border-black text-black hover:bg-black hover:text-white px-8 py-4",
    white:
      "bg-white border border-white text-black hover:bg-secondary hover:border-secondary hover:text-white px-8 py-4",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
