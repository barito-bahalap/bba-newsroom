import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthValue, Session } from "./useAuth";
import { supabase, type Profile } from "@/lib";
import { AuthContext } from "./AuthContext";

type ProfileState = { id: string; profile: Profile | null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [profileState, setProfileState] = useState<ProfileState | null>(null);
  const userId = session?.user.id ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const fetchProfile = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as Profile | null) ?? null;
  }, []);

  useEffect(() => {
    if (!userId) return; // signed out is handled by derived state below
    let active = true;
    void fetchProfile(userId).then((profile) => {
      if (active) setProfileState({ id: userId, profile });
    });
    return () => {
      active = false;
    };
  }, [userId, fetchProfile]);

  // Derived during render: only trust the stored profile if it belongs to the current user.
  const profileLoaded = userId !== null && profileState?.id === userId;
  const profile = profileLoaded ? profileState.profile : null;

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) return null;
    if (error.status === 429)
      return "Too many attempts. Please try again later.";
    return "Invalid email or password.";
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (userId) {
      const profile = await fetchProfile(userId);
      setProfileState({ id: userId, profile });
    }
  }, [userId, fetchProfile]);

  const sendReset = useCallback(async (email: string) => {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/set-password`,
    });
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return error ? error.message : null;
  }, []);

  const loading = !sessionReady || (userId !== null && !profileLoaded);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      profile,
      loading,
      signIn,
      signOut,
      refreshProfile,
      sendReset,
      updatePassword,
    }),
    [
      session,
      profile,
      loading,
      signIn,
      signOut,
      refreshProfile,
      sendReset,
      updatePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
