'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth, type UserSession } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Loading } from '../ui/States';
import { OWNER_LINKS } from './links';
import { useRoleGuard } from './useRoleGuard';

const SidebarContent: React.FC<{ user: UserSession; onNavigate?: () => void }> = ({ user, onNavigate }) => {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo href="/owner/dashboard" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Main">
        {OWNER_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-brand-soft text-brand-fg' : 'text-muted hover:bg-sunken hover:text-ink'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-fg">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="text-xs capitalize text-muted">{user.role.toLowerCase()}</p>
          </div>
          <ThemeToggle />
          <button onClick={logout} className="btn-icon" aria-label="Sign out">
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const OwnerShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, ready } = useRoleGuard('owner');
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => setDrawerOpen(false), [pathname]);

  if (!ready || !user) return <Loading />;

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-surface lg:block">
        <SidebarContent user={user} />
      </aside>

      {/* Phone / tablet top bar + drawer */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line/70 bg-canvas/85 px-4 backdrop-blur lg:hidden">
        <Logo href="/owner/dashboard" />
        <button className="btn-icon" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 right-0 w-72 max-w-[85vw] bg-surface shadow-lift">
            <button className="btn-icon absolute right-3 top-4" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent user={user} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <main className="px-4 py-6 sm:px-6 lg:pl-64">
        <div className="mx-auto max-w-6xl lg:px-8 lg:py-4">{children}</div>
      </main>
    </div>
  );
};
