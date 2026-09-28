import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { PanelNav } from "@/components/PanelNav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: profile } = await supabase.from("profiles").select("credits").eq("id", user.id).maybeSingle();

  return (
    <div className="min-h-screen bg-night">
      <header className="no-print sticky top-0 z-40 border-b border-white/5 bg-night/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Logo href="/painel" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/painel/creditos"
              className="chip !text-sm !py-1.5 !px-3 !text-signal !border-signal/30 bg-signal/5 hover:bg-signal/10"
              title="Seus créditos"
            >
              <span className="font-mono font-bold">{profile?.credits ?? 0}</span> créditos
            </Link>
            <Link href="/painel/novo" className="btn btn-primary !py-2 !px-4 text-sm hidden sm:inline-flex">
              Novo QR Code
            </Link>
          </div>
        </div>
        <PanelNav email={user.email || ""} />
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
