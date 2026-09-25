/**
 * Hero section — primary headline, subheadline, and two CTAs.
 * First impression: challenge the assumption that owning a standing desk = healthy.
 */
import { PRICING } from '../data/pricing';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient accents */}
      <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-brand-strong/5 blur-3xl" />
      <div className="absolute -left-40 bottom-20 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="section-container py-20 text-center">
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-brand-text">
          Open Source Desk Sensor
        </p>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Your standing desk is{' '}
          <span className="text-brand-text">useless</span>{' '}
          if you never stand.
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg text-ink-muted sm:text-xl">
          A tiny sensor that mounts under your desk, tracks your sitting and standing time,
          and actually gets you to move. Built by a developer who sat 10+ hours a day.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="#pricing" className="btn-primary text-lg">
            Pre-order — {PRICING.basic.currency}{PRICING.basic.price}
          </a>
          <a href="#how-it-works" className="btn-secondary text-lg">
            See How It Works ↓
          </a>
        </div>

        <p className="mt-6 text-sm text-ink-muted">
          Ships when we hit {PRICING.basic.threshold} pre-orders · EU shipping from Poland
        </p>
      </div>
    </section>
  );
}
