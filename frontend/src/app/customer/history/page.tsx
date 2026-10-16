'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ReceiptText } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { formatINR } from '../../../lib/plans';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Empty, Loading } from '../../../components/ui/States';
import type { Order } from '../../../types';

export default function CustomerHistory() {
  const { user, apiFetch } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadOrders = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/orders?customerId=${user.id}`);
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
  }, [user]);

  return (
    <div>
      <PageHeader title="Receipts" description="Every purchase you've made, newest first." backHref="/customer/home" />

      <div className="card">
        {loading ? (
          <Loading label="Loading receipts…" />
        ) : orders.length > 0 ? (
          <ul className="divide-y divide-line">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/customer/receipt?id=${order.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-sunken"
                >
                  <div>
                    <p className="text-sm font-semibold">{order.invoiceNumber}</p>
                    <p className="text-xs text-muted">
                      {new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="tabular text-sm font-semibold">{formatINR(order.total)}</span>
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty icon={<ReceiptText className="h-5 w-5" />} title="No receipts yet" description="Once you pay for an order it will be saved here." />
        )}
      </div>
    </div>
  );
}
