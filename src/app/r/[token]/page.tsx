import { Logo } from "@/components/Logo";
import { ReportView } from "@/components/ReportView";
import { PrintButton } from "@/components/PrintButton";

export const metadata = { title: "Relatório de leituras", robots: { index: false } };

export default async function PublicReport({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <div className="sky min-h-screen">
      <header className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />
        <PrintButton />
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 print-dark-text">
        <ReportView token={token} />
        <p className="text-xs text-mute mt-10 no-print">
          Relatório gerado pelo QR Monitor. <a href="/" className="text-signal hover:underline">Crie o seu QR Code monitorado</a>.
        </p>
      </main>
    </div>
  );
}
