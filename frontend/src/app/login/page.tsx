'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, CreditCard, Eye, EyeOff, Loader2, Lock, Mail, Store, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BRAND, DEMO_ACCOUNTS } from '../../lib/brand';
import { Logo } from '../../components/ui/Logo';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

type Mode = 'login' | 'register';

const PORTALS = {
  customer: {
    heading: 'Shop without the queue',
    points: ['Scan product QR labels with your phone', 'See your bill build up as you shop', 'Pay with any UPI app and keep the receipt'],
  },
  owner: {
    heading: 'Run your store from one dashboard',
    points: ['Add products and print QR labels', 'Watch stock, sales and top sellers live', 'Give your staff their own logins'],
  },
};

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, icon, hint, children }) => (
  <label className="block">
    <span className="label">{label}</span>
    <span className="relative block">
      <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted">{icon}</span>
      {children}
    </span>
    {hint && <span className="hint">{hint}</span>}
  </label>
);

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup, user } = useAuth();

  const portal = searchParams.get('portal') === 'owner' ? 'owner' : 'customer';
  const isOwner = portal === 'owner';

  const [mode, setMode] = useState<Mode>('login');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (!user) return;
    router.push(user.role === 'CUSTOMER' ? '/customer/home' : '/owner/dashboard');
  }, [user, router]);

  const fillDemoAccount = () => {
    const account = DEMO_ACCOUNTS[portal];
    setMode('login');
    setEmail(account.email);
    setPassword(account.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup({
          name,
          email,
          password,
          role: isOwner ? 'OWNER' : 'CUSTOMER',
          ...(isOwner && { storeName, upiId }),
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isRegister = mode === 'register';
  const copy = PORTALS[portal];

  return (
    <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      {/* Brand panel, desktop only */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0d1f18] p-12 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgb(255_255_255/0.12)_1px,transparent_1px)] [background-size:20px_20px]"
          aria-hidden="true"
        />
        <div className="relative">
          <Logo light />
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight">{copy.heading}</h2>
          <ul className="mt-8 space-y-4">
            {copy.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-white/80">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Check className="h-3 w-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/50">{BRAND.tagline}</p>
      </aside>

      {/* Form */}
      <main className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          {/* Portal switch */}
          <div className="mb-8 grid grid-cols-2 rounded-xl bg-sunken p-1" role="tablist" aria-label="Account type">
            {(['customer', 'owner'] as const).map((key) => (
              <Link
                key={key}
                href={`/login?portal=${key}`}
                role="tab"
                aria-selected={portal === key}
                className={`rounded-lg py-2 text-center text-sm font-semibold transition-colors ${
                  portal === key ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink'
                }`}
              >
                {key === 'customer' ? 'Shopper' : 'Store owner'}
              </Link>
            ))}
          </div>

          <h1 className="text-3xl font-bold">{isRegister ? (isOwner ? 'Create your store' : 'Create your account') : 'Welcome back'}</h1>
          <p className="mt-2 text-muted">
            {isRegister
              ? isOwner
                ? 'Set up your store and start adding products.'
                : 'It takes under a minute. No card needed.'
              : isOwner
                ? 'Sign in to manage your store.'
                : 'Sign in to start scanning.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {isRegister && (
              <Field label="Full name" icon={<User className="h-4 w-4" />}>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="input pl-10"
                />
              </Field>
            )}

            <Field label="Email" icon={<Mail className="h-4 w-4" />}>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input pl-10"
              />
            </Field>

            {isOwner && isRegister && (
              <>
                <Field label="Store name" icon={<Store className="h-4 w-4" />}>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Kumar Digital Mart"
                    className="input pl-10"
                  />
                </Field>
                <Field label="UPI ID" icon={<CreditCard className="h-4 w-4" />} hint="Customer payments are sent to this UPI ID.">
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="kumar.mart@okicici"
                    pattern="^[^@]+@[^@]+$"
                    title="Enter a valid UPI ID, for example name@okaxis"
                    className="input pl-10"
                  />
                </Field>
              </>
            )}

            <Field label="Password" icon={<Lock className="h-4 w-4" />}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pl-10 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-1.5 my-auto flex h-8 w-8 items-center justify-center rounded-md text-muted hover:text-ink"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRegister ? (isOwner ? 'Create store' : 'Create account') : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {isRegister ? 'Already have an account?' : 'New to QuickStore?'}{' '}
            <button onClick={() => setMode(isRegister ? 'login' : 'register')} className="font-semibold text-brand-fg hover:underline">
              {isRegister ? 'Sign in' : 'Create an account'}
            </button>
          </p>

          <div className="mt-8 flex items-center justify-between gap-3 rounded-xl border border-dashed border-line px-4 py-3">
            <p className="text-sm text-muted">Just exploring? Use the demo {isOwner ? 'owner' : 'shopper'} account.</p>
            <button type="button" onClick={fillDemoAccount} className="btn-secondary btn-sm shrink-0">
              Fill details
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
