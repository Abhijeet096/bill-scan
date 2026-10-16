import { CheckCircle2, PackageCheck, ScanLine } from 'lucide-react';

const CART = [
  { name: 'Basmati Rice 5 kg', qty: 1, price: 549 },
  { name: 'Cold Coffee 200 ml', qty: 2, price: 60 },
  { name: 'Notebook A5', qty: 1, price: 45 },
];

const total = CART.reduce((sum, item) => sum + item.price * item.qty, 0);
const itemCount = CART.reduce((sum, item) => sum + item.qty, 0);

/** Static illustration of the shopper's cart, built in markup so it stays sharp and themeable. */
export const PhoneMockup: React.FC = () => (
  <div className="relative mx-auto w-full max-w-[520px] py-6">
    <div className="absolute inset-0 -z-10 rounded-[2rem] bg-brand-soft" aria-hidden="true" />
    <div
      className="absolute inset-0 -z-10 rounded-[2rem] opacity-60 [background-image:radial-gradient(rgb(var(--brand)/0.25)_1px,transparent_1px)] [background-size:18px_18px]"
      aria-hidden="true"
    />

    <div className="mx-auto w-[260px] rounded-[2.25rem] border-[7px] border-[#18211d] bg-surface shadow-lift ring-1 ring-line">
      <div className="px-4 pb-4 pt-5">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#18211d]/15" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted">Shopping at</p>
            <p className="font-display text-sm font-bold">Kumar Digital Mart</p>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
            <ScanLine className="h-4 w-4" />
          </span>
        </div>

        <ul className="mt-4 space-y-2.5">
          {CART.map((item) => (
            <li key={item.name} className="flex items-center justify-between rounded-xl bg-sunken px-3 py-2.5">
              <div>
                <p className="text-xs font-semibold">{item.name}</p>
                <p className="text-[11px] text-muted">Qty {item.qty}</p>
              </div>
              <p className="tabular text-xs font-semibold">₹{item.price * item.qty}</p>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1 border-t border-dashed border-line pt-3 text-xs">
          <div className="flex justify-between text-muted">
            <span>{itemCount} items</span>
            <span>GST included</span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span>Total</span>
            <span className="tabular">₹{total}</span>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-brand py-2.5 text-center text-xs font-semibold text-white">Pay with UPI</div>
      </div>
    </div>

    {/* Callouts sit in the side margins so they never cover the cart text. */}
    <div className="absolute left-0 top-28 hidden w-[7.5rem] animate-fade-up rounded-xl border border-line bg-surface p-3 shadow-lift [animation-delay:300ms] sm:block">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand-fg">
        <ScanLine className="h-4 w-4" />
      </span>
      <p className="mt-2 text-xs font-semibold">Item scanned</p>
      <p className="text-[11px] leading-snug text-muted">Added to cart</p>
    </div>

    <div className="absolute bottom-24 right-0 hidden w-[7.5rem] animate-fade-up rounded-xl border border-line bg-surface p-3 shadow-lift [animation-delay:500ms] sm:block">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand-fg">
        <PackageCheck className="h-4 w-4" />
      </span>
      <p className="mt-2 text-xs font-semibold">Stock updated</p>
      <p className="text-[11px] leading-snug text-muted">After each paid order</p>
    </div>

    <div className="absolute right-0 top-10 hidden animate-fade-up items-center gap-1.5 rounded-full border border-line bg-surface py-1.5 pl-2 pr-3 shadow-lift [animation-delay:700ms] sm:flex">
      <CheckCircle2 className="h-4 w-4 text-good" />
      <span className="text-xs font-semibold">Paid via UPI</span>
    </div>
  </div>
);
