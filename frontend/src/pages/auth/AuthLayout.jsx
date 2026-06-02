export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface noise flex">
      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradiente de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-surface-1 to-surface" />
        {/* Orbes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-400/10 rounded-full blur-2xl" />
        {/* Contenido */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              Artist<span className="text-brand-400">Hub</span>
            </span>
          </div>
          <div>
            <blockquote className="text-white/60 text-lg font-light leading-relaxed italic">
              "Cada comentario de un fan es una semilla.<br />
              ArtistHub te ayuda a no perder ninguna."
            </blockquote>
            <div className="mt-6 flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-1 rounded-full bg-brand-500/40"
                  style={{ opacity: 1 - i * 0.15 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden mb-8 text-center">
            <span className="font-display text-2xl font-bold text-white">
              Artist<span className="text-brand-400">Hub</span>
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
