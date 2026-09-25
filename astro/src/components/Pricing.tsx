/**
 * Pricing section — 3-tier product cards with Stripe checkout links.
 */
import { trackEvent } from '../utils/analytics';
import { PRICING, type TierKey } from '../data/pricing';

// Replace with real Stripe Payment Links after Stripe account setup
const STRIPE_LINKS: Record<string, string> = {
  basic: 'https://checkout.stripe.com/placeholder-basic',
  pro: 'https://checkout.stripe.com/placeholder-pro',
  founder: 'https://checkout.stripe.com/placeholder-founder',
};

interface Tier {
  key: string;
  name: string;
  price: number;
  tagline: string;
  contents: string[];
  threshold: number | null;
  thresholdNote?: string;
  highlighted?: boolean;
  urgencyLabel?: string;
}

const tiers: Tier[] = [
  {
    key: 'basic',
    name: PRICING.basic.name,
    price: PRICING.basic.price,
    tagline: 'Awareness — know how much you actually sit',
    contents: [
      'VL53L1X ToF sensor on carrier PCB',
      'Microcontroller (pre-flashed firmware)',
      'USB-C cable',
      'Mounting tape',
      'Desktop app (open source)',
    ],
    threshold: PRICING.basic.threshold,
    urgencyLabel: `Early bird pricing — limited to first ${PRICING.basic.threshold} orders`,
  },
  {
    key: 'pro',
    name: PRICING.pro.name,
    price: PRICING.pro.price,
    tagline: 'Active Coaching — your desk nudges you',
    contents: [
      'Everything in Basic',
      'Vibration motor (haptic alerts)',
      'Presence sensor (desk activity detection)',
    ],
    threshold: PRICING.pro.threshold,
    highlighted: true,
  },
  {
    key: 'founder',
    name: PRICING.founder.name,
    price: PRICING.founder.price,
    tagline: 'Full Investment — fund the future of desk ergonomics',
    contents: [
      'Everything in Pro',
      '5 years Pro cloud subscription',
      'Smartwatch integration (when available)',
      'Priority feature requests',
      'Direct support channel',
      'Name in credits',
      'Beta access to new features',
    ],
    threshold: PRICING.founder.threshold,
    thresholdNote: 'Ships with Pro batch',
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 border-t border-gray-800/50">
      <div className="section-container">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          Choose your kit
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">
          Pre-order now. Production starts when we hit the threshold.
          Full refund if we don't reach it.
        </p>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <TierCard key={tier.key} tier={tier} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          All prices include sensor hardware + open source app.
          Shipping calculated at checkout. EU shipping from Poland.
        </p>
      </div>
    </section>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 ${
        tier.highlighted
          ? 'border-brand-green/50 bg-dark-700 shadow-glow'
          : 'border-gray-800 bg-dark-800'
      }`}
    >
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-green px-4 py-1 text-xs font-bold text-dark-900">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-100">{tier.name}</h3>
        <p className="mt-1 text-sm text-muted">{tier.tagline}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-extrabold text-gray-100">
          &euro;{tier.price}
        </span>
        <span className="ml-1 text-muted">one-time</span>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {tier.contents.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="mt-0.5 text-brand-green">&#10003;</span>
            {item}
          </li>
        ))}
      </ul>

      {tier.urgencyLabel && (
        <p className="mb-3 text-xs font-medium text-amber-400">
          {tier.urgencyLabel}
        </p>
      )}
      {tier.thresholdNote && (
        <p className="mb-6 text-xs text-muted">{tier.thresholdNote}</p>
      )}

      <a
        href={STRIPE_LINKS[tier.key]}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('preorder-click', { tier: tier.key })}
        className={`block w-full rounded-full py-3 text-center font-semibold transition-all ${
          tier.highlighted
            ? 'bg-brand-green text-dark-900 hover:bg-brand-green-light'
            : 'border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white'
        }`}
      >
        Pre-order &mdash; &euro;{tier.price}
      </a>
    </div>
  );
}
