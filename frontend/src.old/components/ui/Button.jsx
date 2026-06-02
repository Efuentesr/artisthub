export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/40",
    ghost:
      "bg-transparent border border-white/10 hover:border-white/20 hover:bg-white/5 text-white/70 hover:text-white",
    danger:
      "bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400",
  };

  return (
    <button
      className={`
        relative flex items-center justify-center gap-2 rounded-xl px-5 py-3
        text-sm font-medium transition-all duration-150 disabled:opacity-50
        disabled:cursor-not-allowed cursor-pointer
        ${variants[variant]} ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Cargando...
        </span>
      ) : children}
    </button>
  );
}
