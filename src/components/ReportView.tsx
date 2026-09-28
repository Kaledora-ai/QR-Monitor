"use client";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { createClient } from "@/lib/supabase/client";

type KV = { k: string; total: number };
export type Report = {
  qr: { id: string; name: string; type: string; code: string; created_at: string; expires_at: string | null; is_permanent: boolean; status: string };
  total_all_time: number;
  total: number;
  unique: number;
  by_day: { d: string; total: number; unique: number }[];
  by_hour: { h: number; total: number }[];
  by_city: KV[];
  by_region: KV[];
  by_device: KV[];
  by_os: KV[];
  by_browser: KV[];
};

const PERIODS = [
  { v: 7, l: "7 dias" },
  { v: 30, l: "30 dias" },
  { v: 90, l: "90 dias" },
  { v: 365, l: "12 meses" },
];

function fillDays(rows: Report["by_day"], days: number) {
  const map = new Map(rows.map((r) => [r.d, r]));
  const out: { d: string; label: string; total: number; unique: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(now.getTime() - i * 86400000);
    const key = dt.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
    const r = map.get(key);
    out.push({
      d: key,
      label: dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" }),
      total: r?.total || 0,
      unique: r?.unique || 0,
    });
  }
  return out;
}

function Bars({ title, rows }: { title: string; rows: KV[] }) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  const sum = rows.reduce((s, r) => s + r.total, 0) || 1;
  return (
    <div className="card p-5">
      <p className="font-semibold text-sm mb-4">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-mute">Sem dados no período.</p>
      ) : (
        <ul className="space-y-3">
          {rows.slice(0, 8).map((r) => (
            <li key={r.k}>
              <div className="flex justify-between text-sm gap-3">
                <span className="truncate">{r.k}</span>
                <span className="font-mono text-mute shrink-0">
                  {r.total} · {Math.round((r.total / sum) * 100)}%
                </span>
              </div>
              <div className="h-1.5 mt-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-violet to-signal" style={{ width: `${(r.total / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { background: "#0a0f1f", border: "1px solid #1c2540", borderRadius: 12, color: "#e9edf8", fontSize: 12 },
  labelStyle: { color: "#8d97b5" },
};

export function ReportView({ qrId, token, initialDays = 30 }: { qrId?: string; token?: string; initialDays?: number }) {
  const [days, setDays] = useState(initialDays);
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    createClient()
      .rpc("qr_report", { p_qr_id: qrId ?? null, p_token: token ?? null, p_days: days })
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setError(error.message);
        else setData(data as Report);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [qrId, token, days]);

  if (error) return <p className="text-danger text-sm">{error}</p>;
  const daily = data ? fillDays(data.by_day, Math.min(days, 90)) : [];
  const hours = Array.from({ length: 24 }, (_, h) => ({ h: `${h}h`, total: data?.by_hour.find((x) => x.h === h)?.total || 0 }));
  const peak = hours.reduce((a, b) => (b.total > a.total ? b : a), hours[0]);
  const topCity = data?.by_city[0]?.k;

  return (
    <div className={`space-y-5 transition-opacity ${loading ? "opacity-50" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <h2 className="font-display text-xl font-bold">Relatório de leituras</h2>
        <div className="flex gap-1 rounded-full border border-edge p-1">
          {PERIODS.map((p) => (
            <button
              key={p.v}
              onClick={() => setDays(p.v)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${days === p.v ? "bg-signal text-night" : "text-mute hover:text-ink"}`}
            >
              {p.l}
            </button>
          ))}
        </div>
      </div>
      <p className="hidden print:block text-sm">Período: últimos {days} dias</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Leituras no período", data?.total ?? 0],
          ["Visitantes únicos", data?.unique ?? 0],
          ["Desde a criação", data?.total_all_time ?? 0],
          ["Horário de pico", data && data.total > 0 ? peak.h : "—"],
        ].map(([l, v]) => (
          <div key={l as string} className="card p-4">
            <p className="text-xs text-mute">{l}</p>
            <p className="font-mono text-2xl font-bold mt-1">{typeof v === "number" ? v.toLocaleString("pt-BR") : v}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-sm">Leituras por dia</p>
          <div className="flex gap-4 text-xs text-mute">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-signal" /> Total</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet" /> Únicos</span>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily} margin={{ left: -20, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6ff5c6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6ff5c6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ffffff0d" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#8d97b5", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={16} />
              <YAxis allowDecimals={false} tick={{ fill: "#8d97b5", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="total" name="Total" stroke="#6ff5c6" strokeWidth={2} fill="url(#gT)" />
              <Area type="monotone" dataKey="unique" name="Únicos" stroke="#8f7cff" strokeWidth={2} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <p className="font-semibold text-sm mb-4">Leituras por horário</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hours} margin={{ left: -20, right: 4 }}>
                <CartesianGrid stroke="#ffffff0d" vertical={false} />
                <XAxis dataKey="h" tick={{ fill: "#8d97b5", fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
                <YAxis allowDecimals={false} tick={{ fill: "#8d97b5", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="total" name="Leituras" fill="#8f7cff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <Bars title={`Cidades${topCity ? "" : ""}`} rows={data?.by_city || []} />
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Bars title="Estados" rows={data?.by_region || []} />
        <Bars title="Aparelho" rows={data?.by_device || []} />
        <Bars title="Sistema" rows={data?.by_os || []} />
        <Bars title="Navegador" rows={data?.by_browser || []} />
      </div>
      <p className="text-[11px] text-mute">
        Visitantes únicos são estimados (mesmo aparelho em 24 horas conta uma vez). A localização é aproximada, pela rede de internet.
      </p>
    </div>
  );
}
