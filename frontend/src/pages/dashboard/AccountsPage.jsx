import { useEffect, useState } from "react";
import useInteractionsStore from "../../store/interactionsStore";
import { interactionsApi } from "../../api/interactions";
import Button from "../../components/ui/Button";

const PLATFORMS = ["instagram", "tiktok", "facebook"];

const platformColor = {
  instagram: "bg-rose-500/15 border-rose-500/20 text-rose-300",
  tiktok:    "bg-emerald-500/15 border-emerald-500/20 text-emerald-300",
  facebook:  "bg-blue-500/15 border-blue-500/20 text-blue-300",
};

export default function AccountsPage() {
  const { socialAccounts, fetchSocialAccounts } = useInteractionsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ platform: "instagram", handle: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { fetchSocialAccounts(); }, []);

  const handleAdd = async () => {
    if (!form.handle.trim()) { setError("El handle es obligatorio"); return; }
    setIsSaving(true);
    try {
      await interactionsApi.createSocialAccount(form);
      await fetchSocialAccounts();
      setForm({ platform: "instagram", handle: "" });
      setShowAdd(false);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.handle?.[0] || "Error al guardar");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta cuenta?")) return;
    await interactionsApi.deleteSocialAccount(id);
    fetchSocialAccounts();
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-white/8 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-white">Cuentas sociales</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-900/40 active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {socialAccounts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm">Aún no tienes cuentas registradas.</p>
            <p className="text-white/20 text-xs mt-1">Toca el + para agregar una.</p>
          </div>
        )}
        {socialAccounts.map((acc) => (
          <div key={acc.id} className="bg-surface-1 border border-white/8 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className={`inline-flex items-center rounded-full border text-xs px-2.5 py-1 font-medium mb-1 ${platformColor[acc.platform]}`}>
                {acc.platform_display}
              </span>
              <p className="text-white font-medium text-sm">{acc.handle}</p>
            </div>
            <button
              onClick={() => handleDelete(acc.id)}
              className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 active:scale-95 transition-transform"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add drawer */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-surface-2 rounded-t-3xl border-t border-white/10 p-5 pb-8 space-y-4">
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto -mt-1" />
            <h2 className="font-display text-lg font-bold text-white">Agregar cuenta</h2>

            <div>
              <p className="text-xs font-medium text-white/50 mb-2">Plataforma</p>
              <div className="flex gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm((f) => ({ ...f, platform: p }))}
                    className={`flex-1 py-2 rounded-xl text-xs border transition-all capitalize ${
                      form.platform === p
                        ? "bg-brand-500/20 border-brand-400/40 text-brand-300"
                        : "border-white/10 text-white/40"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-white/50 mb-1.5">Handle</p>
              <input
                type="text"
                placeholder="@tunombre"
                value={form.handle}
                onChange={(e) => { setError(null); setForm((f) => ({ ...f, handle: e.target.value })); }}
                className="w-full bg-surface-3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-500 transition-all"
              />
              {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setShowAdd(false)}>Cancelar</Button>
              <Button className="flex-1" isLoading={isSaving} onClick={handleAdd}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
