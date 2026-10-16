'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FlaskConical, ShieldCheck, Smartphone, XCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { generateQRCodeSVG } from '../../../utils/qr';
import { formatINR } from '../../../lib/plans';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Loading } from '../../../components/ui/States';
import type { Order, Store } from '../../../types';

export default function CustomerPayment() {
  const router = useRouter();
  const { user, apiFetch } = useAuth();
  const { notify } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const orderId = sessionStorage.getItem('current_checkout_order_id');
    if (!orderId) {
      router.push('/customer/cart');
      return;
    }

    const loadDetails = async () => {
      setLoading(true);
      try {
        const orderRes = await apiFetch(`/api/orders/${orderId}`);
        if (orderRes.ok) setOrder(await orderRes.json());

        if (user?.storeId) {
          const storeRes = await apiFetch(`/api/stores/${user.storeId}`);
          if (storeRes.ok) setStore(await storeRes.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [user]);

  if (loading) return <Loading label="Preparing secure payment…" />;

  if (!order || !store) {
    return (
      <div>
        <PageHeader title="Payment" backHref="/customer/checkout" />
        <div className="card p-6 text-center text-sm text-bad-fg">We couldn&apos;t load this order. Go back and try again.</div>
      </div>
    );
  }

  // upi://pay?pa=<VPA>&pn=<name>&am=<amount>&tn=<note>&cu=INR
  const upiLink = `upi://pay?pa=${store.paymentUpiId}&pn=${encodeURIComponent(store.merchantName)}&am=${order.total.toFixed(2)}&tn=${order.invoiceNumber}&cu=INR`;

  // Stands in for the payment gateway callback while the project runs against a sandbox.
  const settlePayment = async (success: boolean) => {
    setVerifying(true);
    try {
      const res = await apiFetch(`/api/orders/${order.id}/simulate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success, txRef: success ? `UPI-SANDBOX-${Date.now()}` : undefined }),
      });
      const data = await res.json();

      if (success && res.ok) {
        notify('Payment confirmed.', 'success');
        sessionStorage.setItem('last_successful_order_id', order.id);
        router.push(`/customer/receipt?id=${order.id}`);
      } else {
        notify(data.message || 'Payment did not go through.', 'error');
        if (!success) router.push('/customer/cart');
      }
    } catch (e) {
      console.error(e);
      notify('Could not verify the payment. Please try again.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      <PageHeader title="Pay with UPI" backHref="/customer/checkout" />

      <section className="card p-6 text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-good-soft px-3 py-1 text-xs font-semibold text-good-fg">
          <ShieldCheck className="h-3.5 w-3.5" /> Paid directly to the store
        </p>

        <p className="mt-5 text-sm text-muted">Amount due</p>
        <p className="tabular font-display text-4xl font-bold">{formatINR(order.total)}</p>
        <p className="mt-1 text-xs text-muted">Invoice {order.invoiceNumber}</p>

        <div
          className="mx-auto mt-6 h-52 w-52 rounded-2xl border border-line bg-white p-3"
          dangerouslySetInnerHTML={{ __html: generateQRCodeSVG(upiLink) }}
        />
        <p className="mt-3 text-sm font-medium">{store.merchantName}</p>
        <p className="font-mono text-xs text-muted">{store.paymentUpiId}</p>
        <p className="mt-3 text-xs text-muted">Scan with GPay, PhonePe, Paytm or any UPI app.</p>

        <a href={upiLink} className="btn-primary mt-6 w-full py-3">
          <Smartphone className="h-4 w-4" /> Open UPI app
        </a>
      </section>

      <section className="mt-5 rounded-2xl border border-dashed border-line p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FlaskConical className="h-4 w-4 text-muted" /> Test mode
        </div>
        <p className="mt-1 text-sm text-muted">
          This build uses a sandbox. Simulate the bank&apos;s response to see how orders, stock and receipts behave: pick an outcome below.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => settlePayment(false)} disabled={verifying} className="btn-danger">
            <XCircle className="h-4 w-4" /> Failure
          </button>
          <button onClick={() => settlePayment(true)} disabled={verifying} className="btn-primary">
            <CheckCircle2 className="h-4 w-4" /> {verifying ? 'Verifying…' : 'Success'}
          </button>
        </div>
      </section>
    </div>
  );
}
