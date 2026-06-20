import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import AuthLayout from "./AuthLayout";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    clearError();
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <div className="space-y-2 mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Bienvenido de vuelta
        </h1>
        <p className="text-white/50 text-sm">
          Ingresa a tu cuenta para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert message={error} />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />

        <PasswordInput
          label="Contraseña"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />
        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          Iniciar sesión
        </Button>

      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        ¿No tienes cuenta?{" "}
        <Link
          to="/register"
          className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
        >
          Regístrate
        </Link>
      </p>

      <p className="mt-3 text-center text-sm text-white/40">
        ¿No recibiste el email de verificación?{" "}
        <Link
          to="/resend-verification"
          className="text-white/60 hover:text-white transition-colors"
        >
          Reenviar
        </Link>
      </p>
    </AuthLayout>
  );
}
