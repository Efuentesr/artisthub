import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { authApi } from "../../api/auth";
import AuthLayout from "./AuthLayout";
import Button from "../../components/ui/Button";

export default function VerifyEmailPage() {
  const { uidb64, token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    authApi
      .verifyEmail(uidb64, token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [uidb64, token]);

  return (
    <AuthLayout>
      <div className="text-center space-y-4">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto animate-pulse">
              <svg className="w-7 h-7 text-brand-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Verificando...</h2>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-white">¡Email verificado!</h2>
            <p className="text-white/50 text-sm">Tu cuenta está activa. Ya puedes iniciar sesión.</p>
            <Link to="/login">
              <Button className="mx-auto">Ir al login</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Enlace inválido</h2>
            <p className="text-white/50 text-sm">El enlace expiró o ya fue usado.</p>
            <Link to="/resend-verification">
              <Button variant="ghost" className="mx-auto">Solicitar nuevo enlace</Button>
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
