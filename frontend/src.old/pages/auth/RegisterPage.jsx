import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import AuthLayout from "./AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    email: "",
    artistic_name: "",
    genre: "",
    password: "",
    password2: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFieldErrors((fe) => ({ ...fe, [e.target.name]: null }));
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form);
    if (result.success) {
      setSuccess(true);
    } else {
      setFieldErrors(result.errors || {});
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-white">¡Cuenta creada!</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Te enviamos un email de verificación a{" "}
            <span className="text-white font-medium">{form.email}</span>.
            <br />Revisa tu bandeja (y el spam).
          </p>
          <Button variant="ghost" className="mx-auto" onClick={() => navigate("/login")}>
            Ir al login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-2 mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Crea tu cuenta
        </h1>
        <p className="text-white/50 text-sm">
          Empieza a gestionar tus interacciones
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
          required
        />

        <Input
          label="Nombre artístico"
          name="artistic_name"
          type="text"
          placeholder="DJ Kuro, La Voz, …"
          value={form.artistic_name}
          onChange={handleChange}
          error={fieldErrors.artistic_name}
        />

        <Input
          label="Género musical"
          name="genre"
          type="text"
          placeholder="Reggaeton, Salsa, Pop, …"
          value={form.genre}
          onChange={handleChange}
          error={fieldErrors.genre}
        />

        <Input
          label="Contraseña"
          name="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password?.[0]}
          required
        />

        <Input
          label="Confirmar contraseña"
          name="password2"
          type="password"
          placeholder="Repite tu contraseña"
          value={form.password2}
          onChange={handleChange}
          error={fieldErrors.password2}
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        ¿Ya tienes cuenta?{" "}
        <Link
          to="/login"
          className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
        >
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
