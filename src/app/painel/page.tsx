import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fmtDate, qrState, TONE, type QrRow } from "@/lib/format";
import { typeDef } from "@/lib/qr-types";
import { QrThumb } from "@/components/QrThumb";

export const metadata = { title: "Meus QR Codes" };

export default async function PanelHome() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("qr_codes")
    .select("*, scans(count)")
    .order("created_at", { ascending: false });
  const rows = (data || []) as (QrRow & { scans: { count: number }[] })[];
  const total = rows.reduce((s, r) => s + (r.scans?.[0]?.count || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Meus QR Codes</h1>
          <p className="text-mute text-sm mt-1">
            {rows.length} {rows.length === 1 ? "código" : "códigos"} · <span className="font-mono text-ink">{total.toLocaleString("pt-BR")}</span> leituras no total
          </p>
        </div>
        <Link href="/painel/novo" className="btn btn-primary">Criar QR Code</Link>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-xl font-bold">Nenhum QR Code ainda</p>
          <p className="text-mute mt-2 max-w-md mx-auto">
            Você tem créditos de boas-vindas. Crie o primeiro QR Code com a logo do seu cliente e acompanhe as leituras aqui.
          </p>
          <Link href="/painel/novo" className="btn btn-primary mt-6">Criar meu primeiro QR Code</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((q) => {
            const st = qrState(q);
            return (
              <Link key={q.id} href={`/painel/qr/${q.id}`} className="card p-5 flex gap-4 hover:border-signal/40 transition-colors">
                <QrThumb qr={q} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{q.name}</p>
                  <p className="text-xs text-mute">{typeDef(q.type).label} · {fmtDate(q.created_at)}</p>
                  <span className={`chip mt-2 ${TONE[st.tone]}`}>{st.label}</span>
                  {q.is_dynamic && (
                    <p className="mt-3 text-sm">
                      <span className="font-mono font-bold text-lg">{(q.scans?.[0]?.count || 0).toLocaleString("pt-BR")}</span>{" "}
                      <span className="text-mute">leituras</span>
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
