import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Contexts
import { useAuth } from "@/contexts";
// Utils
import { authLink } from "@/lib";

let authLinkHandled = false;

export function AuthLinkRedirect() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLinkHandled || loading || !session) return;
    if (authLink.type === "invite" || authLink.type === "recovery") {
      authLinkHandled = true;
      navigate("/set-password", { replace: true });
    }
  }, [loading, session, navigate]);

  return null;
}
