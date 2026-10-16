import Link from 'next/link';

export const CallToAction: React.FC = () => (
  <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
    <div className="relative overflow-hidden rounded-3xl bg-[#0d1f18] px-6 py-14 text-center sm:px-12 sm:py-16">
      <div
        className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgb(255_255_255/0.12)_1px,transparent_1px)] [background-size:20px_20px]"
        aria-hidden="true"
      />
      <div className="relative">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold text-white sm:text-4xl">
          Ready to retire the billing counter queue?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          Create a store account, add your first products and print their QR labels. You can be live the same day.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/login?portal=owner" className="btn bg-white px-6 py-3 text-base text-[#0d1f18] hover:bg-white/90">
            Open your store
          </Link>
          <Link href="/login?portal=customer" className="btn border border-white/25 px-6 py-3 text-base text-white hover:bg-white/10">
            I&apos;m a shopper
          </Link>
        </div>
      </div>
    </div>
  </section>
);
