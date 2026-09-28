"use client";
import { QrPreview } from "./QrPreview";
import { mergeDesign } from "@/lib/qr-render";
import { qrData } from "@/lib/qr-data";
import type { QrRow } from "@/lib/format";

export function QrThumb({ qr }: { qr: QrRow }) {
  return (
    <div className="w-20 shrink-0 rounded-xl bg-white/[0.04] p-1.5 self-start">
      <QrPreview data={qrData(qr)} design={mergeDesign(qr.design)} />
    </div>
  );
}
