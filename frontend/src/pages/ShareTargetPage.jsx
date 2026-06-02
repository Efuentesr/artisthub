import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useInteractionsStore from "../store/interactionsStore";
import useAuthStore from "../store/authStore";
import Button from "../components/ui/Button";

const TYPES = [
  { value: "comment", label: "Comentario" },
  { value: "dm",      label: "Mensaje directo" },
  { value: "reply",   label: "Respuesta" },
];

export default function ShareTargetPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { socialAccounts, fetchSocialAccounts, createInteraction } = useInteractionsStore();

  // Leer los parámetros que el sistema operativo pasó via URL
  const params = new URLSearchParams(window.location.search);
  const sharedText = params.get("text") || "";
  const sharedUrl  = params.get("url")  || "";
  const sharedTitle = params.get("title") || "";

  // Intentar extraer @usuario del texto compartido
  const userMatch = sharedText.match(/@([\w.]+)/);

  const [form, setForm] = useState({
    social_account: "",
    type: "comment",
    from_username: userMatch?.[1] || "",
    content: sharedText || sharedTitle,
    post_url: sharedUrl,
    received_at: new Date().toISOString().slice(0, 16),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchSocialAccounts();
  }, []);

  // Pre-seleccionar cuenta si solo hay una
  useEffect(() => {
    if (socialAccounts.length === 1) {
      setForm((f) => ({ ...f, social_account: socialAccounts[0].id }));
    }
  }, [socialAccounts]);

  const set = (key, val) => {
    setErrors((e) => ({ ...e, [key]: null }));
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSave = async () => {
    if (!form.social_account) {
      setErrors({ social_account: "Selecciona una cuenta" });
      return;
    }
    setIsSaving(true);
    const result = await createInteraction({
      ...form,
      received_at: new Date(form.received_at).toISOString(),
    });
    setIsSaving(false);
    if (result.success) {
      navigate("/interactions");
    } else {
      setErrors(result.errors || {});
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/interactions")}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-white">Guardar interacción</h1>
            <p className="text-white/40 text-xs">Contenido compartido desde otra app</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-24">

        {/* Contenido recibido — solo lectura */}
        <div className="bg-surface-2 border border-brand-500/20 rounded-2xl p-4">
          <p className="text-xs text-brand-400 font-medium mb-2">Contenido recibido</p>
          <textarea
            rows={4}
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            className="w-full bg-transparent text-sm text-white/80 leading-relaxed outline-none resize-none"
            placeholder="El texto compartido aparecerá aquí…"
          />
          {form.post_url && (
            <a
              href={form.post_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-brand-400 underline mt-1 block truncate"
            >
              {form.post_url}
            </a>
          )}
        </div>

        {/* Usuario */}
        <div>
          <p className="text-xs font-medium text-white/50 mb-1.5">Usuario (@handle)</p>
          <input
            type="text"
            placeholder="nombre del usuario"
            value={form.from_username}
            onChange={(e) => set("from_username", e.target.value)}
            className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-500 transition-all"
          />
        </div>

        {/* Tipo */}
        <div>
          <p className="text-xs font-medium text-white/50 mb-2">Tipo</p>
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => set("type", t.value)}
                className={`flex-1 py-2.5 rounded-xl text-xs border transition-all ${
                  form.type === t.value
                    ? "bg-brand-500/20 border-brand-400/40 text-brand-300"
                    : "border-white/10 text-white/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cuenta social */}
        <div>
          <p className="text-xs font-medium text-white/50 mb-2">¿Desde qué cuenta?</p>
          {socialAccounts.length === 0 ? (
            <p className="text-sm text-white/40 bg-surface-2 rounded-xl p-3">
              No tienes cuentas registradas.{" "}
              <button onClick={() => navigate("/accounts")} className="text-brand-400 underline">
                Agregar una
              </button>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {socialAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => set("social_account", acc.id)}
                  className={`px-3 py-2 rounded-xl text-xs border transition-all ${
                    form.social_account === acc.id
                      ? "bg-brand-500/20 border-brand-400/40 text-brand-300"
                      : "border-white/10 text-white/40"
                  }`}
                >
                  {acc.platform_display} · {acc.handle}
                </button>
              ))}
            </div>
          )}
          {errors.social_account && (
            <p className="text-xs text-red-400 mt-1">{errors.social_account}</p>
          )}
        </div>

        {/* URL */}
        {form.post_url && (
          <div>
            <p className="text-xs font-medium text-white/50 mb-1.5">URL de la publicación</p>
            <input
              type="url"
              value={form.post_url}
              onChange={(e) => set("post_url", e.target.value)}
              className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-500 transition-all"
            />
          </div>
        )}
      </div>

      {/* Botones fijos abajo */}
      <div className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-xl border-t border-white/8 p-4 flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={() => navigate("/interactions")}>
          Cancelar
        </Button>
        <Button className="flex-1" isLoading={isSaving} onClick={handleSave}>
          Guardar
        </Button>
      </div>
    </div>
  );
}
