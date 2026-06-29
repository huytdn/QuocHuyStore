import React from "react";

const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  rightElement = null,
  error = "",
  className = "",
  ...props
}) => {
  return (
    <div className={`w-full flex flex-col ${className}`}>
      {label && (
        <div className="flex justify-between items-baseline mb-2">
          <label className="label-sm text-black select-none">
            {label}
          </label>
          {rightElement}
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full border-b border-black py-3 outline-none bg-transparent font-dmsans text-base placeholder-neutral-400 transition-colors focus:border-secondary text-black"
        {...props}
      />
      {error && <span className="text-xs text-red-600 mt-1 font-semibold">{error}</span>}
    </div>
  );
};

export default Input;
