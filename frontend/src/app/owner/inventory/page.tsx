'use client';

import { useEffect, useState } from 'react';
import { Boxes, Minus, Plus, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { formatINR } from '../../../lib/plans';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Empty, Loading } from '../../../components/ui/States';
import type { Product } from '../../../types';

function StockBadge({ product }: { product: Product }) {
  if (product.stockQty === 0) return <span className="badge-bad">Out of stock</span>;
  if (product.stockQty < product.reorderPoint) return <span className="badge-warn">Low stock</span>;
  return <span className="badge-good">In stock</span>;
}

interface QuickButtonProps {
  product: Product;
  change: number;
  onAdjust: (product: Product, change: number) => void;
}

function QuickButton({ product, change, onAdjust }: QuickButtonProps) {
  return (
    <button
      onClick={() => onAdjust(product, change)}
      className="btn-secondary btn-sm tabular min-w-[2.75rem] px-2"
      aria-label={`${change > 0 ? 'Add' : 'Remove'} ${Math.abs(change)} ${product.name}`}
    >
      {change > 0 ? `+${change}` : change}
    </button>
  );
}

export default function InventoryControl() {
  const { user, apiFetch } = useAuth();
  const { notify } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  // Typed-in adjustments, keyed by product id.
  const [adjustments, setAdjustments] = useState<Record<string, string>>({});

  const loadInventory = async () => {
    if (!user?.storeId) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/products?storeId=${user.storeId}&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [user, search]);

  /** Applies a +/- change to a product's stock, never dropping below zero. */
  const adjustStock = async (product: Product, change: number): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQty: Math.max(0, product.stockQty + change) }),
      });
      if (res.ok) {
        loadInventory();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    notify('Could not update stock.', 'error');
    return false;
  };

  const applyTypedAdjustment = async (product: Product) => {
    const change = parseInt(adjustments[product.id]);
    if (isNaN(change)) {
      notify('Enter a whole number, like 12 or -5.', 'error');
      return;
    }
    if (await adjustStock(product, change)) {
      setAdjustments((prev) => ({ ...prev, [product.id]: '' }));
    }
  };

  return (
    <div>
      <PageHeader title="Inventory" description="Check stock levels and make quick adjustments." />

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="input pl-10" />
          </div>
          <button onClick={loadInventory} className="btn-secondary">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {loading ? (
          <Loading label="Loading stock levels…" />
        ) : products.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="table-wrap hidden md:block">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th className="text-right">Stock</th>
                    <th>Status</th>
                    <th className="text-right">Adjust</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <p className="font-medium">{product.name}</p>
                        <p className="font-mono text-xs text-muted">
                          {product.sku} · {formatINR(product.price)}
                        </p>
                      </td>
                      <td className="text-muted">{product.category}</td>
                      <td className="tabular text-right font-display text-lg font-bold">{product.stockQty}</td>
                      <td>
                        <StockBadge product={product} />
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1.5">
                          <QuickButton product={product} change={-10} onAdjust={adjustStock} />
                          <QuickButton product={product} change={-1} onAdjust={adjustStock} />
                          <input
                            type="number"
                            value={adjustments[product.id] ?? ''}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, [product.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && applyTypedAdjustment(product)}
                            placeholder="±"
                            aria-label={`Custom change for ${product.name}`}
                            className="input w-16 px-2 py-1.5 text-center text-xs"
                          />
                          <button onClick={() => applyTypedAdjustment(product)} className="btn-primary btn-sm">
                            Apply
                          </button>
                          <QuickButton product={product} change={1} onAdjust={adjustStock} />
                          <QuickButton product={product} change={10} onAdjust={adjustStock} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phone list */}
            <ul className="divide-y divide-line md:hidden">
              {products.map((product) => (
                <li key={product.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="font-mono text-xs text-muted">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="tabular font-display text-xl font-bold">{product.stockQty}</p>
                      <StockBadge product={product} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => adjustStock(product, -1)} className="btn-secondary btn-sm" aria-label={`Remove 1 ${product.name}`}>
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => adjustStock(product, 1)} className="btn-secondary btn-sm" aria-label={`Add 1 ${product.name}`}>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      value={adjustments[product.id] ?? ''}
                      onChange={(e) => setAdjustments((prev) => ({ ...prev, [product.id]: e.target.value }))}
                      placeholder="± amount"
                      aria-label={`Custom change for ${product.name}`}
                      className="input min-w-0 flex-1 py-1.5 text-xs"
                    />
                    <button onClick={() => applyTypedAdjustment(product)} className="btn-primary btn-sm">
                      Apply
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Empty icon={<Boxes className="h-5 w-5" />} title="Nothing to show" description="No products match your search." />
        )}
      </div>
    </div>
  );
}
