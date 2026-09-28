import Link from "next/link";
import {
  ChartLineUp,
  PencilSimpleLine,
  Printer,
  Link as LinkIcon,
  WhatsappLogo,
  InstagramLogo,
  IdentificationCard,
  FilePdf,
  ForkKnife,
  WifiHigh,
  CurrencyCircleDollar,
  Broadcast,
  MapPin,
  DeviceMobile,
  Clock,
  ShareNetwork,
  Check,
} from "@phosphor-icons/react/dist/ssr";
import { SiteNav, SiteFooter } from "@/components/SiteChrome";
import { HeroRadar } from "@/components/HeroRadar";
import { FreeGenerator } from "@/components/FreeGenerator";
import { COSTS, PACKAGES } from "@/lib/site";

const STEPS = [
  {
    icon: PencilSimpleLine,
    t: "Crie e personalize",
    d: "Escolha o tipo, coloque a logo do cliente, as cores da marca e uma moldura com chamada.",
  },
  {
    icon: Printer,
    t: "Imprima onde quiser",
    d: "Cardápio, vitrine, panfleto, embalagem, cartão. Baixe em PNG, SVG ou PDF em alta resolução.",
  },
  {
    icon: ChartLineUp,
    t: "Acompanhe cada leitura",
    d: "Veja quantas pessoas escanearam, em que cidade, de qual aparelho e em que horário.",
  },
];

const TYPES = [
  { icon: LinkIcon, t: "Site / Link", tracked: true },
  { icon: WhatsappLogo, t: "WhatsApp", tracked: true },
  { icon: InstagramLogo, t: "Instagram", tracked: true },
  { icon: IdentificationCard, t: "Cartão de visita", tracked: true },
  { icon: FilePdf, t: "PDF", tracked: true },
  { icon: ForkKnife, t: "Cardápio", tracked: true },
  { icon: WifiHigh, t: "Wi-Fi", tracked: false },
  { icon: CurrencyCircleDollar, t: "PIX", tracked: false },
];

const FAQ = [
  {
    q: "Qual a diferença entre QR Code estático e dinâmico?",
    a: "O estático grava o destino direto na imagem: é grátis, mas não conta acessos e não pode ser alterado depois de impresso. O dinâmico passa pelo QR Monitor antes de chegar ao destino. É isso que permite contar as leituras, trocar o link a qualquer momento e definir validade.",
  },
  {
    q: "Posso trocar o link depois de imprimir?",
    a: "Sim, nos QR Codes dinâmicos. A imagem impressa continua a mesma e passa a levar para o novo destino na hora, sem custo.",
  },
  {
    q: "O que acontece quando um QR Code de 30 dias vence?",
    a: "Quem escanear vê um aviso de que o código expirou. Você recebe um e-mail 3 dias antes e pode renovar por mais 30 dias ou torná-lo permanente com créditos. Ao renovar, a mesma imagem impressa volta a funcionar.",
  },
  {
    q: "Por que Wi-Fi e PIX não têm relatório?",
    a: "O celular só conecta ao Wi-Fi e o aplicativo do banco só lê o PIX se os dados estiverem gravados direto no código, sem passar por um endereço intermediário. Por isso esses dois tipos são sempre estáticos, gratuitos e sem contagem.",
  },
  {
    q: "Os créditos vencem?",
    a: "Não. Créditos comprados ou ganhos ficam na sua conta para sempre.",
  },
  {
    q: "Consigo mostrar o relatório para o meu cliente?",
    a: "Sim. Cada QR Code tem um link de relatório público que você pode enviar ao cliente. Ele vê os números sem precisar de conta. Também dá para exportar em CSV ou PDF.",
  },
  {
    q: "Vocês guardam dados de quem escaneia?",
    a: "Guardamos apenas dados agregados: cidade aproximada, tipo de aparelho, sistema e horário. O endereço IP não é armazenado; usamos uma impressão digital irreversível só para estimar visitantes únicos.",
  },
];

export default function Home() {
  return (
    <div className="sky">
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="grid-lines absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-20 sm:pt-20 grid gap-14 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="rise">
            <span className="chip !text-signal !border-signal/30 bg-signal/5">
              <Broadcast size={14} weight="bold" /> 10 créditos grátis para começar
            </span>
            <h1 className="font-display font-extrabold tracking-tight text-[2.6rem] leading-[1.03] sm:text-6xl mt-5">
              Seu QR Code impresso.
              <br />
              <span className="glow-text">Cada leitura, monitorada.</span>
            </h1>
            <p className="mt-6 text-lg text-mute max-w-xl leading-relaxed">
              Crie QR Codes com a logo e as cores da marca, imprima onde quiser e descubra quantas pessoas escanearam, de
              onde e quando. Trocou o link? A imagem impressa continua valendo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cadastro" className="btn btn-primary text-base !px-6 !py-3">
                Criar meu QR Code
              </Link>
              <a href="#gerador" className="btn btn-ghost text-base !px-6 !py-3">
                Gerar um grátis sem cadastro
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mute">
              <span className="flex items-center gap-2"><Check size={16} className="text-signal" weight="bold" /> Sem mensalidade</span>
              <span className="flex items-center gap-2"><Check size={16} className="text-signal" weight="bold" /> Créditos não vencem</span>
              <span className="flex items-center gap-2"><Check size={16} className="text-signal" weight="bold" /> Relatório para o cliente</span>
            </div>
          </div>
          <div className="pb-6">
            <HeroRadar />
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <p className="text-signal text-sm font-semibold tracking-widest uppercase">Como funciona</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 max-w-2xl">
          Do papel ao relatório em três passos
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.t} className="card p-7 relative overflow-hidden">
              <span className="absolute -right-3 -top-6 font-display text-[7rem] font-extrabold text-white/[0.03] leading-none">
                {i + 1}
              </span>
              <s.icon size={30} weight="duotone" className="text-signal" />
              <h3 className="font-display text-xl font-bold mt-5">{s.t}</h3>
              <p className="text-mute mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RELATÓRIO */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="card p-6 sm:p-10 grid gap-10 lg:grid-cols-[1fr_1.2fr] items-center overflow-hidden relative">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet/20 blur-3xl pointer-events-none" />
          <div className="relative">
            <p className="text-signal text-sm font-semibold tracking-widest uppercase">Relatórios</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3">Prove que a divulgação funcionou</h2>
            <p className="text-mute mt-4 leading-relaxed">
              Mostre ao seu cliente, com números, quantas pessoas chegaram pelo panfleto, pela vitrine ou pelo cartão.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                [ChartLineUp, "Leituras totais e visitantes únicos por dia"],
                [MapPin, "Cidade e estado de quem escaneou"],
                [DeviceMobile, "Aparelho, sistema e navegador"],
                [Clock, "Horários de maior movimento"],
                [ShareNetwork, "Link público, CSV, PDF e resumo mensal por e-mail"],
              ].map(([I, t]) => {
                const Icon = I as typeof MapPin;
                return (
                  <li key={t as string} className="flex items-center gap-3">
                    <Icon size={18} className="text-signal shrink-0" weight="bold" /> {t as string}
                  </li>
                );
              })}
            </ul>
          </div>
          <ReportMock />
        </div>
      </section>

      {/* TIPOS */}
      <section id="tipos" className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <p className="text-signal text-sm font-semibold tracking-widest uppercase">Tipos de QR Code</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3">Um código para cada situação</h2>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {TYPES.map((t) => (
            <div key={t.t} className="card p-5 hover:border-signal/40 transition-colors">
              <t.icon size={28} weight="duotone" className={t.tracked ? "text-signal" : "text-violet"} />
              <p className="font-semibold mt-4">{t.t}</p>
              <p className={`text-xs mt-1 ${t.tracked ? "text-signal/80" : "text-mute"}`}>
                {t.tracked ? "Com relatório e validade" : "Estático e gratuito"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* GERADOR GRÁTIS */}
      <section id="gerador" className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <p className="text-signal text-sm font-semibold tracking-widest uppercase">Gerador gratuito</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 mb-8">Precisa só de um QR simples? Faça aqui mesmo.</h2>
        <FreeGenerator />
      </section>

      {/* PREÇOS */}
      <section id="precos" className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <p className="text-signal text-sm font-semibold tracking-widest uppercase">Preços</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3">Pague só pelo que usar</h2>
        <p className="text-mute mt-3 max-w-2xl">
          Sem mensalidade. Você compra créditos e usa quando precisar. Toda conta nova ganha {COSTS.signup} créditos.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="card p-6">
            <p className="font-display font-bold text-lg mb-4">Quanto custa cada QR Code</p>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-white/5">
                {[
                  ["QR estático (link, Wi-Fi, PIX, texto)", "Grátis"],
                  ["QR dinâmico com relatório · 30 dias", `${COSTS.temp} créditos`],
                  ["QR dinâmico com relatório · permanente", `${COSTS.permanent} créditos`],
                  ["Design completo (logo, moldura, formatos, degradê)", `+${COSTS.design} créditos`],
                  ["Renovar por mais 30 dias", `${COSTS.renew} créditos`],
                  ["Trocar o destino depois de impresso", "Grátis"],
                ].map(([a, b]) => (
                  <tr key={a}>
                    <td className="py-3 pr-4 text-mute">{a}</td>
                    <td className="py-3 text-right font-semibold whitespace-nowrap">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {PACKAGES.map((p) => (
              <div
                key={p.credits}
                className={`card p-6 flex flex-col ${p.featured ? "!border-signal/50 shadow-[0_0_60px_-20px_#6ff5c655]" : ""}`}
              >
                <span className={`chip self-start ${p.featured ? "!text-signal !border-signal/40" : ""}`}>{p.tag}</span>
                <p className="font-display text-4xl font-extrabold mt-5">{p.credits}</p>
                <p className="text-mute text-sm">créditos</p>
                <p className="mt-5 text-2xl font-bold">R$ {p.price}</p>
                <p className="text-xs text-mute">R$ {p.per} por crédito</p>
                <Link href="/cadastro" className={`btn mt-6 ${p.featured ? "btn-primary" : "btn-ghost"}`}>
                  Começar grátis
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="duvidas" className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <p className="text-signal text-sm font-semibold tracking-widest uppercase text-center">Dúvidas</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 text-center mb-10">Perguntas frequentes</h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="card group px-6 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer list-none flex justify-between items-center gap-4 font-semibold">
                {f.q}
                <span className="text-signal text-xl transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-mute mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-20">
        <div className="card p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(600px_220px_at_50%_0%,#6ff5c61f,transparent)]" />
          <h2 className="relative font-display text-3xl sm:text-5xl font-extrabold">
            Comece hoje com <span className="glow-text">10 créditos grátis</span>
          </h2>
          <p className="relative text-mute mt-4">Suficiente para dois QR Codes com a logo do seu cliente e relatório completo.</p>
          <Link href="/cadastro" className="relative btn btn-primary text-base !px-7 !py-3 mt-8">
            Criar conta grátis
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function ReportMock() {
  const bars = [22, 30, 26, 40, 35, 52, 48, 61, 55, 70, 64, 82, 76, 90];
  return (
    <div className="relative card !rounded-2xl p-5 bg-deep/80">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-mute">Cardápio · Pizzaria Bella Nona</p>
          <p className="font-mono text-3xl font-bold mt-1">2.417</p>
          <p className="text-xs text-signal">+38% vs. mês anterior</p>
        </div>
        <span className="chip !text-signal !border-signal/30">Ativo</span>
      </div>
      <div className="mt-6 h-32 flex items-end gap-1.5">
        {bars.map((b, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-gradient-to-t from-violet/60 to-signal"
            style={{ height: `${b}%`, opacity: 0.35 + (i / bars.length) * 0.65 }}
          />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
        {[
          ["Celular", "91%"],
          ["São Paulo", "64%"],
          ["Pico", "20h"],
        ].map(([a, b]) => (
          <div key={a} className="rounded-xl bg-white/[0.03] p-3">
            <p className="text-mute">{a}</p>
            <p className="font-mono font-bold text-base mt-1">{b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
