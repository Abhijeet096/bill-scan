import { Gift, LineChart, Mic, PackageSearch, QrCode, Wallet } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const FEATURES = [
  {
    icon: QrCode,
    title: 'QR labels for every product',
    text: 'One scannable label per item, ready to download as a printable PDF.',
  },
  {
    icon: Wallet,
    title: 'UPI straight to your account',
    text: 'Shoppers pay by UPI QR or app link. The money goes to your own UPI ID.',
  },
  {
    icon: Mic,
    title: 'Voice billing',
    text: 'Say "add 2 mouse" or "checkout" in English, Hindi or Marathi and the cart follows.',
  },
  {
    icon: PackageSearch,
    title: 'Stock that tracks itself',
    text: 'Quantities fall with every paid order. Low-stock alerts and quick restock keep shelves full.',
  },
  {
    icon: LineChart,
    title: 'Sales insights and forecasts',
    text: 'See top sellers, average basket size and estimated demand for the coming week.',
  },
  {
    icon: Gift,
    title: 'Rewards that bring people back',
    text: 'Loyalty tiers, referral codes and coupons give regulars a reason to return.',
  },
];

export const Features: React.FC = () => (
  <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
    <SectionHeading
      eyebrow="Features"
      title="Everything a small store needs at the counter"
      description="Built around how neighbourhood shops actually work, from the first scan to the monthly report."
    />

    <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((feature) => (
        <div key={feature.title} className="bg-surface p-7">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-fg">
            <feature.icon className="h-5 w-5" />
          </span>
          <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{feature.text}</p>
        </div>
      ))}
    </div>
  </section>
);
