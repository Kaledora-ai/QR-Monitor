import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isBot, parseUA } from "@/lib/ua";

export const dynamic = "force-dynamic";

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function header(req: NextRequest, name: string) {
  const v = req.headers.get(name);
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const origin = req.nextUrl.origin;
  const ua = req.headers.get("user-agent") || "";
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const { os, device, browser } = parseUA(ua);

  // Não guardamos o IP: só uma impressão digital irreversível, para estimar visitantes únicos (LGPD)
  const salt = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-16) || "qrmonitor";
  const visitor = await sha256(`${ip}|${ua}|${salt}`);

  let result: { status: string; type?: string; destination?: string | null } = { status: "error" };
  try {
    const supabase = createAdminClient();
    // Robôs de pré-visualização (WhatsApp, redes sociais) não contam como scan
    if (isBot(ua)) {
      const { data } = await supabase
        .from("qr_codes")
        .select("type, destination, status, expires_at")
        .eq("code", code)
        .maybeSingle();
      if (data && data.status === "active" && (!data.expires_at || new Date(data.expires_at) > new Date()))
        result = { status: "ok", type: data.type, destination: data.destination };
      else result = { status: data ? "expired" : "not_found" };
    } else {
      const { data, error } = await supabase.rpc("record_scan", {
        p_code: code,
        p_visitor: visitor,
        p_country: header(req, "x-vercel-ip-country"),
        p_region: header(req, "x-vercel-ip-country-region"),
        p_city: header(req, "x-vercel-ip-city"),
        p_device: device,
        p_os: os,
        p_browser: browser,
      });
      if (!error && data) result = data;
    }
  } catch (e) {
    console.error("redirect error", e);
  }

  const noCache = { "Cache-Control": "no-store, max-age=0" };
  if (result.status === "ok") {
    const target =
      result.type === "vcard" ? `${origin}/contato/${code}` : result.destination || `${origin}/indisponivel/${code}`;
    return NextResponse.redirect(target, { status: 302, headers: noCache });
  }
  const page = result.status === "expired" ? "expirado" : "indisponivel";
  return NextResponse.redirect(`${origin}/${page}/${code}`, { status: 302, headers: noCache });
}
