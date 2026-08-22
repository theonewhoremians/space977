import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// The browser only invokes Edge Functions. It never receives privileged keys
// and has no direct table permissions.
export const supabase = url && publishableKey
  ? createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
