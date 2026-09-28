import Link from "next/link";
import { StatusPage } from "@/components/StatusPage";

export const metadata = { title: "QR Code expirado", robots: { index: false } };

export default function Expired() {
  return (
    <StatusPage
      title="Este QR Code expirou"
      text="O prazo deste QR Code terminou. Se ele é seu, entre na sua conta para renová-lo: a mesma imagem impressa volta a funcionar na hora."
    >
      <div className="mt-6 grid gap-2">
        <Link href="/painel" className="btn btn-primary">Sou o dono · Renovar</Link>
        <Link href="/painel/creditos" className="btn btn-ghost">Comprar créditos</Link>
      </div>
    </StatusPage>
  );
}
