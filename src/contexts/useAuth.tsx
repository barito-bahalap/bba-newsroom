import { useContext } from "react";
import { supabase, type Profile } from "@/lib";
import { AuthContext } from "./AuthContext";

export type Session = NonNullable<
  Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]
>;

export interface AuthValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<string | null>;
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
