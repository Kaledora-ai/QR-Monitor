"use client";
import { useMemo, useState } from "react";
import { QrPreview, DownloadButtons } from "./QrPreview";
import { DEFAULT_DESIGN } from "@/lib/qr-render";
import { buildStaticPayload, type Content, type QrType } from "@/lib/qr-types";

const TABS: { id: QrType; label: string }[] = [
  { id: "url", label: "Link" },
  { id: "wifi", label: "Wi-Fi" },
  { id: "pix", label: "PIX" },
];

export function FreeGenerator() {
  const [type, setType] = useState<QrType>("url");
  const [c, setC] = useState<Content>({ url: "", security: "WPA" });
  const [fg, setFg] = useState("#0a0f1f");
  const [bg, setBg] = useState("#ffffff");
  const set = (k: string, v: string | boolean) => setC((p) => ({ ...p, [k]: v }));
  const design = useMemo(() => ({ ...DEFAULT_DESIGN, fg, bg }), [fg, bg]);
  const data = useMemo(() => buildStaticPayload(type, c) || "https://qrmonitor.com.br", [type, c]);

  return (
    <div className="card p-5 sm:p-8 grid gap-8 md:grid-cols-[1fr_280px] items-start">
      <div className="space-y-5">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`chip !text-sm !px-4 !py-1.5 transition-colors ${type === t.id ? "!border-signal/60 !text-signal bg-signal/10" : "hover:text-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {type === "url" && (
          <div>
            <label className="label">Endereço da página</label>
            <input className="input" placeholder="www.suaempresa.com.br" value={(c.url as string) || ""} onChange={(e) => set("url", e.target.value)} />
          </div>
        )}
        {type === "wifi" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nome da rede</label>
              <input className="input" value={(c.ssid as string) || ""} onChange={(e) => set("ssid", e.target.value)} />
            </div>
            <div>
              <label className="label">Senha</label>
              <input className="input" value={(c.password as string) || ""} onChange={(e) => set("password", e.target.value)} />
            </div>
          </div>
        )}
        {type === "pix" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Chave PIX</label>
              <input className="input" placeholder="CPF, CNPJ, e-mail, telefone ou aleatória" value={(c.key as string) || ""} onChange={(e) => set("key", e.target.value)} />
            </div>
            <div>
              <label className="label">Nome do recebedor</label>
              <input className="input" value={(c.name as string) || ""} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label className="label">Cidade</label>
              <input className="input" value={(c.city as string) || ""} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <label className="label">Valor (opcional)</label>
              <input className="input" placeholder="25,00" value={(c.amount as string) || ""} onChange={(e) => set("amount", e.target.value)} />
            </div>
          </div>
        )}

        <div className="flex gap-6">
          <label className="flex items-center gap-3 text-sm text-mute">
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-9 rounded-lg bg-transparent cursor-pointer" />
            Cor do código
          </label>
          <label className="flex items-center gap-3 text-sm text-mute">
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-9 rounded-lg bg-transparent cursor-pointer" />
            Fundo
          </label>
        </div>

        <p className="text-xs text-mute leading-relaxed">
          QR Code estático: gratuito e sem validade, mas <strong className="text-ink">sem relatório de leituras</strong> e sem
          possibilidade de trocar o destino depois de impresso. Para acompanhar os acessos e colocar sua logo,{" "}
          <a href="/cadastro" className="text-signal hover:underline">crie uma conta grátis</a>.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-white/[0.03] p-3">
          <QrPreview data={data} design={design} />
        </div>
        <DownloadButtons data={data} design={design} name={type === "url" ? "link" : type} />
      </div>
    </div>
  );
}
