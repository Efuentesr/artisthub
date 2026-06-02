export default function Alert({ type = "error", message }) {
  if (!message) return null;

  const styles = {
    error: "bg-red-500/10 border-red-500/30 text-red-300",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    info: "bg-brand-500/10 border-brand-500/30 text-brand-300",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}
