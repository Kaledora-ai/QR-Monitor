import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "QR Monitor — QR Codes com relatório de acessos",
    template: "%s · QR Monitor",
  },
  description:
    "Crie QR Codes personalizados com a sua logo e acompanhe quantas pessoas escanearam, de onde e por qual aparelho. Comece grátis com 10 créditos.",
  openGraph: {
    title: "QR Monitor — cada leitura, monitorada",
    description: "QR Codes dinâmicos com relatório de acessos, validade e personalização.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#05070f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
