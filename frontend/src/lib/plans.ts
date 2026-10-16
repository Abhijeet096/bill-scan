export type PlanName = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface Plan {
  name: PlanName;
  label: string;
  price: number;
  blurb: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    name: 'STARTER',
    label: 'Starter',
    price: 999,
    blurb: 'For small shops moving from paper bills to digital billing.',
    features: ['Up to 50 active products', 'Basic stock counting', 'Printable QR labels', 'Offline billing with sync', 'Direct UPI payment QR'],
  },
  {
    name: 'PROFESSIONAL',
    label: 'Professional',
    price: 2499,
    blurb: 'For busy stores that want dashboards, alerts and voice billing.',
    features: ['Up to 500 active products', 'Inventory levels and alerts', 'Voice billing', 'Business insight summaries', 'Everything in Starter'],
  },
  {
    name: 'ENTERPRISE',
    label: 'Enterprise',
    price: 5999,
    blurb: 'For chains and high-volume stores with several branches.',
    features: ['Unlimited products', 'Demand forecasting', 'Multi-store catalog controls', 'Staff attendance logs', 'Razorpay card payments'],
  },
];

export const formatINR = (value: number, fractionDigits = 2) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}`;
