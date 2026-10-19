import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/lib/types";

export default function RequireAuth({ roles }: { roles?: Role[] }) {
  const { session, profile, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) return <p className="center">Loading...</p>;

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!profile || !profile.is_active) {
    return (
      <div className="card-narrow">
        <h1>Access pending</h1>
        <p>
          Your account exists but has not been activated. Ask a newsroom admin
          to activate it and assign a role.
        </p>
        <button type="button" onClick={() => void signOut()}>
          Sign out
        </button>
      </div>
    );
  }

  if (roles && !roles.includes(profile.role)) {
    return (
      <div className="card-narrow">
        <h1>Not allowed</h1>
        <p>Your role does not have access to this page.</p>
      </div>
    );
  }

  return <Outlet />;
}
