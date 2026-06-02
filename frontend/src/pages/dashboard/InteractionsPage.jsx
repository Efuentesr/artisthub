import { useEffect, useState } from "react";
import useInteractionsStore from "../../store/interactionsStore";
import InteractionCard from "../../components/interactions/InteractionCard";
import FilterBar from "../../components/interactions/FilterBar";
import AddInteractionDrawer from "../../components/interactions/AddInteractionDrawer";

export default function InteractionsPage() {
  const { interactions, isLoading, fetchInteractions, fetchSocialAccounts } = useInteractionsStore();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchSocialAccounts();
    fetchInteractions();
  }, []);

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-white/8 px-4 pt-12 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-white">Interacciones</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-900/40 active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <FilterBar />
      </div>

      {/* Lista */}
      <div className="px-4 pt-4 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <svg className="w-6 h-6 text-brand-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}

        {!isLoading && interactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm">
              Aún no hay interacciones.
            </p>
            <p className="text-white/25 text-xs mt-1">
              Toca el <span className="text-brand-400">+</span> para agregar la primera.
            </p>
          </div>
        )}

        {!isLoading && interactions.map((interaction) => (
          <InteractionCard
            key={interaction.id}
            interaction={interaction}
            onNoteUpdate={fetchInteractions}
          />
        ))}
      </div>

      {showAdd && (
        <AddInteractionDrawer onClose={() => setShowAdd(false)} />
      )}
    </div>
  );
}
