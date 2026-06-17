import { useState } from "react";
import PlatformBadge from "./PlatformBadge";
import TagBadge from "./TagBadge";
import NoteDrawer from "./NoteDrawer";

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return "ahora";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`;

  const isCurrentYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    ...(isCurrentYear ? {} : { year: "numeric" }),
  });
}

const typeLabel = { comment: "Comentario", dm: "Mensaje", reply: "Respuesta" };

const statusDot = {
  pendiente: "bg-amber-400",
  revisado:  "bg-emerald-400",
  archivado: "bg-white/20",
};

export default function InteractionCard({ interaction, onNoteUpdate }) {
  const [showNote, setShowNote] = useState(false);
  const { note } = interaction;

  return (
    <>
      <div
        className={`
          bg-surface-1 border rounded-2xl p-4 active:scale-[0.99] transition-transform
          ${note?.tag ? "border-brand-500/30" : "border-white/8"}
        `}
        onClick={() => setShowNote(true)}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-300 font-display font-bold text-sm flex-shrink-0">
              {interaction.from_username?.[1]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                @{interaction.from_username}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <PlatformBadge platform={interaction.platform} size="xs" />
                <span className="text-white/30 text-[10px]">
                  {typeLabel[interaction.type]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className="text-white/30 text-[11px]">
              {timeAgo(interaction.received_at)}
            </span>
            {note?.status && (
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot[note.status]}`} />
                <span className="text-[10px] text-white/40">{note.status}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-white/70 leading-relaxed line-clamp-3">
          {interaction.content}
        </p>

        {interaction.post_url && (
          <a
            href={interaction.post_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 mt-2 text-[11px] text-brand-400 active:opacity-70"
          >
            🔗 Ver publicación
          </a>
        )}


        {/* Footer */}
        {(note?.tag || note?.text) && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
            <TagBadge tag={note.tag} />
            {note.text && (
              <p className="text-[11px] text-white/40 truncate">{note.text}</p>
            )}
          </div>
        )}
      </div>

      {showNote && (
        <NoteDrawer
          interaction={interaction}
          onClose={() => setShowNote(false)}
          onSave={onNoteUpdate}
        />
      )}
    </>
  );
}
