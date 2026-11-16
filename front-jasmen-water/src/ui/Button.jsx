export default function Button({
  children,
  type = "button",
  onClick,
  variation = "colorBrand",
  Font = "text-base font-bold h-[45px]",
  disabled,
}) {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`w-full rounded-md border ${Font} text-bgColor border-colorBrand transition-all ${variation === "secondary" && !disabled
        ? `border-secondary bg-primary text-colorBrand hover:border-colorBrand ${!disabled && "hover:bg-colorBrand hover:text-white"}`
        : `bg-colorBrand ${!disabled && "hover:bg-opacity-[0.8]"}`
        } ${disabled && "cursor-not-allowed border-slate-400 bg-slate-400"}`}
    >
      {children}
    </button>
  );
}


export function DeleteConfirmButton({
  children,
  type = "button",
  onClick,
  variation = "danger",
  Font = "text-base font-bold h-[45px]",
  disabled,
}) {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`w-full rounded-md border ${Font} text-bgColor border-red-500 transition-all ${variation === "danger" && !disabled
        ? `border-red-500 bg-red-500 text-white hover:border-red-500 ${!disabled && "hover:bg-red-500 hover:text-white"}`
        : `bg-red-500 ${!disabled && "hover:bg-opacity-[0.8]"}`
        } ${disabled && "cursor-not-allowed border-slate-400 bg-slate-400"}`}
    >
      {children}
    </button>
  );
}
