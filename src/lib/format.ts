export type QrRow = {
  id: string;
  code: string;
  name: string;
  type: string;
  is_dynamic: boolean;
  content: Record<string, string | boolean>;
  destination: string | null;
  design: Record<string, unknown>;
  has_design: boolean;
  is_permanent: boolean;
  expires_at: string | null;
  status: "active" | "paused";
  share_token: string;
  created_at: string;
};

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" });
}

export function daysLeft(iso: string | null) {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export function qrState(q: Pick<QrRow, "is_dynamic" | "is_permanent" | "expires_at" | "status">) {
  if (!q.is_dynamic) return { label: "Estático", tone: "violet" as const };
  if (q.status === "paused") return { label: "Pausado", tone: "mute" as const };
  const d = daysLeft(q.expires_at);
  if (q.is_permanent || d === null) return { label: "Permanente", tone: "signal" as const };
  if (d <= 0) return { label: "Expirado", tone: "danger" as const };
  if (d <= 5) return { label: `Vence em ${d} ${d === 1 ? "dia" : "dias"}`, tone: "ping" as const };
  return { label: `${d} dias restantes`, tone: "signal" as const };
}

export const TONE: Record<string, string> = {
  signal: "!text-signal !border-signal/30 bg-signal/5",
  violet: "!text-violet !border-violet/30 bg-violet/5",
  ping: "!text-ping !border-ping/40 bg-ping/5",
  danger: "!text-danger !border-danger/40 bg-danger/5",
  mute: "",
};
