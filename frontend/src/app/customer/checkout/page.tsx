'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Wallet } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { BillLines } from '../../../components/BillLines';
import { PageHeader } from '../../../components/ui/PageHeader';
import type { Store } from '../../../types';

export default function CustomerCheckout() {
  const router = useRouter();
  const { user, apiFetch } = useAuth();
  const { cart, subtotal, tax, discount, total, submitCheckout } = useCart();
  const [store, setStore] = useState<Store | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/customer/cart');
      return;
    }

    const loadStore = async () => {
      if (!user?.storeId) return;
      try {
        const res = await apiFetch(`/api/stores/${user.storeId}`);
        if (res.ok) setStore(await res.json());
      } catch (e) {
        console.error(e);
      }
    };

    setInvoiceNumber('INV-' + Date.now().toString().slice(-6));
    loadStore();
  }, [user]);

  const handleProceedToPayment = async () => {
    setProcessing(true);
    // Creates the order on the backend in PENDING state; payment settles it.
    const order = await submitCheckout(user?.name, user?.email);
    setProcessing(false);

    if (order) {
      sessionStorage.setItem('current_checkout_order_id', order.id);
      router.push('/customer/payment');
    }
  };

  return (
    <div>
      <PageHeader title="Review your bill" description="Check the items match what's in your basket." backHref="/customer/cart" />

      <section className="card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 pb-5">
          <div>
            <p className="font-display text-lg font-bold">{store?.name ?? 'QuickStore'}</p>
            {store?.address && <p className="mt-0.5 text-xs text-muted">{store.address}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-fg">{invoiceNumber}</p>
            <p className="mt-0.5 text-xs text-muted">{new Date().toLocaleDateString([], { dateStyle: 'medium' })}</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Billed to</p>
            <p className="mt-1 font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Payment</p>
            <p className="mt-1 font-medium">UPI</p>
          </div>
        </div>

        <BillLines
          lines={cart.map((item) => ({
            key: item.productId,
            name: item.name,
            detail: `SKU ${item.sku}`,
            quantity: item.quantity,
            amount: item.price * item.quantity,
          }))}
          subtotal={subtotal}
          tax={tax}
          discount={discount}
          total={total}
          totalLabel="Amount to pay"
        />
      </section>

      <div className="mt-5 flex gap-3">
        <button onClick={() => router.push('/customer/cart')} className="btn-secondary flex-1 py-3">
          Edit cart
        </button>
        <button onClick={handleProceedToPayment} disabled={processing} className="btn-primary flex-[2] py-3">
          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
          {processing ? 'Preparing…' : 'Pay now'}
        </button>
      </div>
    </div>
  );
}
