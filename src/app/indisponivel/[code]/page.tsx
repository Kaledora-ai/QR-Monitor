import { StatusPage } from "@/components/StatusPage";

export const metadata = { title: "QR Code indisponível", robots: { index: false } };

export default function Unavailable() {
  return (
    <StatusPage
      title="QR Code indisponível"
      text="Este QR Code está pausado pelo responsável ou não existe mais. Tente novamente mais tarde ou fale com quem divulgou o código."
    />
  );
}
