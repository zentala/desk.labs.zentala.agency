/**
 * Sticky CTA bar — fixed at bottom of viewport, visible after scrolling past hero.
 * Hides when user is in the pricing section to avoid redundancy.
 */
import { useState, useEffect } from 'react';
import { trackEvent } from '../utils/analytics';
import { PRICING } from '../data/pricing';

export default function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.querySelector('section');
      const pricing = document.getElementById('pricing');
      if (!hero) return;

      const scrollY = window.scrollY;
      const heroPast = scrollY > hero.offsetHeight;

      let inPricing = false;
      if (pricing) {
        const rect = pricing.getBoundingClientRect();
        inPricing = rect.top < window.innerHeight && rect.bottom > 0;
      }

      setVisible(heroPast && !inPricing);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-bg/90 backdrop-blur-sm border-t border-line px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-4">
          <a
            href="#pricing"
            onClick={() => trackEvent('preorder-click', { source: 'sticky-bar' })}
            className="rounded-full bg-brand-strong px-6 py-2 text-sm font-semibold text-on-brand transition-all hover:bg-brand"
          >
            Pre-order Dev Kit &mdash; &euro;{PRICING.basic.price}
          </a>
          <a
            href="#waitlist"
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Join Waitlist
          </a>
        </div>
      </div>
    </div>
  );
}
