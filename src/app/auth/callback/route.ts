import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const next = url.searchParams.get("next") || "/painel";
  const safeNext = next.startsWith("/") ? next : "/painel";
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const supabase = await createClient();

  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  }

  if (ok) return NextResponse.redirect(new URL(safeNext, url.origin));
  const back = new URL("/entrar", url.origin);
  back.searchParams.set(
    "erro",
    "O link expirou ou foi aberto em outro navegador. Se você acabou de confirmar a conta, basta entrar com e-mail e senha."
  );
  return NextResponse.redirect(back);
}
