import Link from "next/link";
import { Logo } from "./Logo";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-night/70 border-b border-white/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm text-mute">
          <a href="/#como-funciona" className="hover:text-ink transition-colors">Como funciona</a>
          <a href="/#tipos" className="hover:text-ink transition-colors">Tipos</a>
          <a href="/#precos" className="hover:text-ink transition-colors">Preços</a>
          <a href="/#duvidas" className="hover:text-ink transition-colors">Dúvidas</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/entrar" className="btn btn-ghost !py-2 !px-3 sm:!px-4 text-sm">Entrar</Link>
          <Link href="/cadastro" className="btn btn-primary !py-2 !px-4 text-sm"><span className="sm:hidden">Criar conta</span><span className="hidden sm:inline">Criar conta grátis</span></Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid gap-8 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-mute max-w-xs">
            QR Codes que você imprime uma vez e acompanha para sempre: quem escaneou, de onde e quando.
          </p>
        </div>
        <div className="text-sm space-y-2">
          <p className="text-ink font-semibold mb-3">Produto</p>
          <a href="/#precos" className="block text-mute hover:text-ink">Preços</a>
          <a href="/#duvidas" className="block text-mute hover:text-ink">Dúvidas frequentes</a>
          <Link href="/cadastro" className="block text-mute hover:text-ink">Criar conta</Link>
        </div>
        <div className="text-sm space-y-2">
          <p className="text-ink font-semibold mb-3">Legal</p>
          <Link href="/termos" className="block text-mute hover:text-ink">Termos de uso</Link>
          <Link href="/privacidade" className="block text-mute hover:text-ink">Privacidade</Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-10 text-xs text-mute/70">
        © {new Date().getFullYear()} QR Monitor. Todos os direitos reservados.
      </div>
    </footer>
  );
}
