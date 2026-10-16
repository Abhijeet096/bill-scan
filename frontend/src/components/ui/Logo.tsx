import Link from 'next/link';
import { BRAND } from '../../lib/brand';

/** Corner-bracket mark: reads as a scan frame with a bill line through it. */
export const LogoMark: React.FC<{ className?: string }> = ({ className = 'h-9 w-9' }) => (
  <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
    <rect width="36" height="36" rx="10" className="fill-brand" />
    <path
      d="M10 14v-2.5A1.5 1.5 0 0 1 11.5 10H14M22 10h2.5a1.5 1.5 0 0 1 1.5 1.5V14M26 22v2.5a1.5 1.5 0 0 1-1.5 1.5H22M14 26h-2.5A1.5 1.5 0 0 1 10 24.5V22"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M13 18h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Logo: React.FC<{ href?: string; light?: boolean }> = ({ href = '/', light }) => (
  <Link href={href} className="inline-flex items-center gap-2.5" aria-label={`${BRAND.name} home`}>
    <LogoMark />
    <span className={`font-display text-xl font-bold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
      {BRAND.name}
    </span>
  </Link>
);
