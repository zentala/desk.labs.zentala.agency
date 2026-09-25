/**
 * Exit-intent popup (desktop only) — detects mouse leaving viewport,
 * shows email capture popup. Triggers once per session via localStorage.
 */
import { useState, useEffect, type FormEvent } from 'react';
import { trackEvent } from '../utils/analytics';
import { isValidEmail } from '../utils/validation';

const STORAGE_KEY = 'exit-popup-shown';
const WAITLIST_ENDPOINT = 'https://waitlist.lp.desk.labs.zentala.agency/api/signup';

export default function ExitPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorFallback, setErrorFallback] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShow(true);
        localStorage.setItem(STORAGE_KEY, '1');
        document.removeEventListener('mouseout', handleMouseLeave);
      }
    };

    document.addEventListener('mouseout', handleMouseLeave);
    return () => document.removeEventListener('mouseout', handleMouseLeave);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return;

    try {
      const res = await fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        // TODO: replace with real endpoint error handling when CF Worker is deployed
        setErrorFallback(true);
      }
    } catch {
      // TODO: replace with real endpoint error handling when CF Worker is deployed
      setErrorFallback(true);
    }
    trackEvent('waitlist-signup');
    setSubmitted(true);
  };

  const close = () => setShow(false);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-line bg-surface p-8">
        <button
          onClick={close}
          className="absolute right-4 top-4 text-ink-muted transition-colors hover:text-ink"
          aria-label="Close popup"
        >
          &#10005;
        </button>

        {submitted ? (
          <div className="text-center">
            <p className="text-lg font-semibold text-brand-text">
              {errorFallback
                ? "Thanks! We've noted your email."
                : "Thanks! We'll notify you when the kit is ready."}
            </p>
          </div>
        ) : (
          <>
            <h3 className="mb-2 text-xl font-bold text-ink">
              Wait! Join 100+ people on our waitlist
            </h3>
            <p className="mb-6 text-sm text-ink-muted">
              Get notified when the desk sensor kit ships. No spam.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 rounded-full border border-line bg-bg px-5 py-3 text-ink placeholder-ink-muted outline-none focus:border-brand-strong"
              />
              <button
                type="submit"
                aria-label="Join waitlist"
                className="rounded-full bg-brand-strong px-6 py-3 font-semibold text-on-brand hover:bg-brand"
              >
                Join
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
