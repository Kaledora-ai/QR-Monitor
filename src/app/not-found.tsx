import Link from "next/link";
import { StatusPage } from "@/components/StatusPage";

export default function NotFound() {
  return (
    <StatusPage title="Página não encontrada" text="O endereço que você acessou não existe.">
      <Link href="/" className="btn btn-primary mt-6">Ir para o início</Link>
    </StatusPage>
  );
}
