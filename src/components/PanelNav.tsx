"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/painel", label: "Meus QR Codes" },
  { href: "/painel/novo", label: "Criar" },
  { href: "/painel/creditos", label: "Créditos" },
  { href: "/painel/conta", label: "Conta" },
];

export function PanelNav({ email }: { email: string }) {
  const path = usePathname();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto">
      <nav className="flex gap-1 text-sm">
        {LINKS.map((l) => {
          const active = l.href === "/painel" ? path === "/painel" || path.startsWith("/painel/qr") : path.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-3 border-b-2 whitespace-nowrap transition-colors ${
                active ? "border-signal text-ink" : "border-transparent text-mute hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <span className="text-xs text-mute truncate hidden md:block">{email}</span>
    </div>
  );
}
