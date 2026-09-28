"use client";
import { FilePdf } from "@phosphor-icons/react";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn btn-ghost !py-2 text-sm no-print">
      <FilePdf size={16} /> Salvar em PDF
    </button>
  );
}
