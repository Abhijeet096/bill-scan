'use client';

import { useEffect, useState } from 'react';
import { Award, Copy, Gift, Ticket } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Empty, Loading } from '../../../components/ui/States';
import type { Coupon, Loyalty } from '../../../types';

// Mirrors the tier thresholds the backend applies when an order is paid.
const TIERS = [
  { name: 'BRONZE', at: 0 },
  { name: 'SILVER', at: 100 },
  { name: 'GOLD', at: 300 },
  { name: 'PLATINUM', at: 500 },
];

function tierProgress(points: number) {
  const currentIndex = TIERS.reduce((found, tier, i) => (points >= tier.at ? i : found), 0);
  const current = TIERS[currentIndex];
  const next = TIERS[currentIndex + 1];

  if (!next) return { nextTier: null, remaining: 0, percent: 100 };
  return {
    nextTier: next.name,
    remaining: next.at - points,
    percent: ((points - current.at) / (next.at - current.at)) * 100,
  };
}

export default function LoyaltyProgram() {
  const { user, apiFetch } = useAuth();
  const { notify } = useToast();

  const [loyalty, setLoyalty] = useState<Loyalty | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [referralInput, setReferralInput] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLoyalty = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const storeQuery = `storeId=${user.storeId || ''}`;
      const [loyaltyRes, couponsRes] = await Promise.all([
        apiFetch(`/api/loyalty?${storeQuery}`),
        apiFetch(`/api/loyalty/coupons?${storeQuery}`),
      ]);
      if (loyaltyRes.ok) setLoyalty(await loyaltyRes.json());
      if (couponsRes.ok) setCoupons(await couponsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoyalty();
  }, [user]);

  const handleApplyReferral = async () => {
    if (!referralInput.trim()) return;
    try {
      const res = await apiFetch('/api/loyalty/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: referralInput.trim().toUpperCase(), storeId: user?.storeId }),
      });
      const data = await res.json();

      if (res.ok) {
        notify('Referral bonus added to your balance.', 'success');
        setReferralInput('');
        loadLoyalty();
      } else {
        notify(data.error || 'That referral code could not be applied.', 'error');
      }
    } catch (e) {
      console.error(e);
      notify('Something went wrong. Please try again.', 'error');
    }
  };

  const copyReferralCode = async () => {
    if (!loyalty?.referralCode) return;
    try {
      await navigator.clipboard.writeText(loyalty.referralCode);
      notify('Referral code copied.', 'success');
    } catch {
      notify('Could not copy. Select the code and copy it manually.', 'error');
    }
  };

  if (loading) return <Loading label="Loading your rewards…" />;

  const points = loyalty?.points ?? 0;
  const { nextTier, remaining, percent } = tierProgress(points);

  return (
    <div className="space-y-5">
      <PageHeader title="Rewards" backHref="/customer/home" />

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Points balance</p>
            <p className="tabular font-display text-5xl font-bold">{points}</p>
          </div>
          <div className="text-right">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand-fg">
              <Award className="h-6 w-6" />
            </span>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs">
            <span className="font-semibold capitalize">{loyalty?.tier?.toLowerCase()} member</span>
            <span className="text-muted">
              {nextTier ? `${remaining} pts to ${nextTier.toLowerCase()}` : 'Top tier reached'}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sunken">
            <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${Math.min(100, Math.max(3, percent))}%` }} />
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Refer a friend</h2>
        <p className="mt-1 text-sm text-muted">
          Friends save 15% on their first order when they use your code, and you get 50 bonus points.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <code className="flex-1 select-all rounded-lg bg-sunken px-4 py-2.5 text-center font-mono text-sm font-bold tracking-wider">
            {loyalty?.referralCode}
          </code>
          <button onClick={copyReferralCode} className="btn-secondary" aria-label="Copy referral code">
            <Copy className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <label htmlFor="friend-code" className="label">
            Got a friend&apos;s code?
          </label>
          <div className="flex gap-2">
            <input
              id="friend-code"
              type="text"
              value={referralInput}
              onChange={(e) => setReferralInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyReferral()}
              placeholder="Enter code"
              className="input uppercase placeholder:normal-case"
            />
            <button onClick={handleApplyReferral} className="btn-primary shrink-0">
              Claim
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="flex items-center gap-2 px-6 pt-6">
          <Gift className="h-5 w-5 text-brand-fg" />
          <h2 className="text-lg font-semibold">Your coupons</h2>
        </div>

        {coupons.length > 0 ? (
          <ul className="mt-3 divide-y divide-line">
            {coupons.map((coupon) => (
              <li key={coupon.id} className="flex items-center justify-between gap-3 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sunken text-muted">
                    <Ticket className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-mono text-sm font-bold">{coupon.code}</p>
                    <p className="text-xs text-muted">Expires {new Date(coupon.expiresAt).toLocaleDateString([], { dateStyle: 'medium' })}</p>
                  </div>
                </div>
                <span className="badge-good">{coupon.discountPercent}% off</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="No coupons right now" description="Earn points with every purchase to unlock coupons." />
        )}
      </section>
    </div>
  );
}
