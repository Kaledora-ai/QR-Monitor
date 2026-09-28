"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Copy, Check, ShareNetwork, FileCsv, FilePdf, Pause, Play, Trash, Sparkle, ArrowClockwise, Infinity as InfinityIcon, ArrowLeft } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { mergeDesign, isPremium, basicOnly, type Design } from "@/lib/qr-render";
import { buildDestination, typeDef, validate, type Content, type QrType } from "@/lib/qr-types";
import { qrData } from "@/lib/qr-data";
import { fmtDate, qrState, TONE, type QrRow } from "@/lib/format";
import { COSTS, SITE_URL, BUY_URL } from "@/lib/site";
import { QrPreview, DownloadButtons } from "./QrPreview";
import { ContentFields } from "./ContentFields";
import { DesignFields } from "./DesignFields";
import { ReportView } from "./ReportView";

function CopyField({ value, label }: { value: string; label: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex gap-2">
        <input readOnly className="input font-mono text-xs" value={value} onFocus={(e) => e.target.select()} />
        <button
          className="btn btn-ghost !px-3"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setOk(true);
            setTimeout(() => setOk(false), 1500);
          }}
          aria-label="Copiar"
        >
          {ok ? <Check size={16} className="text-signal" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}

export function QrDetail({ qr: initial, credits }: { qr: QrRow; credits: number }) {
  const router = useRouter();
  const isNew = useSearchParams().get("novo") === "1";
  const supabase = createClient();
  const [qr, setQr] = useState(initial);
  const [name, setName] = useState(qr.name);
  const [content, setContent] = useState<Content>(qr.content as Content);
  const [design, setDesign] = useState<Design>(mergeDesign(qr.design as Partial<Design>));
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const [tab, setTab] = useState<"relatorio" | "editar">(qr.is_dynamic ? "relatorio" : "editar");

  const st = qrState(qr);
  const shownDesign = qr.has_design ? design : basicOnly(design);
  const data = qrData(qr);
  const publicReport = `${SITE_URL}/r/${qr.share_token}`;

  function flash(t: "ok" | "err", m: string) {
    setMsg({ t, m });
    setTimeout(() => setMsg(null), 4000);
  }

  async function run(key: string, fn: () => Promise<{ error: { message: string } | null; data?: unknown }>, okMsg: string) {
    setBusy(key);
    const { error, data } = await fn();
    setBusy(null);
    if (error) return flash("err", error.message);
    if (data && typeof data === "object" && "id" in (data as object)) setQr(data as QrRow);
    flash("ok", okMsg);
    router.refresh();
  }

  async function saveContent() {
    const v = validate(qr.type as QrType, content);
    if (v) return flash("err", v);
    await run(
      "save",
      async () =>
        await supabase
          .from("qr_codes")
          .update({
            name,
            ...(qr.is_dynamic ? { content, destination: buildDestination(qr.type as QrType, content) } : {}),
            design: shownDesign,
          })
          .eq("id", qr.id)
          .select()
          .single(),
      qr.is_dynamic ? "Salvo. O QR impresso já leva para o novo destino." : "Salvo."
    );
  }

  const lack = (n: number) => credits < n;

  return (
    <div className="space-y-6">
      <Link href="/painel" className="no-print inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink">
        <ArrowLeft size={14} /> Meus QR Codes
      </Link>

      {isNew && (
        <div className="no-print card !border-signal/40 bg-signal/5 p-4 text-sm">
          <strong className="text-signal">QR Code criado!</strong> Baixe a imagem abaixo e teste com a câmera do celular antes de imprimir.
        </div>
      )}
      {msg && (
        <div className={`no-print fixed bottom-5 left-1/2 -translate-x-1/2 z-50 rounded-full px-5 py-2.5 text-sm shadow-xl ${msg.t === "ok" ? "bg-signal text-night" : "bg-danger text-white"}`}>
          {msg.m}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr] items-start">
        {/* Coluna do QR */}
        <aside className="space-y-4 lg:sticky lg:top-32">
          <div className="card p-5 space-y-4">
            <div className="rounded-2xl bg-white/[0.03] p-3">
              <QrPreview data={data} design={shownDesign} />
            </div>
            <div className="no-print">
              <DownloadButtons data={data} design={shownDesign} name={qr.name} />
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-tight">{qr.name}</p>
              <p className="text-xs text-mute mt-1">{typeDef(qr.type).label} · criado em {fmtDate(qr.created_at)}</p>
              <span className={`chip mt-2 ${TONE[st.tone]}`}>{st.label}</span>
            </div>
            {qr.is_dynamic && <CopyField label="Link do QR Code" value={`${SITE_URL}/q/${qr.code}`} />}
          </div>

          {qr.is_dynamic && (
            <div className="card p-5 space-y-3 no-print">
              <p className="font-semibold text-sm">Validade</p>
              {qr.is_permanent ? (
                <p className="text-sm text-mute">Permanente: não expira.</p>
              ) : (
                <>
                  <p className="text-sm text-mute">Válido até <span className="text-ink">{fmtDate(qr.expires_at)}</span></p>
                  <button
                    className="btn btn-ghost w-full text-sm"
                    disabled={!!busy || lack(COSTS.renew)}
                    onClick={() => run("renew", async () => await supabase.rpc("renew_qr", { p_qr_id: qr.id }), "Renovado por mais 30 dias.")}
                  >
                    <ArrowClockwise size={16} /> Renovar +30 dias · {COSTS.renew} créditos
                  </button>
                  <button
                    className="btn btn-ghost w-full text-sm"
                    disabled={!!busy || lack(COSTS.permanent)}
                    onClick={() =>
                      confirm(`Tornar este QR Code permanente por ${COSTS.permanent} créditos?`) &&
                      run("perm", async () => await supabase.rpc("upgrade_permanent", { p_qr_id: qr.id }), "Agora é permanente.")
                    }
                  >
                    <InfinityIcon size={16} /> Tornar permanente · {COSTS.permanent} créditos
                  </button>
                  {(lack(COSTS.renew)) && (
                    <p className="text-xs text-ping">
                      Créditos insuficientes.{" "}
                      {BUY_URL ? <a href={BUY_URL} target="_blank" rel="noreferrer" className="underline">Comprar</a> : <Link href="/painel/creditos" className="underline">Obter créditos</Link>}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </aside>

        {/* Conteúdo principal */}
        <div className="space-y-5 min-w-0">
          <div className="no-print flex flex-wrap items-center justify-between gap-3">
            {qr.is_dynamic ? (
              <div className="flex gap-1 rounded-full border border-edge p-1">
                {(["relatorio", "editar"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold ${tab === t ? "bg-white/10 text-ink" : "text-mute hover:text-ink"}`}
                  >
                    {t === "relatorio" ? "Relatório" : "Editar"}
                  </button>
                ))}
              </div>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              {qr.is_dynamic && (
                <button
                  className="btn btn-ghost !py-2 text-sm"
                  disabled={!!busy}
                  onClick={() =>
                    run(
                      "pause",
                      async () =>
                        await supabase.from("qr_codes").update({ status: qr.status === "active" ? "paused" : "active" }).eq("id", qr.id).select().single(),
                      qr.status === "active" ? "Pausado. Quem escanear verá um aviso." : "Reativado."
                    )
                  }
                >
                  {qr.status === "active" ? <><Pause size={16} /> Pausar</> : <><Play size={16} /> Reativar</>}
                </button>
              )}
              <button
                className="btn btn-danger !py-2 text-sm"
                disabled={!!busy}
                onClick={async () => {
                  if (!confirm("Excluir este QR Code? A imagem impressa deixará de funcionar e os créditos não são devolvidos.")) return;
                  const { error } = await supabase.from("qr_codes").delete().eq("id", qr.id);
                  if (error) return flash("err", error.message);
                  router.push("/painel");
                  router.refresh();
                }}
              >
                <Trash size={16} /> Excluir
              </button>
            </div>
          </div>

          {qr.is_dynamic && tab === "relatorio" && (
            <>
              <div className="card p-5 grid gap-4 md:grid-cols-[1fr_auto] items-end no-print">
                <CopyField label="Link público do relatório (envie ao seu cliente)" value={publicReport} />
                <div className="flex gap-2">
                  <a href={publicReport} target="_blank" rel="noreferrer" className="btn btn-ghost !px-3 text-sm" title="Abrir relatório público">
                    <ShareNetwork size={16} />
                  </a>
                  <a href={`/api/qr/${qr.id}/csv`} className="btn btn-ghost !px-3 text-sm" title="Baixar CSV">
                    <FileCsv size={16} /> CSV
                  </a>
                  <button onClick={() => window.print()} className="btn btn-ghost !px-3 text-sm" title="Salvar em PDF">
                    <FilePdf size={16} /> PDF
                  </button>
                </div>
              </div>
              <div className="print-dark-text">
                <p className="hidden print:block font-bold text-xl mb-2">{qr.name}</p>
                <ReportView qrId={qr.id} />
              </div>
            </>
          )}

          {tab === "editar" && (
            <div className="space-y-5 no-print">
              <div className="card p-5 sm:p-6 space-y-4">
                <h2 className="font-display text-lg font-bold">Conteúdo</h2>
                <div>
                  <label className="label">Nome interno</label>
                  <input className="input" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                {qr.is_dynamic ? (
                  <>
                    <ContentFields type={qr.type as QrType} value={content} onChange={setContent} />
                    <p className="text-xs text-mute">Trocar o destino é grátis e vale na hora, sem reimprimir.</p>
                  </>
                ) : (
                  <p className="text-sm text-mute">QR Codes estáticos não podem ter o conteúdo alterado: os dados estão gravados na própria imagem.</p>
                )}
              </div>

              <div className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <h2 className="font-display text-lg font-bold">Aparência</h2>
                  {qr.is_dynamic && !qr.has_design && (
                    <button
                      className="btn btn-ghost !py-2 text-sm"
                      disabled={!!busy || lack(COSTS.design)}
                      onClick={() => run("design", async () => await supabase.rpc("upgrade_design", { p_qr_id: qr.id }), "Design completo liberado.")}
                    >
                      <Sparkle size={16} className="text-ping" weight="fill" /> Liberar design completo · {COSTS.design} créditos
                    </button>
                  )}
                </div>
                <DesignFields design={shownDesign} onChange={setDesign} premium={qr.has_design} canPremium={qr.is_dynamic} />
                {qr.has_design && isPremium(design) && (
                  <p className="text-xs text-mute mt-4">Mudanças de aparência só valem para as próximas impressões. Baixe a imagem de novo depois de salvar.</p>
                )}
              </div>

              <button className="btn btn-primary" disabled={!!busy} onClick={saveContent}>
                {busy === "save" ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
