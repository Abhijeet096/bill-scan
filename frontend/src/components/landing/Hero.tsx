import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { PhoneMockup } from './PhoneMockup';

const HIGHLIGHTS = ['UPI payments', 'Works offline', 'GST invoices', 'Hindi and Marathi voice'];

export const Hero: React.FC = () => (
  <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pb-24 lg:pt-20">
    <div className="animate-fade-up">
      <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        Self-checkout for local retail stores
      </p>

      <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
        Skip the billing queue.
        <br />
        <span className="text-brand-fg">Scan, pay, go.</span>
      </h1>

      <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
        Put a QR code on every product. Shoppers scan items with their phone, check the bill and pay by UPI. You get fewer
        counter queues, no manual billing mistakes and stock that updates itself.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/login?portal=customer" className="btn-primary px-6 py-3 text-base">
          Start shopping <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/login?portal=owner" className="btn-secondary px-6 py-3 text-base">
          I run a store
        </Link>
      </div>

      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
        {HIGHLIGHTS.map((item) => (
          <li key={item} className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-brand-fg" />
            {item}
          </li>
        ))}
      </ul>
    </div>

    <PhoneMockup />
  </section>
);
