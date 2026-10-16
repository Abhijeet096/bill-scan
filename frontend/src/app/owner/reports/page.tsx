'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, ReceiptText } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { formatINR } from '../../../lib/plans';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { Empty, Loading } from '../../../components/ui/States';
import type { Order, PaymentStatus } from '../../../types';

const STATUS_BADGE: Record<PaymentStatus, string> = {
  PAID: 'badge-good',
  PENDING: 'badge-warn',
  FAILED: 'badge-bad',
};

const toDateInput = (d: Date) => d.toISOString().split('T')[0];

export default function SalesReports() {
  const { user, apiFetch } = useAuth();
  const { notify } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Default range: the last 30 days.
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toDateInput(d);
  });
  const [endDate, setEndDate] = useState(() => toDateInput(new Date()));
  const [status, setStatus] = useState('all');

  useEffect(() => {
    if (!user?.storeId || !startDate || !endDate) return;
    const loadOrders = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/orders?storeId=${user.storeId}&start=${startDate}&end=${endDate}&status=${status}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user, startDate, endDate, status]);

  const paidOrders = useMemo(() => orders.filter((o) => o.paymentStatus === 'PAID'), [orders]);

  const totals = useMemo(
    () => ({
      gross: paidOrders.reduce((sum, o) => sum + o.subtotal, 0),
      tax: paidOrders.reduce((sum, o) => sum + o.tax, 0),
      discounts: paidOrders.reduce((sum, o) => sum + o.discount, 0),
    }),
    [paidOrders]
  );

  const chartData = useMemo(() => {
    const byDay = new Map<string, number>();
    // API returns newest first; reverse so the chart reads left to right in time.
    [...paidOrders].reverse().forEach((o) => {
      const day = new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
      byDay.set(day, (byDay.get(day) ?? 0) + o.total);
    });
    return Array.from(byDay, ([date, revenue]) => ({ date, revenue }));
  }, [paidOrders]);

  const exportCSV = () => {
    if (orders.length === 0) {
      notify('There are no orders in this range to export.', 'error');
      return;
    }

    const header = 'Invoice,Date,Customer,Email,Payment method,Subtotal,Tax,Discount,Total,Reference,Status';
    const rows = orders.map((o) =>
      [
        o.invoiceNumber, o.createdAt, o.customerName, o.customerEmail, o.paymentMethod,
        o.subtotal, o.tax, o.discount, o.total, o.txRef ?? '', o.paymentStatus,
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    );

    const url = URL.createObjectURL(new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${startDate}-to-${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Review transactions and download them for your accountant."
        actions={
          <button onClick={exportCSV} className="btn-secondary">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross sales" value={formatINR(totals.gross)} note="Paid orders, before tax" />
        <StatCard label="Tax collected" value={formatINR(totals.tax)} />
        <StatCard label="Discounts given" value={formatINR(totals.discounts)} />
        <StatCard label="Paid orders" value={String(paidOrders.length)} />
      </div>

      <section className="card-pad mt-6">
        <h2 className="text-lg font-semibold">Revenue by day</h2>
        {chartData.length > 0 ? (
          <div className="mt-5 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--line))" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'rgb(var(--muted))' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'rgb(var(--muted))' }} />
                <Tooltip
                  cursor={{ fill: 'rgb(var(--sunken))' }}
                  formatter={(value: number) => [formatINR(value), 'Revenue']}
                  contentStyle={{
                    background: 'rgb(var(--surface))',
                    border: '1px solid rgb(var(--line))',
                    borderRadius: 12,
                    color: 'rgb(var(--ink))',
                    fontSize: 13,
                  }}
                />
                <Bar isAnimationActive={false} dataKey="revenue" fill="rgb(var(--brand))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted">No paid orders in this range.</p>
        )}
      </section>

      <section className="card mt-6">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Transactions</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={startDate} max={endDate} onChange={(e) => setStartDate(e.target.value)} className="input w-auto py-2" aria-label="From date" />
            <span className="text-sm text-muted">to</span>
            <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="input w-auto py-2" aria-label="To date" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto py-2" aria-label="Payment status">
              <option value="all">All payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Loading label="Loading transactions…" />
        ) : orders.length > 0 ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th className="text-right">Total</th>
                  <th>Reference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs font-semibold">{order.invoiceNumber}</td>
                    <td className="whitespace-nowrap text-muted">
                      {new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-muted">{order.customerEmail}</p>
                    </td>
                    <td className="tabular text-right font-semibold">{formatINR(order.total)}</td>
                    <td className="font-mono text-xs text-muted">{order.txRef || '—'}</td>
                    <td>
                      <span className={STATUS_BADGE[order.paymentStatus]}>{order.paymentStatus.toLowerCase()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={<ReceiptText className="h-5 w-5" />} title="No transactions" description="Nothing was recorded in this date range." />
        )}
      </section>
    </div>
  );
}
