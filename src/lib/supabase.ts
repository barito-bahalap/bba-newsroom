export { supabase } from "@barito-bahalap/supabase";

export const configMissing =
  !import.meta.env.VITE_SUPABASE_URL ||
  !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

export const authLink = {
  type: hashParams.get("type"),
  error: hashParams.get("error_description"),
};
