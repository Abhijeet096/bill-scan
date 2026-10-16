'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Home, Printer, Share2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { BillLines } from '../../../components/BillLines';
import { Loading } from '../../../components/ui/States';
import type { Order, Store } from '../../../types';

function Receipt() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { apiFetch } = useAuth();

  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<Order | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/customer/home');
      return;
    }

    const loadReceipt = async () => {
      setLoading(true);
      try {
        const orderRes = await apiFetch(`/api/orders/${orderId}`);
        if (orderRes.ok) {
          const orderData: Order = await orderRes.json();
          setOrder(orderData);

          const storeRes = await apiFetch(`/api/stores/${orderData.storeId}`);
          if (storeRes.ok) setStore(await storeRes.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadReceipt();
  }, [orderId]);

  const shareOnWhatsApp = () => {
    if (!order || !store) return;
    const text = `I paid ₹${order.total.toFixed(2)} at ${store.name} for invoice ${order.invoiceNumber}. Ref: ${order.txRef}.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <Loading label="Loading receipt…" />;

  if (!order || !store) {
    return <div className="card p-6 text-center text-sm text-bad-fg">We couldn&apos;t find that receipt.</div>;
  }

  return (
    <div>
      <div className="no-print mb-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-good-soft text-good-fg">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Payment successful</h1>
        <p className="mt-1 text-sm text-muted">Your receipt is saved in your history.</p>
      </div>

      <section className="card print-sheet p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 pb-5">
          <div>
            <p className="font-display text-lg font-bold">{store.name}</p>
            <p className="mt-0.5 text-xs text-muted">{store.address}</p>
          </div>
          <div className="text-right">
            <span className="badge-good">Paid</span>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-fg">{order.invoiceNumber}</p>
            <p className="mt-0.5 text-xs text-muted">{new Date(order.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Billed to</p>
            <p className="mt-1 font-medium">{order.customerName}</p>
            <p className="truncate text-xs text-muted">{order.customerEmail}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Reference</p>
            <p className="mt-1 break-all font-mono text-xs font-medium">{order.txRef || '—'}</p>
            <p className="mt-0.5 text-xs text-muted">{new Date(order.updatedAt).toLocaleTimeString([], { timeStyle: 'short' })}</p>
          </div>
        </div>

        <BillLines
          lines={order.items.map((item) => ({
            key: item.id,
            name: item.name,
            quantity: item.quantity,
            amount: item.price * item.quantity,
          }))}
          subtotal={order.subtotal}
          tax={order.tax}
          discount={order.discount}
          total={order.total}
          totalLabel="Total paid"
        />

        <p className="mt-6 border-t border-line pt-4 text-center text-xs text-muted">Thank you for shopping with us.</p>
      </section>

      <div className="no-print mt-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => window.print()} className="btn-secondary">
            <Printer className="h-4 w-4" /> Print
          </button>
          <button onClick={shareOnWhatsApp} className="btn-secondary">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
        <button onClick={() => router.push('/customer/home')} className="btn-primary w-full py-3">
          <Home className="h-4 w-4" /> Back to home
        </button>
      </div>
    </div>
  );
}

export default function CustomerReceipt() {
  return (
    <Suspense fallback={<Loading label="Loading receipt…" />}>
      <Receipt />
    </Suspense>
  );
}
