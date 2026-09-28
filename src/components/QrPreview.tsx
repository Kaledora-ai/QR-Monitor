"use client";
import { useEffect, useState } from "react";
import { buildSvg, download, type Design } from "@/lib/qr-render";
import { DownloadSimple } from "@phosphor-icons/react";

function fitSvg(svg: string, w: number, h: number) {
  return svg.replace(/<svg\b[^>]*>/, (tag) => {
    let t = tag.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    if (!/viewBox=/.test(t)) t = t.replace(/<svg\b/, `<svg viewBox="0 0 ${w} ${h}"`);
    return t.replace(/<svg\b/, '<svg width="100%"');
  });
}

export function QrPreview({ data, design, className = "" }: { data: string; design: Design; className?: string }) {
  const [svg, setSvg] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      try {
        const r = await buildSvg(data, design, 600);
        if (alive) {
          setSvg(fitSvg(r.svg, r.w, r.h));
          setErr("");
        }
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : "Erro ao gerar");
      }
    }, 150);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [data, design]);

  return (
    <div className={`relative ${className}`}>
      {err ? (
        <div className="text-danger text-sm p-6 text-center">{err}</div>
      ) : svg ? (
        <div className="w-full [&>svg]:w-full [&>svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="aspect-square w-full rounded-2xl bg-white/5 animate-pulse" />
      )}
    </div>
  );
}

export function DownloadButtons({ data, design, name }: { data: string; design: Design; name: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const go = async (f: "png" | "svg" | "pdf") => {
    setBusy(f);
    try {
      await download(f, data, design, name);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha no download");
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="grid grid-cols-3 gap-2">
      {(["png", "svg", "pdf"] as const).map((f) => (
        <button key={f} onClick={() => go(f)} disabled={!!busy} className="btn btn-ghost !px-3 !py-2 text-sm">
          <DownloadSimple size={16} weight="bold" />
          {busy === f ? "..." : f.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
