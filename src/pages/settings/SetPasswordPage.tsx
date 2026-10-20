import { Link, useNavigate } from "react-router-dom";
// Style
import "./SetPasswordPage.css";
// Contexts & Hooks
import { useAuth } from "@/contexts";
import { usePasswordForm } from "@/hooks";
// Components
import { PasswordForm } from "@/components";

export default function SetPasswordPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const form = usePasswordForm(() => navigate("/", { replace: true }));

  if (loading) return <p className="set-password-page muted">Loading...</p>;

  if (!session) {
    return (
      <div className="set-password-page">
        <h1>Link expired</h1>
        <p>
          This link is invalid or has expired. Request a new one from the
          sign-in page.
        </p>
        <Link to="/login">Go to sign in</Link>
      </div>
    );
  }

  return (
    <div className="set-password-page">
      <h1>Set your password</h1>
      <PasswordForm {...form} submitLabel="Save password" />
    </div>
  );
}
