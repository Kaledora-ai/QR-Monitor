import { createClient } from "@/lib/supabase/server";
import { CouponForm } from "@/components/CouponForm";
import { BUY_URL, COSTS, PACKAGES } from "@/lib/site";

export const metadata = { title: "Créditos" };

export default async function Credits() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: profile }, { data: ledger }] = await Promise.all([
    supabase.from("profiles").select("credits").eq("id", user!.id).maybeSingle(),
    supabase.from("credit_ledger").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-signal/15 blur-3xl" />
          <p className="text-sm text-mute">Seu saldo</p>
          <p className="font-mono text-6xl font-bold text-signal mt-2">{profile?.credits ?? 0}</p>
          <p className="text-sm text-mute mt-1">créditos · não vencem</p>
          <div className="mt-6">
            <CouponForm />
          </div>
        </div>
        <div className="card p-6">
          <p className="font-display font-bold text-lg">Comprar créditos</p>
          {!BUY_URL && (
            <p className="text-sm text-ping mt-1">Pagamento online em breve. Enquanto isso, use um cupom.</p>
          )}
          <div className="grid gap-3 sm:grid-cols-3 mt-5">
            {PACKAGES.map((p) => (
              <div key={p.credits} className={`rounded-2xl border p-4 ${p.featured ? "border-signal/50" : "border-edge"}`}>
                <p className="font-mono text-2xl font-bold">{p.credits}</p>
                <p className="text-xs text-mute">créditos</p>
                <p className="font-bold mt-3">R$ {p.price}</p>
                {BUY_URL ? (
                  <a href={BUY_URL} target="_blank" rel="noreferrer" className="btn btn-primary w-full !py-2 text-sm mt-3">Comprar</a>
                ) : (
                  <button disabled className="btn btn-ghost w-full !py-2 text-sm mt-3">Em breve</button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-mute mt-5">
            QR 30 dias: {COSTS.temp} · Permanente: {COSTS.permanent} · Design completo: +{COSTS.design} · Renovação: {COSTS.renew}
          </p>
        </div>
      </div>

      <div className="card p-6">
        <p className="font-display font-bold text-lg mb-4">Extrato</p>
        {!ledger?.length ? (
          <p className="text-sm text-mute">Sem movimentações.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-white/5">
              {ledger.map((l) => (
                <tr key={l.id}>
                  <td className="py-2.5 text-mute whitespace-nowrap pr-4">
                    {new Date(l.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" })}
                  </td>
                  <td className="py-2.5 w-full">{l.reason}{l.reason === "Cupom" && l.ref ? ` · ${l.ref}` : ""}</td>
                  <td className={`py-2.5 text-right font-mono font-semibold ${l.delta > 0 ? "text-signal" : ""}`}>
                    {l.delta > 0 ? "+" : ""}{l.delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
