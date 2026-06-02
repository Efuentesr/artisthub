const styles = {
  sugerencia:  "bg-brand-500/15 text-brand-300 border-brand-500/20",
  colaboracion:"bg-amber-500/15 text-amber-300 border-amber-500/20",
  cliente:     "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  revisar:     "bg-orange-500/15 text-orange-300 border-orange-500/20",
};

const labels = {
  sugerencia: "Sugerencia",
  colaboracion: "Colaboración",
  cliente: "Cliente",
  revisar: "Revisar",
};

export default function TagBadge({ tag }) {
  if (!tag) return null;
  const style = styles[tag] || "bg-white/10 text-white/40";
  return (
    <span className={`inline-flex items-center rounded-full border text-[10px] px-2 py-0.5 font-medium ${style}`}>
      {labels[tag] || tag}
    </span>
  );
}
