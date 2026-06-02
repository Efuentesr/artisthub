import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { authApi } from "../../api/auth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, fetchProfile } = useAuthStore();
  const [form, setForm] = useState({
    artistic_name: user?.artistic_name || "",
    genre: user?.genre || "",
    bio: user?.bio || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authApi.updateProfile(form);
      await fetchProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-white/8 px-4 pt-12 pb-4">
        <h1 className="font-display text-xl font-bold text-white">Perfil</h1>
      </div>

      <div className="px-4 pt-6 space-y-4">
        {/* Avatar placeholder */}
        <div className="flex items-center gap-4 bg-surface-1 border border-white/8 rounded-2xl p-4">
          <div className="w-14 h-14 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-300 font-display font-bold text-xl">
            {user?.artistic_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white">{user?.artistic_name || "Sin nombre artístico"}</p>
            <p className="text-white/40 text-sm">{user?.email}</p>
          </div>
        </div>

        {success && <Alert type="success" message="Perfil actualizado correctamente." />}

        <Input
          label="Nombre artístico"
          value={form.artistic_name}
          onChange={(e) => setForm((f) => ({ ...f, artistic_name: e.target.value }))}
          placeholder="Tu nombre o alias"
        />

        <Input
          label="Género musical"
          value={form.genre}
          onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
          placeholder="Reggaeton, Salsa, Pop…"
        />

        <div>
          <p className="text-xs font-medium text-white/50 mb-1.5">Bio</p>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Cuéntanos sobre ti…"
            className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none transition-all"
          />
        </div>

        <Button className="w-full" isLoading={isSaving} onClick={handleSave}>
          Guardar cambios
        </Button>

        <div className="pt-4 border-t border-white/8">
          <Button variant="danger" className="w-full" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
