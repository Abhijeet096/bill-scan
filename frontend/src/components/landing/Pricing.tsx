import Link from 'next/link';
import { Check } from 'lucide-react';
import { PLANS, formatINR } from '../../lib/plans';
import { SectionHeading } from './SectionHeading';

const FEATURED_PLAN = 'PROFESSIONAL';

export const Pricing: React.FC = () => (
  <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
    <SectionHeading
      eyebrow="Pricing"
      title="Simple monthly plans"
      description="Shoppers always use QuickStore for free. Store owners pick the plan that matches their catalog."
    />

    <div className="mt-14 grid gap-6 md:grid-cols-3">
      {PLANS.map((plan) => {
        const featured = plan.name === FEATURED_PLAN;
        return (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-2xl border bg-surface p-7 ${
              featured ? 'border-brand shadow-lift ring-1 ring-brand' : 'border-line shadow-card'
            }`}
          >
            {featured && (
              <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-0.5 text-xs font-semibold text-white">
                Most popular
              </span>
            )}
            <h3 className="text-lg font-semibold">{plan.label}</h3>
            <p className="mt-1 min-h-[3rem] text-sm text-muted">{plan.blurb}</p>
            <p className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold">{formatINR(plan.price, 0)}</span>
              <span className="text-sm text-muted">/ month</span>
            </p>

            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-fg" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/login?portal=owner" className={`${featured ? 'btn-primary' : 'btn-secondary'} mt-8`}>
              Choose {plan.label}
            </Link>
          </div>
        );
      })}
    </div>
  </section>
);
