"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function MonthlyToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={on}
        className="mt-1 accent-[#6ff5c6]"
        onChange={async (e) => {
          const v = e.target.checked;
          setOn(v);
          const {
            data: { user },
          } = await createClient().auth.getUser();
          await createClient().from("profiles").update({ monthly_report: v }).eq("id", user!.id);
        }}
      />
      <span>
        <span className="font-semibold block">Resumo mensal por e-mail</span>
        <span className="text-sm text-mute">Todo dia 1º, um resumo das leituras de todos os seus QR Codes no mês anterior.</span>
      </span>
    </label>
  );
}
