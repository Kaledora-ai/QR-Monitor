import { createClient } from "@/lib/supabase/server";
import { MonthlyToggle } from "@/components/MonthlyToggle";
import Link from "next/link";

export const metadata = { title: "Conta" };

export default async function Account() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("monthly_report, created_at").eq("id", user!.id).maybeSingle();
  return (
    <div className="max-w-xl space-y-5">
      <h1 className="font-display text-3xl font-bold">Conta</h1>
      <div className="card p-6 space-y-2">
        <p className="label">E-mail</p>
        <p>{user!.email}</p>
        <p className="text-xs text-mute">Cliente desde {new Date(profile?.created_at || Date.now()).toLocaleDateString("pt-BR")}</p>
        <Link href="/nova-senha" className="text-sm text-signal hover:underline inline-block pt-2">Trocar senha</Link>
      </div>
      <div className="card p-6">
        <MonthlyToggle initial={profile?.monthly_report ?? true} />
      </div>
      <form action="/auth/sair" method="post">
        <button className="btn btn-ghost">Sair da conta</button>
      </form>
    </div>
  );
}
