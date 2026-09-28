import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailLayout, sendEmail } from "@/lib/email";
import { BUY_URL, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Roda todo dia (vercel.json): avisos de vencimento e, no dia 1º, o resumo mensal
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }
  const db = createAdminClient();
  const buy = BUY_URL || `${SITE_URL}/painel/creditos`;
  let warned = 0;
  let summaries = 0;

  // 1) QR Codes que vencem nos próximos 3 dias
  const soon = new Date(Date.now() + 3 * 86400000).toISOString();
  const { data: expiring } = await db
    .from("qr_codes")
    .select("id, name, expires_at, user_id, profiles(email)")
    .eq("is_dynamic", true)
    .eq("is_permanent", false)
    .is("expiry_warned_at", null)
    .gt("expires_at", new Date().toISOString())
    .lte("expires_at", soon);

  for (const q of expiring || []) {
    const email = (q.profiles as unknown as { email: string } | null)?.email;
    if (!email) continue;
    const date = new Date(q.expires_at!).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    await sendEmail(
      email,
      `Seu QR Code "${q.name}" vence em ${date}`,
      emailLayout(
        "Seu QR Code está perto de vencer",
        `O QR Code <strong>${q.name}</strong> deixa de funcionar em <strong>${date}</strong>. Renove por mais 30 dias ou torne-o permanente para não perder nenhuma leitura. A imagem impressa continua a mesma.<br><br>Precisa de créditos? <a href="${buy}" style="color:#6ff5c6">Compre aqui</a>.`,
        { label: "Renovar agora", url: `${SITE_URL}/painel/qr/${q.id}` }
      )
    );
    await db.from("qr_codes").update({ expiry_warned_at: new Date().toISOString() }).eq("id", q.id);
    warned++;
  }

  // 2) Resumo mensal (dia 1º, horário de Brasília)
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  if (today.endsWith("-01")) {
    const end = new Date(`${today}T03:00:00Z`); // meia-noite em Brasília
    const startDate = new Date(end);
    startDate.setUTCMonth(startDate.getUTCMonth() - 1);
    const monthName = startDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

    const { data: users } = await db.from("profiles").select("id, email").eq("monthly_report", true);
    for (const u of users || []) {
      const { data: qrs } = await db.from("qr_codes").select("id, name").eq("user_id", u.id).eq("is_dynamic", true);
      if (!qrs?.length || !u.email) continue;
      const lines: { name: string; n: number; id: string }[] = [];
      for (const q of qrs) {
        const { count } = await db
          .from("scans")
          .select("id", { count: "exact", head: true })
          .eq("qr_id", q.id)
          .gte("scanned_at", startDate.toISOString())
          .lt("scanned_at", end.toISOString());
        lines.push({ name: q.name, n: count || 0, id: q.id });
      }
      const total = lines.reduce((s, l) => s + l.n, 0);
      lines.sort((a, b) => b.n - a.n);
      const table = lines
        .slice(0, 15)
        .map((l) => `<tr><td style="padding:6px 0">${l.name}</td><td style="padding:6px 0;text-align:right;font-weight:700">${l.n}</td></tr>`)
        .join("");
      await sendEmail(
        u.email,
        `Resumo de ${monthName}: ${total} leituras`,
        emailLayout(
          `Seus QR Codes em ${monthName}`,
          `Seus QR Codes somaram <strong>${total.toLocaleString("pt-BR")} leituras</strong> no mês.<table style="width:100%;margin-top:14px;color:#e9edf8;font-size:14px">${table}</table>`,
          { label: "Ver relatórios", url: `${SITE_URL}/painel` }
        )
      );
      summaries++;
    }
  }

  return NextResponse.json({ ok: true, warned, summaries });
}
