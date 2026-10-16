import { LandingHeader } from '../components/landing/LandingHeader';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Features } from '../components/landing/Features';
import { Audience } from '../components/landing/Audience';
import { Pricing } from '../components/landing/Pricing';
import { CallToAction } from '../components/landing/CallToAction';
import { Footer } from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Audience />
        <Pricing />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
