export default function Input({ label, error, icon: Icon, rightElement, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-white/70">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
          />
        )}
        <input
          className={`
            w-full rounded-xl border bg-surface-2 px-4 py-3 text-sm text-white
            placeholder:text-white/25 outline-none transition-all
            ${Icon ? "pl-10" : ""}
            ${rightElement ? "pr-11" : ""}
            ${error
              ? "border-red-500/60 focus:border-red-400"
              : "border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            }
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
