'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mic, MicOff, Minus, Plus, ScanLine, ShoppingCart, Tag, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useVoiceBilling } from '../../../hooks/useVoiceBilling';
import { formatINR } from '../../../lib/plans';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Empty } from '../../../components/ui/States';
import type { Product } from '../../../types';

const VOICE_LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'हिंदी' },
  { code: 'mr-IN', label: 'मराठी' },
];

export default function CustomerCart() {
  const router = useRouter();
  const { user, apiFetch } = useAuth();
  const {
    cart, subtotal, tax, discount, total, couponCode, couponDiscountPercent,
    adjustQuantity, removeFromCart, clearCart, applyCoupon,
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [promoText, setPromoText] = useState('');
  const [voiceLang, setVoiceLang] = useState('en-US');

  // The catalog gives the voice parser something to match spoken names against.
  useEffect(() => {
    if (!user?.storeId) return;
    const loadCatalog = async () => {
      try {
        const res = await apiFetch(`/api/products?storeId=${user.storeId}&status=active`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadCatalog();
  }, [user]);

  const goToCheckout = () => router.push('/customer/checkout');

  const { isListening, transcript, startListening, stopListening, hasSupport } = useVoiceBilling({
    products,
    onCheckoutTrigger: goToCheckout,
  });

  const handleMicClick = () => (isListening ? stopListening() : startListening(voiceLang));

  const handleApplyPromo = async () => {
    if (!promoText.trim() || !user?.storeId) return;
    const applied = await applyCoupon(promoText.trim().toUpperCase(), user.storeId);
    if (applied) setPromoText('');
  };

  return (
    <div>
      <PageHeader
        title="Your cart"
        backHref="/customer/home"
        actions={
          cart.length > 0 && (
            <button onClick={clearCart} className="btn-ghost btn-sm text-bad-fg hover:text-bad-fg">
              <Trash2 className="h-3.5 w-3.5" /> Clear all
            </button>
          )
        }
      />

      {cart.length === 0 ? (
        <div className="card">
          <Empty
            icon={<ShoppingCart className="h-5 w-5" />}
            title="Your cart is empty"
            description="Scan a product's QR label and it will appear here."
            action={
              <Link href="/customer/scanner" className="btn-primary">
                <ScanLine className="h-4 w-4" /> Scan a product
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-5">
          <ul className="card divide-y divide-line">
            {cart.map((item) => (
              <li key={item.productId} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{item.name}</p>
                  <p className="tabular mt-0.5 text-sm text-muted">
                    {formatINR(item.price)} · GST {item.gstPercent}%
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex items-center rounded-lg border border-line">
                    <button
                      onClick={() => adjustQuantity(item.productId, -1)}
                      className="flex h-8 w-8 items-center justify-center text-muted hover:text-ink"
                      aria-label={`Decrease ${item.name}`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="tabular w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => adjustQuantity(item.productId, 1)}
                      className="flex h-8 w-8 items-center justify-center text-muted hover:text-ink"
                      aria-label={`Increase ${item.name}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="btn-icon" aria-label={`Remove ${item.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {hasSupport && (
            <section className="card flex items-center gap-4 p-4">
              <button
                onClick={handleMicClick}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-colors ${
                  isListening ? 'animate-pulse bg-bad' : 'bg-brand hover:bg-brand-hover'
                }`}
                aria-label={isListening ? 'Stop listening' : 'Start voice command'}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold">Voice assistant</p>
                <p className="truncate text-muted">
                  {isListening ? 'Listening…' : transcript ? `“${transcript}”` : 'Try “add 2 mouse” or “checkout”'}
                </p>
              </div>

              <select
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value)}
                className="input w-auto py-1.5 text-xs"
                aria-label="Voice language"
              >
                {VOICE_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </section>
          )}

          <section className="card p-5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={promoText}
                  onChange={(e) => setPromoText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                  placeholder="Coupon code"
                  className="input pl-10 uppercase placeholder:normal-case"
                />
              </div>
              <button onClick={handleApplyPromo} className="btn-secondary">
                Apply
              </button>
            </div>

            <dl className="tabular mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatINR(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">GST</dt>
                <dd>{formatINR(tax)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Savings</dt>
                <dd className="text-good-fg">−{formatINR(discount)}</dd>
              </div>
              {couponCode && (
                <div className="flex justify-between text-good-fg">
                  <dt>Coupon {couponCode}</dt>
                  <dd>{couponDiscountPercent}% off</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-line pt-3 text-base font-bold">
                <dt>Total</dt>
                <dd className="font-display text-2xl">{formatINR(total)}</dd>
              </div>
            </dl>

            <button onClick={goToCheckout} className="btn-primary mt-5 w-full py-3">
              Continue to checkout <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
