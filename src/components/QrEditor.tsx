"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Link as LinkIcon, WhatsappLogo, InstagramLogo, IdentificationCard, FilePdf, ForkKnife, WifiHigh,
  CurrencyCircleDollar, TextT, Sparkle, Infinity as InfinityIcon, CalendarBlank,
} from "@phosphor-icons/react";
import { TYPES, buildDestination, buildStaticPayload, validate, type Content, type QrType } from "@/lib/qr-types";
import { DEFAULT_DESIGN, basicOnly, type Design } from "@/lib/qr-render";
import { COSTS, qrCost, SITE_URL, BUY_URL } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";
import { QrPreview } from "./QrPreview";
import { ContentFields } from "./ContentFields";
import { DesignFields } from "./DesignFields";

const ICONS: Record<QrType, typeof LinkIcon> = {
  url: LinkIcon, whatsapp: WhatsappLogo, instagram: InstagramLogo, vcard: IdentificationCard, pdf: FilePdf,
  menu: ForkKnife, wifi: WifiHigh, pix: CurrencyCircleDollar, text: TextT,
};

function Section({ n, title, children, aside }: { n: number; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-lg font-bold flex items-center gap-3">
          <span className="h-7 w-7 rounded-full bg-signal/10 text-signal text-sm flex items-center justify-center font-mono">{n}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function QrEditor({ credits }: { credits: number }) {
  const router = useRouter();
  const [type, setType] = useState<QrType>("url");
  const [content, setContent] = useState<Content>({ security: "WPA" });
  const [name, setName] = useState("");
  const [design, setDesign] = useState<Design>(DEFAULT_DESIGN);
  const [premium, setPremium] = useState(false);
  const [permanent, setPermanent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const def = TYPES.find((t) => t.id === type)!;
  const dynamic = def.dynamic;
  const effDesign = dynamic && premium ? design : basicOnly(design);
  const cost = qrCost(dynamic, permanent, premium);
  const enough = credits >= cost;
  const previewData = useMemo(
    () => (dynamic ? `${SITE_URL}/q/xxxxxxx` : buildStaticPayload(type, content) || " "),
    [dynamic, type, content]
  );

  async function create() {
    setError("");
    const v = validate(type, content);
    if (v) return setError(v);
    if (!enough) return setError("Créditos insuficientes.");
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_qr", {
      p_name: name || def.label,
      p_type: type,
      p_content: content,
      p_destination: dynamic ? buildDestination(type, content) : null,
      p_design: effDesign,
      p_has_design: dynamic && premium,
      p_permanent: dynamic && permanent,
    });
    setBusy(false);
    if (error) return setError(error.message);
    router.push(`/painel/qr/${(data as { id: string }).id}?novo=1`);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-3xl font-bold">Criar QR Code</h1>
          <p className="text-mute text-sm mt-1">Você tem <span className="text-signal font-semibold">{credits} créditos</span>.</p>
        </div>

        <Section n={1} title="Tipo">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TYPES.map((t) => {
              const Icon = ICONS[t.id];
              const on = t.id === type;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setType(t.id);
                    setContent({ security: "WPA" });
                  }}
                  className={`text-left rounded-2xl border p-4 transition-colors ${on ? "border-signal/60 bg-signal/[0.06]" : "border-edge hover:border-white/20"}`}
                >
                  <Icon size={24} weight="duotone" className={t.dynamic ? "text-signal" : "text-violet"} />
                  <p className="font-semibold text-sm mt-2">{t.label}</p>
                  <p className="text-xs text-mute mt-0.5 leading-snug">{t.short}</p>
                </button>
              );
            })}
          </div>
          {!dynamic && (
            <p className="text-xs text-mute mt-4 rounded-xl bg-violet/10 border border-violet/20 px-3 py-2">
              {def.label} é sempre <strong className="text-ink">estático e gratuito</strong>: o celular precisa ler os dados direto no código,
              então não há relatório de leituras, validade ou troca de conteúdo depois de impresso.
            </p>
          )}
        </Section>

        <Section n={2} title="Conteúdo">
          <div className="space-y-4">
            <div>
              <label className="label">Nome interno (só você vê)</label>
              <input className="input" maxLength={80} placeholder={`Ex.: ${def.label} · Cliente Padaria Sol`} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <ContentFields type={type} value={content} onChange={setContent} />
          </div>
        </Section>

        <Section
          n={3}
          title="Aparência"
          aside={
            dynamic ? (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={premium} onChange={(e) => setPremium(e.target.checked)} className="accent-[#6ff5c6]" />
                <Sparkle size={16} className="text-ping" weight="fill" /> Design completo <span className="text-mute">+{COSTS.design}</span>
              </label>
            ) : null
          }
        >
          <DesignFields design={effDesign} onChange={setDesign} premium={dynamic && premium} canPremium={dynamic} />
        </Section>

        {dynamic && (
          <Section n={4} title="Validade">
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { v: false, icon: CalendarBlank, t: "30 dias", d: "Ideal para campanhas e promoções. Renovável.", c: COSTS.temp },
                { v: true, icon: InfinityIcon, t: "Permanente", d: "Nunca expira. Para embalagens, fachadas e cartões.", c: COSTS.permanent },
              ].map((o) => (
                <button
                  key={o.t}
                  type="button"
                  onClick={() => setPermanent(o.v)}
                  className={`text-left rounded-2xl border p-4 transition-colors ${permanent === o.v ? "border-signal/60 bg-signal/[0.06]" : "border-edge hover:border-white/20"}`}
                >
                  <div className="flex items-center justify-between">
                    <o.icon size={22} className="text-signal" weight="duotone" />
                    <span className="font-mono text-sm">{o.c} créditos</span>
                  </div>
                  <p className="font-semibold mt-2">{o.t}</p>
                  <p className="text-xs text-mute mt-0.5">{o.d}</p>
                </button>
              ))}
            </div>
          </Section>
        )}
      </div>

      <aside className="lg:sticky lg:top-32 space-y-4">
        <div className="card p-5">
          <div className="rounded-2xl bg-white/[0.03] p-3">
            <QrPreview data={previewData} design={effDesign} />
          </div>
          {dynamic && <p className="text-[11px] text-mute mt-2 text-center">Pré-visualização. O código definitivo é gerado ao criar.</p>}

          <div className="mt-5 space-y-2 text-sm">
            {dynamic ? (
              <>
                <div className="flex justify-between"><span className="text-mute">{permanent ? "Permanente" : "30 dias"}</span><span>{permanent ? COSTS.permanent : COSTS.temp}</span></div>
                {premium && <div className="flex justify-between"><span className="text-mute">Design completo</span><span>{COSTS.design}</span></div>}
              </>
            ) : (
              <div className="flex justify-between"><span className="text-mute">QR estático</span><span>Grátis</span></div>
            )}
            <div className="flex justify-between border-t border-edge pt-2 font-semibold">
              <span>Total</span>
              <span className="font-mono">{cost} {cost === 1 ? "crédito" : "créditos"}</span>
            </div>
            <div className="flex justify-between text-xs text-mute"><span>Saldo depois</span><span>{Math.max(credits - cost, 0)}</span></div>
          </div>

          {error && <p className="text-sm text-danger bg-danger/10 rounded-xl px-3 py-2 mt-4">{error}</p>}

          {enough ? (
            <button onClick={create} disabled={busy} className="btn btn-primary w-full mt-5">
              {busy ? "Criando..." : "Criar QR Code"}
            </button>
          ) : (
            <div className="mt-5 space-y-2">
              <p className="text-sm text-ping">Faltam {cost - credits} créditos.</p>
              {BUY_URL ? (
                <a href={BUY_URL} target="_blank" rel="noreferrer" className="btn btn-primary w-full">Comprar créditos</a>
              ) : (
                <Link href="/painel/creditos" className="btn btn-primary w-full">Obter créditos</Link>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
