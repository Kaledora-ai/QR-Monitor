import { SiteNav, SiteFooter } from "./SiteChrome";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="sky min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <h1 className="font-display text-4xl font-bold">{title}</h1>
        <p className="text-sm text-mute mt-2">Última atualização: {updated}</p>
        <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-ink/85 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_h2]:pt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

// Preencher quando o CNPJ for aberto
export const CONTROLLER = "[RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ]";
export const CONTACT = "contato@qrmonitor.com.br";
