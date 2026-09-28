import Link from "next/link";
import { Logo } from "./Logo";

export function StatusPage({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="sky min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <Logo />
      <div className="card p-8 mt-8 max-w-md w-full">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="text-mute mt-3 leading-relaxed">{text}</p>
        {children}
      </div>
      <Link href="/" className="text-xs text-mute mt-8 hover:text-ink">Crie QR Codes monitorados com o QR Monitor</Link>
    </div>
  );
}
