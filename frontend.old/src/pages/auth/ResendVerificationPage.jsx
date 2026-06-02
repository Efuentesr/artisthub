import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../api/auth";
import AuthLayout from "./AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authApi.resendVerification(email);
      setSent(true);
    } catch {
      setError("Ocurrió un error. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-2 mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Reenviar verificación
        </h1>
        <p className="text-white/50 text-sm">
          Te enviaremos un nuevo enlace a tu email
        </p>
      </div>

      {sent ? (
        <Alert
          type="success"
          message="Si el email existe en nuestro sistema, recibirás el enlace en breve."
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert message={error} />
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" isLoading={isLoading} className="w-full">
            Enviar enlace
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-white/40">
        <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
          ← Volver al login
        </Link>
      </p>
    </AuthLayout>
  );
}
