import Link from 'next/link';
import { ArrowRight, Check, ShoppingBasket, Store } from 'lucide-react';

const SHOPPERS = [
  'Scan products with your phone camera',
  'See your running bill and apply coupons',
  'Pay with GPay, PhonePe, Paytm or any UPI app',
  'Keep every receipt in your history',
];

const OWNERS = [
  'Add products and print QR labels in minutes',
  'Track stock, sales and top-selling items live',
  'Give cashiers and managers their own logins',
  'Choose a monthly plan that fits your store',
];

interface PanelProps {
  icon: React.ReactNode;
  title: string;
  points: string[];
  cta: string;
  href: string;
  primary?: boolean;
}

const Panel: React.FC<PanelProps> = ({ icon, title, points, cta, href, primary }) => (
  <div className="card flex flex-col p-8">
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-fg">{icon}</span>
    <h3 className="mt-5 text-2xl font-bold">{title}</h3>
    <ul className="mt-5 flex-1 space-y-3">
      {points.map((point) => (
        <li key={point} className="flex items-start gap-2.5 text-muted">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-fg" />
          {point}
        </li>
      ))}
    </ul>
    <Link href={href} className={`${primary ? 'btn-primary' : 'btn-secondary'} mt-8 self-start`}>
      {cta} <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

export const Audience: React.FC = () => (
  <section className="border-y border-line bg-sunken/60 py-20">
    <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-2">
      <Panel
        icon={<ShoppingBasket className="h-5 w-5" />}
        title="For shoppers"
        points={SHOPPERS}
        cta="Start shopping"
        href="/login?portal=customer"
      />
      <Panel
        icon={<Store className="h-5 w-5" />}
        title="For store owners"
        points={OWNERS}
        cta="Set up your store"
        href="/login?portal=owner"
        primary
      />
    </div>
  </section>
);
