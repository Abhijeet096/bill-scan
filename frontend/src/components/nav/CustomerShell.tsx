'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ScanLine, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Logo } from '../ui/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Loading } from '../ui/States';
import { CUSTOMER_LINKS } from './links';
import { useRoleGuard } from './useRoleGuard';

const CartBadge: React.FC<{ count: number }> = ({ count }) =>
  count > 0 ? (
    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
      {count}
    </span>
  ) : null;

export const CustomerShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ready } = useRoleGuard('customer');
  const { logout } = useAuth();
  const { cart, isOnline } = useCart();
  const pathname = usePathname();

  if (!ready) return <Loading />;

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isActive = (href: string) => pathname.startsWith(href);

  const [home, scan, cartLink, rewards, history] = CUSTOMER_LINKS;
  const mobileTabs = [home, history, scan, cartLink, rewards];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Logo href="/customer/home" />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {CUSTOMER_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(href) ? 'bg-brand-soft text-brand-fg' : 'text-muted hover:bg-sunken hover:text-ink'
                }`}
              >
                <span className="relative">
                  <Icon className="h-4 w-4" />
                  {href === cartLink.href && <CartBadge count={cartCount} />}
                </span>
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button onClick={logout} className="btn-icon" aria-label="Sign out">
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {!isOnline && (
        <div className="flex items-center justify-center gap-2 bg-warn-soft px-4 py-2 text-xs font-medium text-warn-fg">
          <WifiOff className="h-3.5 w-3.5" /> You&apos;re offline. Orders are saved and will sync when you reconnect.
        </div>
      )}

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 md:pb-12 md:pt-8">{children}</main>

      {/* Phone tab bar */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 backdrop-blur md:hidden" aria-label="Main">
        <ul className="mx-auto grid h-16 max-w-md grid-cols-5 items-center">
          {mobileTabs.map(({ href, label, icon: Icon }) => {
            if (href === scan.href) {
              return (
                <li key={href} className="flex justify-center">
                  <Link
                    href={href}
                    aria-label="Scan a product"
                    className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lift ring-4 ring-canvas"
                  >
                    <ScanLine className="h-6 w-6" />
                  </Link>
                </li>
              );
            }
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex flex-col items-center gap-1 py-1.5 text-[11px] font-medium ${
                    isActive(href) ? 'text-brand-fg' : 'text-muted'
                  }`}
                >
                  <span className="relative">
                    <Icon className="h-5 w-5" />
                    {href === cartLink.href && <CartBadge count={cartCount} />}
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
