"use client";
import { useState } from "react";
import type { Design } from "@/lib/qr-render";
import { uploadFile } from "@/lib/upload";
import { Lock } from "@phosphor-icons/react";

const DOTS: [Design["dots"], string][] = [
  ["square", "Quadrado"],
  ["rounded", "Arredondado"],
  ["dots", "Pontos"],
  ["classy", "Elegante"],
  ["classy-rounded", "Elegante suave"],
  ["extra-rounded", "Fluido"],
];
const CORNERS: [Design["corners"], string][] = [
  ["square", "Quadrado"],
  ["extra-rounded", "Arredondado"],
  ["dot", "Círculo"],
];
const FRAMES: [Design["frame"], string][] = [
  ["none", "Sem moldura"],
  ["bottom", "Chamada embaixo"],
  ["top", "Chamada em cima"],
  ["badge", "Selo"],
];

function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-edge px-3 py-2 cursor-pointer">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-8 rounded-lg bg-transparent cursor-pointer" />
      <span className="text-sm">
        <span className="text-mute block text-xs">{label}</span>
        <span className="font-mono text-xs uppercase">{value}</span>
      </span>
    </label>
  );
}

function Pills<T extends string>({ options, value, onChange, disabled }: { options: [T, string][]; value: T; onChange: (v: T) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([v, l]) => (
        <button
          type="button"
          key={v}
          disabled={disabled}
          onClick={() => onChange(v)}
          className={`chip !text-xs !px-3 !py-1.5 transition-colors disabled:opacity-40 ${value === v ? "!border-signal/60 !text-signal bg-signal/10" : "hover:text-ink"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function DesignFields({
  design,
  onChange,
  premium,
  canPremium = true,
}: {
  design: Design;
  onChange: (d: Design) => void;
  premium: boolean;
  canPremium?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const set = <K extends keyof Design>(k: K, v: Design[K]) => onChange({ ...design, [k]: v });
  const locked = !premium;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Color label="Cor do código" value={design.fg} onChange={(v) => set("fg", v)} />
        <Color label="Fundo" value={design.bg} onChange={(v) => set("bg", v)} />
      </div>

      {canPremium && (
        <div className={`space-y-6 ${locked ? "opacity-60" : ""}`}>
          {locked && (
            <p className="flex items-center gap-2 text-xs text-mute">
              <Lock size={14} /> Ative o design completo para liberar as opções abaixo.
            </p>
          )}
          <div>
            <p className="label">Logo no centro</p>
            <div className="flex items-center gap-3">
              <label className={`btn btn-ghost !py-2 text-sm ${locked ? "pointer-events-none" : "cursor-pointer"}`}>
                {uploading ? "Enviando..." : design.logo ? "Trocar logo" : "Enviar logo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  disabled={locked}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setErr("");
                    setUploading(true);
                    try {
                      set("logo", await uploadFile(f));
                    } catch (x) {
                      setErr(x instanceof Error ? x.message : "Falha no envio");
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>
              {design.logo && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={design.logo} alt="" className="h-10 w-10 rounded-lg object-contain bg-white p-1" />
                  <button type="button" className="text-xs text-mute hover:text-danger" onClick={() => set("logo", "")}>
                    Remover
                  </button>
                </>
              )}
            </div>
            {err && <p className="text-danger text-xs mt-1">{err}</p>}
            <p className="text-xs text-mute mt-2">Dica: PNG com fundo transparente fica melhor.</p>
          </div>

          <div>
            <p className="label">Formato dos pontos</p>
            <Pills options={DOTS} value={design.dots} onChange={(v) => set("dots", v)} disabled={locked} />
          </div>
          <div>
            <p className="label">Cantos</p>
            <Pills
              options={CORNERS}
              value={design.corners}
              onChange={(v) => onChange({ ...design, corners: v, cornerDots: v === "square" ? "square" : "dot" })}
              disabled={locked}
            />
          </div>

          <div>
            <label className={`flex items-center gap-2.5 text-sm ${locked ? "" : "cursor-pointer"}`}>
              <input type="checkbox" disabled={locked} checked={design.gradient} onChange={(e) => set("gradient", e.target.checked)} className="accent-[#6ff5c6]" />
              Degradê de cor
            </label>
            {design.gradient && (
              <div className="mt-3 max-w-[50%]">
                <Color label="Segunda cor" value={design.fg2} onChange={(v) => set("fg2", v)} />
              </div>
            )}
          </div>

          <div>
            <p className="label">Moldura com chamada</p>
            <Pills options={FRAMES} value={design.frame} onChange={(v) => set("frame", v)} disabled={locked} />
            {design.frame !== "none" && (
              <div className="grid grid-cols-[1fr_auto] gap-3 mt-3">
                <input
                  className="input"
                  maxLength={24}
                  value={design.frameText}
                  onChange={(e) => set("frameText", e.target.value.toUpperCase())}
                  placeholder="ESCANEIE AQUI"
                />
                <Color label="Moldura" value={design.frameColor} onChange={(v) => set("frameColor", v)} />
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-mute">
        Mantenha bom contraste entre o código e o fundo (código escuro em fundo claro) para garantir a leitura em qualquer celular.
      </p>
    </div>
  );
}
