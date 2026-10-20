import { Navigate, useLocation } from "react-router-dom";
// Style
import "./LoginPage.css";
// Contexts & Hooks
import { useAuth } from "@/contexts";
import { useLoginForm } from "@/hooks";
// Components
import { LoginForm } from "./_components";

export default function LoginPage() {
  const { session, loading } = useAuth();
  const location = useLocation();
  const form = useLoginForm();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  if (!loading && session) return <Navigate to={from} replace />;

  return (
    <div className="login-page">
      <h1>BBM Newsroom</h1>
      <p className="muted">
        Internal tool for the Barito Bahalap Media editorial team.
      </p>
      <LoginForm {...form} />
    </div>
  );
}
