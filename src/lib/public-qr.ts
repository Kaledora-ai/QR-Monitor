import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/env";

export async function getVcard(code: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  const { data } = await supabase.rpc("public_vcard", { p_code: code });
  return (data || null) as Record<string, string> | null;
}
