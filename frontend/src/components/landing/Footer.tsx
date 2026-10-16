import Link from 'next/link';
import { BRAND } from '../../lib/brand';
import { Logo } from '../ui/Logo';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { label: 'Shopper sign in', href: '/login?portal=customer' },
      { label: 'Store owner sign in', href: '/login?portal=owner' },
    ],
  },
];

export const Footer: React.FC = () => (
  <footer className="border-t border-line bg-surface">
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
      <div>
        <Logo />
        <p className="mt-4 max-w-xs text-sm text-muted">{BRAND.description}</p>
      </div>

      {COLUMNS.map((column) => (
        <div key={column.title}>
          <h3 className="font-sans text-sm font-semibold">{column.title}</h3>
          <ul className="mt-4 space-y-2.5">
            {column.links.map((link) => (
              <li key={link.label}>
                {link.href.startsWith('#') ? (
                  <a href={link.href} className="text-sm text-muted hover:text-ink">
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} className="text-sm text-muted hover:text-ink">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="border-t border-line">
      <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted sm:px-6">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </p>
    </div>
  </footer>
);
