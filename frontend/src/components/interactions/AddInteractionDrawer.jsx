import { useState } from "react";
import useInteractionsStore from "../../store/interactionsStore";
import Button from "../ui/Button";
import Input from "../ui/Input";

const PLATFORMS = ["instagram", "tiktok", "facebook"];
const TYPES = [
  { value: "comment", label: "Comentario" },
  { value: "dm",      label: "Mensaje directo" },
  { value: "reply",   label: "Respuesta" },
];

export default function AddInteractionDrawer({ onClose }) {
  const { socialAccounts, createInteraction, fetchInteractions } = useInteractionsStore();
  const [form, setForm] = useState({
    social_account: "",
    type: "comment",
    from_username: "",
    content: "",
    post_url: "",
    received_at: new Date().toISOString().slice(0, 16),
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const set = (key, val) => {
    setErrors((e) => ({ ...e, [key]: null }));
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = async () => {
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
      await fetchInteractions();
      onClose();
    } else {
      setErrors(result.errors || {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-2 rounded-t-3xl border-t border-white/10 p-5 pb-8 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto -mt-1" />
        <h2 className="font-display text-lg font-bold text-white">Nueva interacción</h2>

        {/* Cuenta social */}
        <div>
          <p className="text-xs font-medium text-white/50 mb-2">Red social</p>
          {socialAccounts.length === 0 ? (
            <p className="text-sm text-white/40 bg-surface-3 rounded-xl p-3">
              No tienes cuentas sociales registradas aún.
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
                  {acc.platform} · {acc.handle}
                </button>
              ))}
            </div>
          )}
          {errors.social_account && (
            <p className="text-xs text-red-400 mt-1">{errors.social_account}</p>
          )}
        </div>

        {/* Tipo */}
        <div>
          <p className="text-xs font-medium text-white/50 mb-2">Tipo</p>
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => set("type", t.value)}
                className={`flex-1 py-2 rounded-xl text-xs border transition-all ${
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

        <Input
          label="Usuario (@handle)"
          placeholder="marisolbeats"
          value={form.from_username}
          onChange={(e) => set("from_username", e.target.value)}
          error={errors.from_username}
        />

        <div>
          <p className="text-xs font-medium text-white/50 mb-1.5">Contenido</p>
          <textarea
            rows={4}
            placeholder="Pega aquí el comentario o mensaje…"
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none transition-all"
          />
          {errors.content && <p className="text-xs text-red-400 mt-1">{errors.content}</p>}
        </div>

        <Input
          label="URL de la publicación (opcional)"
          placeholder="https://instagram.com/p/…"
          type="url"
          inputMode="url"
          value={form.post_url}
          onChange={(e) => set("post_url", e.target.value)}
          error={errors.post_url}
        />

        <div>
          <p className="text-xs font-medium text-white/50 mb-1.5">Fecha y hora</p>
          <input
            type="datetime-local"
            value={form.received_at}
            onChange={(e) => set("received_at", e.target.value)}
            className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" isLoading={isSaving} onClick={handleSubmit}>Guardar</Button>
        </div>
      </div>
    </div>
  );
}
