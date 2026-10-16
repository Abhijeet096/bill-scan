'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CameraOff } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useToast } from '../../../context/ToastContext';
import { useScanner } from '../../../hooks/useScanner';
import { getOfflineProducts, saveOfflineProducts } from '../../../utils/indexedDB';
import { formatINR } from '../../../lib/plans';
import { PageHeader } from '../../../components/ui/PageHeader';
import type { Product } from '../../../types';

export default function CustomerScanner() {
  const router = useRouter();
  const { user, apiFetch } = useAuth();
  const { addToCart, isOnline } = useCart();
  const { notify } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSku, setSelectedSku] = useState('');
  const [loading, setLoading] = useState(true);

  // Load the catalog for the manual picker; fall back to the offline copy when there's no connection.
  const loadCatalog = async () => {
    setLoading(true);
    try {
      if (!isOnline) {
        const cached = await getOfflineProducts();
        setProducts(cached);
        if (cached.length > 0) setSelectedSku(cached[0].sku);
        return;
      }

      const res = await apiFetch(`/api/products?storeId=${user?.storeId || ''}&status=active`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        if (data.products.length > 0) setSelectedSku(data.products[0].sku);
        await saveOfflineProducts(data.products);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [user, isOnline]);

  const addBySku = (sku: string) => {
    const product = products.find((p) => p.sku === sku);
    if (!product) {
      notify("That product isn't in this store's catalog.", 'error');
      return;
    }
    if (product.stockQty <= 0) {
      notify(`${product.name} is out of stock.`, 'error');
      return;
    }
    addToCart(product);
    router.push('/customer/cart');
  };

  const handleScanResult = (qrText: string) => {
    try {
      const payload = JSON.parse(qrText);
      if (payload.v === 1 && payload.sku) addBySku(payload.sku);
    } catch {
      console.warn('Scanned a QR code that is not a QuickStore label:', qrText);
    }
  };

  const { errorMsg, startScanner, stopScanner } = useScanner({
    elementId: 'camera-stream-box',
    onScanSuccess: handleScanResult,
  });

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div>
      <PageHeader title="Scan a product" description="Hold the QR label inside the frame." backHref="/customer/home" />

      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl bg-[#0d1f18]">
        <div id="camera-stream-box" className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />

        {!errorMsg && (
          <div className="pointer-events-none absolute inset-0 p-8" aria-hidden="true">
            <div className="relative h-full w-full">
              <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-white" />
              <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-white" />
              <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-white" />
              <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-white" />
              <span className="absolute inset-x-2 h-0.5 animate-scan-line rounded-full bg-brand shadow-[0_0_12px_2px_rgb(var(--brand))]" />
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center text-white">
            <CameraOff className="h-8 w-8 text-white/70" />
            <p className="text-sm text-white/80">{errorMsg}</p>
          </div>
        )}
      </div>

      <section className="card mx-auto mt-6 max-w-sm p-5">
        <h2 className="text-base font-semibold">Can&apos;t scan? Pick the item</h2>
        <p className="mt-1 text-sm text-muted">Choose a product from this store&apos;s catalog and add it manually.</p>

        {loading ? (
          <p className="mt-4 text-sm text-muted">Loading products…</p>
        ) : products.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select value={selectedSku} onChange={(e) => setSelectedSku(e.target.value)} className="input flex-1" aria-label="Product">
              {products.map((p) => (
                <option key={p.id} value={p.sku}>
                  {p.name} ({formatINR(p.price, 0)})
                </option>
              ))}
            </select>
            <button onClick={() => addBySku(selectedSku)} className="btn-primary">
              Add to cart
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">This store has no products yet.</p>
        )}
      </section>
    </div>
  );
}
