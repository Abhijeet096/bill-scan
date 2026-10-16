'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { PLANS, formatINR, type PlanName } from '../../../lib/plans';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Loading } from '../../../components/ui/States';
import type { Store } from '../../../types';

interface BillingEntry {
  id: string;
  date: string;
  plan: string;
  amount: number;
  method: string;
  status: string;
}

export default function SubscriptionManager() {
  const { user, apiFetch } = useAuth();
  const { notify } = useToast();

  const [store, setStore] = useState<Store | null>(null);
  const [history, setHistory] = useState<BillingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubscription = async () => {
    if (!user?.storeId) return;
    setLoading(true);
    try {
      const storeRes = await apiFetch(`/api/stores/${user.storeId}`);
      if (storeRes.ok) setStore(await storeRes.json());

      // The backend has no billing-history endpoint yet, so this is a placeholder entry.
      setHistory([
        {
          id: 'TXN-SUB-902381',
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString([], { dateStyle: 'medium' }),
          plan: 'Professional',
          amount: 2499,
          method: 'UPI',
          status: 'Paid',
        },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, [user]);

  const changePlan = async (plan: PlanName) => {
    try {
      const res = await apiFetch(`/api/stores/${user?.storeId}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, txRef: `UPI-SUB-UPG-${Date.now()}` }),
      });

      if (res.ok) {
        notify(`You're now on the ${plan.toLowerCase()} plan.`, 'success');
        loadSubscription();
      } else {
        notify('Could not change your plan.', 'error');
      }
    } catch (e) {
      console.error(e);
      notify('Could not change your plan.', 'error');
    }
  };

  if (loading) return <Loading label="Loading your plan…" />;

  const currentPlan = PLANS.find((p) => p.name === store?.subscriptionPlan);

  return (
    <div>
      <PageHeader title="Plan & billing" description="Your subscription and payment history." />

      <section className="card-pad flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="badge-good">Active</span>
          <h2 className="mt-3 text-2xl font-bold">{currentPlan?.label ?? store?.subscriptionPlan} plan</h2>
          {store?.subscriptionExpiresAt && (
            <p className="mt-1 text-sm text-muted">
              Renews on {new Date(store.subscriptionExpiresAt).toLocaleDateString([], { dateStyle: 'long' })}
            </p>
          )}
        </div>
        {currentPlan && (
          <p className="sm:text-right">
            <span className="tabular font-display text-3xl font-bold">{formatINR(currentPlan.price, 0)}</span>
            <span className="text-sm text-muted"> / month</span>
          </p>
        )}
      </section>

      <h2 className="mb-4 mt-10 text-xl font-semibold">Choose a plan</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.name === store?.subscriptionPlan;
          return (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border bg-surface p-6 ${isCurrent ? 'border-brand ring-1 ring-brand' : 'border-line shadow-card'}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{plan.label}</h3>
                {isCurrent && <span className="badge-good">Current</span>}
              </div>
              <p className="mt-4">
                <span className="tabular font-display text-3xl font-bold">{formatINR(plan.price, 0)}</span>
                <span className="text-sm text-muted"> / month</span>
              </p>
              <p className="mt-2 text-sm text-muted">{plan.blurb}</p>

              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-fg" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => changePlan(plan.name)}
                disabled={isCurrent}
                className={`${isCurrent ? 'btn-secondary' : 'btn-primary'} mt-6`}
              >
                {isCurrent ? 'Your current plan' : `Switch to ${plan.label}`}
              </button>
            </div>
          );
        })}
      </div>

      <section className="card mt-10">
        <h2 className="px-6 pt-6 text-lg font-semibold">Billing history</h2>
        <div className="table-wrap mt-3">
          <table className="table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Date</th>
                <th>Plan</th>
                <th className="text-right">Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td className="font-mono text-xs font-semibold">{entry.id}</td>
                  <td className="whitespace-nowrap text-muted">{entry.date}</td>
                  <td>{entry.plan}</td>
                  <td className="tabular text-right font-semibold">{formatINR(entry.amount)}</td>
                  <td className="text-muted">{entry.method}</td>
                  <td>
                    <span className="badge-good">{entry.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
