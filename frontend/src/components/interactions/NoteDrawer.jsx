import { useState } from "react";
import useInteractionsStore from "../../store/interactionsStore";
import Button from "../ui/Button";
import PlatformBadge from "./PlatformBadge";

const TAGS = [
  { value: "sugerencia",  label: "Sugerencia" },
  { value: "colaboracion",label: "Colaboración" },
  { value: "cliente",     label: "Cliente" },
  { value: "revisar",     label: "Revisar" },
];

const STATUSES = [
  { value: "pendiente", label: "Pendiente" },
  { value: "revisado",  label: "Revisado" },
  { value: "archivado", label: "Archivado" },
];

export default function NoteDrawer({ interaction, onClose, onSave }) {
  const { upsertNote } = useInteractionsStore();
  const existing = interaction.note;
  const [tag, setTag] = useState(existing?.tag || "");
  const [status, setStatus] = useState(existing?.status || "pendiente");
  const [text, setText] = useState(existing?.text || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await upsertNote(interaction.id, { tag, status, text });
    setIsSaving(false);
    if (result.success) {
      onSave?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative bg-surface-2 rounded-t-3xl border-t border-white/10 p-5 pb-8 space-y-5 max-h-[85vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto -mt-1 mb-1" />

        {/* Interaction preview */}
        <div className="bg-surface-3 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <PlatformBadge platform={interaction.platform} size="xs" />
            <span className="text-white/50 text-xs">@{interaction.from_username}</span>
          </div>
          <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
            {interaction.content}
          </p>
        </div>

        {/* Tag selector */}
        <div>
          <p className="text-xs font-medium text-white/50 mb-2">Etiqueta</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTag("")}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                tag === ""
                  ? "bg-white/10 border-white/30 text-white"
                  : "border-white/10 text-white/40"
              }`}
            >
              Sin etiqueta
            </button>
            {TAGS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTag(t.value)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                  tag === t.value
                    ? "bg-brand-500/20 border-brand-400/40 text-brand-300"
                    : "border-white/10 text-white/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status selector */}
        <div>
          <p className="text-xs font-medium text-white/50 mb-2">Estado</p>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`flex-1 py-2 rounded-xl text-xs border transition-all ${
                  status === s.value
                    ? "bg-brand-500/20 border-brand-400/40 text-brand-300"
                    : "border-white/10 text-white/40"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Note text */}
        <div>
          <p className="text-xs font-medium text-white/50 mb-2">Tu nota</p>
          <textarea
            rows={3}
            placeholder="Lo que quieres recordar de esta interacción…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-surface-3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" isLoading={isSaving} onClick={handleSave}>
            Guardar nota
          </Button>
        </div>
      </div>
    </div>
  );
}
