import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Hooks
import { useAuth } from "@/hooks";
// Utils
import { authLink } from "@/lib/supabase";

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
