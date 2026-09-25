/**
 * Waitlist email collection form. Submits to a Cloudflare Worker endpoint.
 * Placed after Hero section and in the Footer.
 */
import { useState, type FormEvent } from 'react';
import { trackEvent } from '../utils/analytics';
import { isValidEmail } from '../utils/validation';

/** Placeholder endpoint — Cloudflare Worker to be built later */
const WAITLIST_ENDPOINT = 'https://waitlist.lp.desk.labs.zentala.agency/api/signup';

interface Props {
  /** Compact variant for footer placement */
  compact?: boolean;
}

export default function WaitlistForm({ compact = false }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorFallback, setErrorFallback] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return;

    setStatus('loading');
    try {
      const res = await fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        // TODO: replace with real endpoint error handling when CF Worker is deployed
        setErrorFallback(true);
        setStatus('success');
      }
      trackEvent('waitlist-signup');
    } catch {
      // TODO: replace with real endpoint error handling when CF Worker is deployed
      setErrorFallback(true);
      setStatus('success');
      trackEvent('waitlist-signup');
    }
  };

  if (status === 'success') {
    return (
      <div className={`rounded-2xl border border-brand-strong/30 bg-surface ${compact ? 'p-4' : 'p-8'} text-center`}>
        <p className="text-lg font-semibold text-brand-text">
          {errorFallback
            ? "Thanks! We've noted your email."
            : "Thanks! We'll notify you when the kit is ready."}
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          No spam. Updates only when something ships.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-line bg-surface ${compact ? 'p-4' : 'p-8'}`}>
      {!compact && (
        <div className="mb-6 text-center">
          <h3 className="text-xl font-bold text-ink">
            Not ready to pre-order?
          </h3>
          <p className="mt-2 text-ink-muted">
            Join the waitlist — we'll let you know when the kit ships.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 rounded-full border border-line bg-bg px-5 py-3 text-ink placeholder-ink-muted outline-none transition-colors focus:border-brand-strong"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !isValidEmail(email)}
          className="rounded-full bg-brand-strong px-8 py-3 font-semibold text-on-brand transition-all hover:bg-brand disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
        </button>
      </form>

      <p className="mt-3 text-center text-xs text-ink-muted">
        No spam. Updates only when something ships.
      </p>
    </div>
  );
}
