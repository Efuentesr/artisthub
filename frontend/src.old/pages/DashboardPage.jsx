import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <span className="font-display text-2xl font-bold text-white">
            Artist<span className="text-brand-400">Hub</span>
          </span>
          <Button variant="ghost" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
        <div className="bg-surface-2 border border-white/10 rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold text-white mb-1">
            Hola, {user?.artistic_name || user?.email} 👋
          </h2>
          <p className="text-white/40 text-sm">
            El dashboard de interacciones viene en el siguiente paso.
          </p>
        </div>
      </div>
    </div>
  );
}
