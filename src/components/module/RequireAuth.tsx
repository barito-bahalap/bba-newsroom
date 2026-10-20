import { Navigate, Outlet, useLocation } from "react-router-dom";
// Style
import "./RequireAuth.css";
// Contexts
import { useAuth } from "@/contexts";
// Components
import { LoadingSpinner } from "@/components";
// Utils
import type { Role } from "@/lib";

export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { session, profile, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!profile || !profile.is_active) {
    return (
      <div className="auth-gate">
        <h1>Access pending</h1>
        <p>
          Your account exists but has not been activated. Ask a newsroom admin
          to activate it and assign a role.
        </p>
        <div>
          <button type="button" className="btn" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (roles && !roles.includes(profile.role)) {
    return (
      <div className="auth-gate">
        <h1>Not allowed</h1>
        <p>Your role does not have access to this page.</p>
      </div>
    );
  }

  return <Outlet />;
}
