import { notFound } from "next/navigation";
import { getVcard } from "@/lib/public-qr";
import { normalizePhone, normalizeUrl } from "@/lib/qr-types";
import { LogoMark } from "@/components/Logo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contato", robots: { index: false } };

export default async function Contact({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const c = await getVcard(code);
  if (!c) notFound();
  const initials = (c.name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const rows: [string, string, string][] = [];
  if (c.phone) rows.push(["Telefone", c.phone, `tel:+${normalizePhone(c.phone)}`]);
  if (c.phone) rows.push(["WhatsApp", c.phone, `https://wa.me/${normalizePhone(c.phone)}`]);
  if (c.email) rows.push(["E-mail", c.email, `mailto:${c.email}`]);
  if (c.website) rows.push(["Site", c.website, normalizeUrl(c.website)]);
  if (c.address) rows.push(["Endereço", c.address, `https://maps.google.com/?q=${encodeURIComponent(c.address)}`]);

  return (
    <div className="sky min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm card p-7 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-signal to-violet flex items-center justify-center font-display text-2xl font-extrabold text-night">
          {initials}
        </div>
        <h1 className="font-display text-2xl font-bold mt-4">{c.name}</h1>
        {(c.title || c.company) && <p className="text-mute text-sm mt-1">{[c.title, c.company].filter(Boolean).join(" · ")}</p>}
        <a href={`/api/vcard/${code}`} className="btn btn-primary w-full mt-6">Salvar contato</a>
        <ul className="mt-6 space-y-2 text-left">
          {rows.map(([l, v, href]) => (
            <li key={l}>
              <a href={href} target="_blank" rel="noreferrer" className="block rounded-xl border border-edge px-4 py-3 hover:border-signal/40">
                <span className="text-xs text-mute block">{l}</span>
                <span className="text-sm break-words">{v}</span>
              </a>
            </li>
          ))}
        </ul>
        <a href="/" className="mt-8 inline-flex items-center gap-2 text-xs text-mute hover:text-ink">
          <LogoMark size={16} /> Feito com QR Monitor
        </a>
      </div>
    </div>
  );
}
