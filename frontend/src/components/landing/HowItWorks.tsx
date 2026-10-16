import { PackagePlus, ScanLine, Smartphone } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const STEPS = [
  {
    icon: PackagePlus,
    title: 'Add products, print labels',
    text: 'The owner adds each product with price, GST and stock. QuickStore generates a unique QR label to download as a PDF and stick on the shelf.',
  },
  {
    icon: ScanLine,
    title: 'Shoppers scan as they pick',
    text: 'Customers open QuickStore on their phone and scan the label. The item lands in the cart with the right price, and quantities are one tap away.',
  },
  {
    icon: Smartphone,
    title: 'Pay by UPI and leave',
    text: 'The bill is ready before the counter. Shoppers pay with any UPI app, the receipt is saved, and stock drops automatically.',
  },
];

export const HowItWorks: React.FC = () => (
  <section id="how-it-works" className="scroll-mt-20 border-y border-line bg-surface py-20">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHeading
        eyebrow="How it works"
        title="From shelf to receipt in three steps"
        description="No special hardware. A phone camera and a printed label are all it takes."
      />

      <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
        {STEPS.map((step, index) => (
          <li key={step.title} className="relative">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-fg">
                <step.icon className="h-6 w-6" />
              </span>
              <span className="font-display text-sm font-semibold text-muted">Step {index + 1}</span>
            </div>
            <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
