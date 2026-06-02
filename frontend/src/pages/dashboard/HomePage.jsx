import { useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useInteractionsStore from "../../store/interactionsStore";

const platformColor = {
  instagram: "text-rose-300",
  tiktok: "text-emerald-300",
  facebook: "text-blue-300",
};

export default function HomePage() {
  const { user } = useAuthStore();
  const { interactions, fetchInteractions, fetchSocialAccounts, socialAccounts } = useInteractionsStore();

  useEffect(() => {
    fetchInteractions();
    fetchSocialAccounts();
  }, []);

  const pending = interactions.filter((i) => i.note?.status === "pendiente").length;
  const total = interactions.length;
  const recent = interactions.slice(0, 3);

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <div className="px-4 pt-14 pb-6">
        <p className="text-white/40 text-sm">Bienvenido de vuelta</p>
        <h1 className="font-display text-2xl font-bold text-white mt-0.5">
          {user?.artistic_name || user?.email?.split("@")[0]}
        </h1>
        {user?.genre && (
          <span className="text-xs text-brand-400 font-medium">{user.genre}</span>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface-1 border border-white/8 rounded-2xl p-4">
          <p className="text-white/40 text-xs mb-1">Total</p>
          <p className="font-display text-3xl font-bold text-white">{total}</p>
          <p className="text-white/30 text-xs mt-1">interacciones</p>
        </div>
        <div className="bg-surface-1 border border-amber-400/20 rounded-2xl p-4">
          <p className="text-amber-400/60 text-xs mb-1">Pendientes</p>
          <p className="font-display text-3xl font-bold text-amber-300">{pending}</p>
          <p className="text-white/30 text-xs mt-1">por revisar</p>
        </div>
      </div>

      {/* Cuentas conectadas */}
      {socialAccounts.length > 0 && (
        <div className="px-4 mb-6">
          <p className="text-xs font-medium text-white/40 mb-3">Cuentas conectadas</p>
          <div className="flex flex-wrap gap-2">
            {socialAccounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center gap-2 bg-surface-1 border border-white/8 rounded-full px-3 py-1.5"
              >
                <span className={`text-xs font-medium ${platformColor[acc.platform] || "text-white/50"}`}>
                  {acc.platform_display}
                </span>
                <span className="text-white/40 text-xs">{acc.handle}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recientes */}
      {recent.length > 0 && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-white/40">Recientes</p>
            <Link to="/interactions" className="text-xs text-brand-400">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map((i) => (
              <Link
                key={i.id}
                to="/interactions"
                className="flex items-start gap-3 bg-surface-1 border border-white/8 rounded-2xl p-3 active:scale-[0.99] transition-transform"
              >
                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-300 font-bold text-xs flex-shrink-0">
                  {i.from_username?.[1]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/60 font-medium">@{i.from_username}</p>
                  <p className="text-sm text-white/70 truncate mt-0.5">{i.content}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {interactions.length === 0 && (
        <div className="px-4 text-center py-8">
          <p className="text-white/30 text-sm">
            Empieza agregando tu primera interacción en{" "}
            <Link to="/interactions" className="text-brand-400">Interacciones</Link>
          </p>
        </div>
      )}
    </div>
  );
}
