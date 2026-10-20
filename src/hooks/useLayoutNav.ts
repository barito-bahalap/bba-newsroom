import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
// Contexts
import { useAuth } from "@/contexts";
// Utils
import { navLinksFor } from "@/lib";

export function useLayoutNav() {
  const { profile, signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const links = useMemo(
    () => (profile ? navLinksFor(profile.role) : []),
    [profile],
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    queryClient.clear();
    navigate("/login", { replace: true });
  }, [signOut, queryClient, navigate]);

  return { profile, links, signOut: handleSignOut };
}
