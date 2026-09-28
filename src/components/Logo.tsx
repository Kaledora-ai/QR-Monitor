import Link from "next/link";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="3" y="9" width="26" height="26" rx="7" stroke="#e9edf8" strokeWidth="3.2" />
      <rect x="10" y="16" width="12" height="12" rx="3" fill="#6ff5c6" />
      <path d="M29 3.5a9.5 9.5 0 0 1 7.5 7.5" stroke="#6ff5c6" strokeWidth="3" strokeLinecap="round" />
      <path d="M29 9.2a4 4 0 0 1 1.8 1.8" stroke="#8f7cff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 group" aria-label="QR Monitor — início">
      <LogoMark />
      <span className="font-display text-[1.15rem] tracking-tight whitespace-nowrap">
        <span className="font-extrabold">QR</span>
        <span className="font-medium text-mute group-hover:text-ink transition-colors"> Monitor</span>
      </span>
    </Link>
  );
}
