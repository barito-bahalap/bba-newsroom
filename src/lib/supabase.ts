export { supabase } from "@barito-bahalap/supabase";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const configMissing = !url || !anonKey;

const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

export const authLink = {
  type: hashParams.get("type"),
  error: hashParams.get("error_description"),
};
