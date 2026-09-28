import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slug } from "@/lib/slug";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: qr } = await supabase.from("qr_codes").select("name").eq("id", id).maybeSingle();
  if (!qr) return new NextResponse("Não encontrado", { status: 404 });

  const rows: Record<string, unknown>[] = [];
  for (let from = 0; from < 100000; from += 1000) {
    const { data } = await supabase
      .from("scans")
      .select("scanned_at, is_unique, city, region, country, device, os, browser")
      .eq("qr_id", id)
      .order("scanned_at", { ascending: false })
      .range(from, from + 999);
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < 1000) break;
  }

  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = ["Data", "Hora", "Visitante único", "Cidade", "Estado", "País", "Aparelho", "Sistema", "Navegador"];
  const lines = rows.map((r) => {
    const d = new Date(r.scanned_at as string);
    return [
      d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      d.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      r.is_unique ? "Sim" : "Não",
      r.city, r.region, r.country, r.device, r.os, r.browser,
    ].map(cell).join(";");
  });
  // BOM + ponto e vírgula: abre certinho no Excel em português
  const csv = "﻿" + [header.map(cell).join(";"), ...lines].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leituras-${slug(qr.name)}.csv"`,
    },
  });
}
