"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CouponForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; m: string } | null>(null);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        setBusy(true);
        setMsg(null);
        const { data, error } = await createClient().rpc("redeem_coupon", { p_code: code });
        setBusy(false);
        if (error) setMsg({ ok: false, m: error.message });
        else {
          setMsg({ ok: true, m: `+${data} créditos adicionados!` });
          setCode("");
          router.refresh();
        }
      }}
    >
      <label className="label">Tem um cupom?</label>
      <div className="flex gap-2">
        <input className="input uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="CÓDIGO" />
        <button className="btn btn-primary !px-4" disabled={busy}>{busy ? "..." : "Usar"}</button>
      </div>
      {msg && <p className={`text-sm mt-2 ${msg.ok ? "text-signal" : "text-danger"}`}>{msg.m}</p>}
    </form>
  );
}
