'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, History, ReceiptText, ScanLine, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { formatINR } from '../../../lib/plans';
import { Empty } from '../../../components/ui/States';
import type { Order } from '../../../types';

export default function CustomerHome() {
  const { user, apiFetch } = useAuth();
  const { cart } = useCart();
  const [orderCount, setOrderCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      try {
        const res = await apiFetch(`/api/orders?customerId=${user.id}&limit=3`);
        if (res.ok) {
          const data = await res.json();
          setOrderCount(data.pagination.totalCount);
          setRecentOrders(data.orders);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadHistory();
  }, [user]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const firstName = user?.name.split(' ')[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hi{firstName ? `, ${firstName}` : ''}</h1>
        <p className="mt-1 text-muted">Scan a product label to add it to your bill.</p>
      </div>

      <Link
        href="/customer/scanner"
        className="group flex items-center justify-between gap-4 rounded-2xl bg-brand p-5 text-white shadow-lift transition-colors hover:bg-brand-hover"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <ScanLine className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold">Scan a product</p>
            <p className="text-sm text-white/80">Point your camera at a QR label</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/customer/cart" className="card flex items-center gap-3 p-4 transition-colors hover:bg-sunken">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-fg">
            <ShoppingCart className="h-5 w-5" />
          </span>
          <div>
            <p className="tabular font-display text-xl font-bold leading-none">{cartCount}</p>
            <p className="mt-1 text-xs text-muted">{cartCount === 1 ? 'item in cart' : 'items in cart'}</p>
          </div>
        </Link>
        <Link href="/customer/history" className="card flex items-center gap-3 p-4 transition-colors hover:bg-sunken">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-fg">
            <History className="h-5 w-5" />
          </span>
          <div>
            <p className="tabular font-display text-xl font-bold leading-none">{orderCount}</p>
            <p className="mt-1 text-xs text-muted">{orderCount === 1 ? 'receipt' : 'receipts'}</p>
          </div>
        </Link>
      </div>

      <section className="card">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-lg font-semibold">Recent purchases</h2>
          {recentOrders.length > 0 && (
            <Link href="/customer/history" className="text-sm font-medium text-brand-fg hover:underline">
              View all
            </Link>
          )}
        </div>

        {recentOrders.length > 0 ? (
          <ul className="mt-2 divide-y divide-line">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/customer/receipt?id=${order.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-sunken"
                >
                  <div>
                    <p className="text-sm font-semibold">{order.invoiceNumber}</p>
                    <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="tabular text-sm font-semibold">{formatINR(order.total)}</span>
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty icon={<ReceiptText className="h-5 w-5" />} title="No purchases yet" description="Your receipts will show up here after your first order." />
        )}
      </section>
    </div>
  );
}
