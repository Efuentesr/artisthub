import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import useAuthStore from "./store/authStore";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ResendVerificationPage from "./pages/auth/ResendVerificationPage";
import HomePage from "./pages/dashboard/HomePage";
import InteractionsPage from "./pages/dashboard/InteractionsPage";
import AccountsPage from "./pages/dashboard/AccountsPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import ShareTargetPage from "./pages/ShareTargetPage";
import BottomNav from "./components/ui/BottomNav";

const NO_NAV_ROUTES = ["/login", "/register", "/resend-verification", "/share-target"];

function AppLayout({ children }) {
  const location = useLocation();
  const hideNav =
    NO_NAV_ROUTES.includes(location.pathname) ||
    location.pathname.startsWith("/verify-email");

  return (
    <>
      {children}
      {!hideNav && <BottomNav />}
    </>
  );
}

function AppRoutes() {
  const { isAuthenticated, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchProfile();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email/:uidb64/:token" element={<VerifyEmailPage />} />
      <Route path="/resend-verification" element={<ResendVerificationPage />} />

      {/* Web Share Target — recibe contenido compartido desde otras apps */}
      <Route path="/share-target" element={<ProtectedRoute><ShareTargetPage /></ProtectedRoute>} />

      <Route path="/dashboard"     element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/interactions"  element={<ProtectedRoute><InteractionsPage /></ProtectedRoute>} />
      <Route path="/accounts"      element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
      <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </BrowserRouter>
  );
}
