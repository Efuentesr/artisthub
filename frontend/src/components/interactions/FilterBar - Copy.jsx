import useInteractionsStore from "../../store/interactionsStore";

const PLATFORMS = [
  { value: "", label: "Todas" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
];

const TAGS = [
  { value: "", label: "Todo" },
  { value: "sugerencia", label: "Sugerencia" },
  { value: "colaboracion", label: "Colaboración" },
  { value: "cliente", label: "Cliente" },
  { value: "revisar", label: "Revisar" },
  { value: "pendiente_status", label: "Pendiente" },
];

export default function FilterBar() {
  const { filters, setFilter, fetchInteractions } = useInteractionsStore();

  const apply = (key, value) => {
    // pendiente_status es un caso especial: filtra por status no por tag
    if (key === "tag" && value === "pendiente_status") {
      setFilter("tag", "");
      setFilter("status", "pendiente");
    } else if (key === "tag") {
      setFilter("status", "");
      setFilter("tag", value);
    } else {
      setFilter(key, value);
    }
    setTimeout(fetchInteractions, 0);
  };

  const activeTag = filters.status === "pendiente" ? "pendiente_status" : filters.tag;

  return (
    <div className="space-y-2">
      {/* Búsqueda */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="search"
          placeholder="Buscar por usuario, contenido, nota…"
          value={filters.search}
          onChange={(e) => {
            setFilter("search", e.target.value);
            setTimeout(fetchInteractions, 300);
          }}
          className="w-full bg-surface-1 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-500 transition-all"
        />
      </div>

      {/* Plataformas */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PLATFORMS.map((p) => (
          <button
            key={p.value}
            onClick={() => apply("platform", p.value)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs border transition-all ${
              filters.platform === p.value
                ? "bg-brand-500/20 border-brand-400/40 text-brand-300"
                : "border-white/10 text-white/40 hover:text-white/60"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Tags / estado */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TAGS.map((t) => (
          <button
            key={t.value}
            onClick={() => apply("tag", t.value)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs border transition-all ${
              activeTag === t.value
                ? "bg-brand-500/20 border-brand-400/40 text-brand-300"
                : "border-white/10 text-white/40 hover:text-white/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
