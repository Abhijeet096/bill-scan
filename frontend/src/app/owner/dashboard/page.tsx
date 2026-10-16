'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, CircleDollarSign, Package, Plus, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { formatINR } from '../../../lib/plans';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { Loading } from '../../../components/ui/States';
import type { Order } from '../../../types';

interface Insights {
  todaySales: number;
  yesterdaySales: number;
  averageOrderValue: number;
  grossProfit: number;
  netProfit: number;
  inventoryValue: number;
  topSellingProducts: { name: string; sku: string; qty: number; revenue: number }[];
  insights: string[];
}

interface StockAlert {
  productId: string;
  name: string;
  currentStock: number;
}

interface StockoutRisk {
  productId: string;
  name: string;
  sku: string;
  dailySalesVelocity: number;
  daysUntilOutOfStock: number;
}

interface Predictions {
  nextDaySales: number;
  nextWeekSales: number;
  nextMonthSales: number;
  lowStockAlerts: StockAlert[];
  outOfStockPredictions: StockoutRisk[];
}

const EMPTY_INSIGHTS: Insights = {
  todaySales: 0,
  yesterdaySales: 0,
  averageOrderValue: 0,
  grossProfit: 0,
  netProfit: 0,
  inventoryValue: 0,
  topSellingProducts: [],
  insights: [],
};

const EMPTY_PREDICTIONS: Predictions = {
  nextDaySales: 0,
  nextWeekSales: 0,
  nextMonthSales: 0,
  lowStockAlerts: [],
  outOfStockPredictions: [],
};

const RESTOCK_AMOUNT = 50;

/** Revenue per calendar day for the last seven days, oldest first. */
function dailyRevenue(orders: Order[]) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return days.map((day) => {
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const revenue = orders
      .filter((o) => o.paymentStatus === 'PAID' && new Date(o.createdAt) >= day && new Date(o.createdAt) < next)
      .reduce((sum, o) => sum + o.total, 0);
    return { name: day.toLocaleDateString([], { weekday: 'short' }), revenue };
  });
}

export default function OwnerDashboard() {
  const { user, apiFetch } = useAuth();
  const { notify } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Insights>(EMPTY_INSIGHTS);
  const [predictions, setPredictions] = useState<Predictions>(EMPTY_PREDICTIONS);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'insights' | 'forecast'>('insights');

  const loadDashboard = async () => {
    if (!user?.storeId) return;
    setLoading(true);
    try {
      const end = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      const start = startDate.toISOString().split('T')[0];

      const [insightsRes, predictionsRes, ordersRes] = await Promise.all([
        apiFetch(`/api/ai/insights?storeId=${user.storeId}`),
        apiFetch(`/api/ai/predictions?storeId=${user.storeId}`),
        apiFetch(`/api/orders?storeId=${user.storeId}&start=${start}&end=${end}&limit=500`),
      ]);

      if (insightsRes.ok) setStats(await insightsRes.json());
      if (predictionsRes.ok) setPredictions(await predictionsRes.json());
      if (ordersRes.ok) setRecentOrders((await ordersRes.json()).orders);
    } catch (e) {
      console.error('Failed to load dashboard data: ', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const chartData = useMemo(() => dailyRevenue(recentOrders), [recentOrders]);

  const handleQuickRestock = async (productId: string, currentStock: number) => {
    try {
      const res = await apiFetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQty: currentStock + RESTOCK_AMOUNT }),
      });
      if (res.ok) {
        notify(`Added ${RESTOCK_AMOUNT} units to stock.`, 'success');
        loadDashboard();
      }
    } catch (e) {
      console.error(e);
      notify('Could not update stock.', 'error');
    }
  };

  if (loading) return <Loading label="Crunching your numbers…" />;

  const alertCount = predictions.lowStockAlerts.length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="How your store is doing today."
        actions={
          alertCount > 0 && (
            <Link href="/owner/inventory" className="badge-warn px-3 py-1.5 text-sm">
              <AlertTriangle className="h-4 w-4" /> {alertCount} low-stock {alertCount === 1 ? 'item' : 'items'}
            </Link>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's sales"
          value={formatINR(stats.todaySales)}
          note={`Yesterday ${formatINR(stats.yesterdaySales)}`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Average order"
          value={formatINR(stats.averageOrderValue)}
          note="Per paid order"
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <StatCard
          label="Estimated gross profit"
          value={formatINR(stats.grossProfit)}
          note={`Net at 25% margin: ${formatINR(stats.netProfit)}`}
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Inventory value"
          value={formatINR(stats.inventoryValue)}
          note="Across active products"
          icon={<Package className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card-pad">
            <h2 className="text-lg font-semibold">Revenue, last 7 days</h2>
            <p className="text-sm text-muted">Paid orders only.</p>
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(var(--brand))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="rgb(var(--brand))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--line))" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'rgb(var(--muted))' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'rgb(var(--muted))' }} />
                  <Tooltip
                    formatter={(value: number) => [formatINR(value), 'Revenue']}
                    contentStyle={{
                      background: 'rgb(var(--surface))',
                      border: '1px solid rgb(var(--line))',
                      borderRadius: 12,
                      color: 'rgb(var(--ink))',
                      fontSize: 13,
                    }}
                  />
                  <Area isAnimationActive={false} type="monotone" dataKey="revenue" stroke="rgb(var(--brand))" strokeWidth={2.5} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card">
            <div className="flex gap-6 border-b border-line px-6" role="tablist">
              {(
                [
                  ['insights', 'Insights'],
                  ['forecast', 'Demand forecast'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  className={`-mb-px border-b-2 py-4 text-sm font-semibold transition-colors ${
                    activeTab === key ? 'border-brand text-brand-fg' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'insights' ? (
                stats.insights.length > 0 ? (
                  <ul className="space-y-3">
                    {stats.insights.map((insight, i) => (
                      <li key={i} className="flex gap-3 rounded-xl bg-sunken p-4 text-sm leading-relaxed">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-fg" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-sm text-muted">Insights appear once you have a few paid orders.</p>
                )
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ['Tomorrow', predictions.nextDaySales],
                      ['Next 7 days', predictions.nextWeekSales],
                      ['Next 30 days', predictions.nextMonthSales],
                    ].map(([label, value]) => (
                      <div key={label as string} className="rounded-xl bg-sunken p-4">
                        <p className="text-xs font-medium text-muted">{label}</p>
                        <p className="tabular mt-1 font-display text-xl font-bold">{formatINR(value as number)}</p>
                      </div>
                    ))}
                  </div>

                  {predictions.outOfStockPredictions.length > 0 && (
                    <div>
                      <h3 className="font-sans text-sm font-semibold">Likely to run out within 5 days</h3>
                      <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
                        {predictions.outOfStockPredictions.slice(0, 3).map((item) => (
                          <li key={item.productId} className="flex items-center justify-between gap-3 p-4 text-sm">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted">
                                {item.sku} · selling {item.dailySalesVelocity.toFixed(1)}/day
                              </p>
                            </div>
                            <span className="badge-warn shrink-0">
                              {item.daysUntilOutOfStock === 0 ? 'Out today' : `${item.daysUntilOutOfStock} days left`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card-pad">
            <h2 className="text-lg font-semibold">Needs restocking</h2>
            {predictions.lowStockAlerts.length > 0 ? (
              <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
                {predictions.lowStockAlerts.map((item) => (
                  <li key={item.productId} className="flex items-center justify-between gap-3 rounded-xl bg-sunken p-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-bad-fg">{item.currentStock} left</p>
                    </div>
                    <button
                      onClick={() => handleQuickRestock(item.productId, item.currentStock)}
                      className="btn-secondary btn-sm shrink-0"
                      aria-label={`Add ${RESTOCK_AMOUNT} units to ${item.name}`}
                    >
                      <Plus className="h-3.5 w-3.5" /> {RESTOCK_AMOUNT}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted">
                <CheckCircle2 className="h-8 w-8 text-good" />
                Everything is well stocked.
              </div>
            )}
          </section>

          <section className="card-pad">
            <h2 className="text-lg font-semibold">Top sellers</h2>
            {stats.topSellingProducts.length > 0 ? (
              <ol className="mt-4 space-y-3">
                {stats.topSellingProducts.map((product, index) => (
                  <li key={product.sku} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-xs font-bold text-brand-fg">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted">{product.qty} sold</p>
                    </div>
                    <p className="tabular text-sm font-semibold">{formatINR(product.revenue, 0)}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-6 text-center text-sm text-muted">No sales yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
