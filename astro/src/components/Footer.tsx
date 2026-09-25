/**
 * Footer — links, badges, waitlist form, and legal.
 */
import WaitlistForm from './WaitlistForm';
import { trackEvent } from '../utils/analytics';

export default function Footer() {
  return (
    <footer className="border-t border-line/50 py-16">
      <div className="section-container">
        {/* Waitlist form */}
        <div className="mx-auto mb-12 max-w-xl">
          <WaitlistForm compact />
        </div>

        <div className="grid gap-12 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-ink">lp.desk.labs.zentala.agency</h3>
            <p className="mt-3 text-sm text-ink-muted">
              Open source desk sensor that actually gets you to stand up.
              Built by a developer, for developers.
            </p>
            <div className="mt-4 flex gap-3">
              <span className="inline-flex items-center rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-ink-muted">
                Made in Poland
              </span>
              <span className="inline-flex items-center rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-ink-muted">
                Open Source
              </span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-ink-muted">
              Links
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href="https://github.com/zentala"
                  className="text-ink-muted transition-colors hover:text-ink"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('diy-click')}
                >
                  GitHub
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-ink-muted transition-colors hover:text-ink">
                  Pre-order
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-ink-muted transition-colors hover:text-ink">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/blog" className="text-ink-muted transition-colors hover:text-ink">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-ink-muted">
              Legal
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href="/privacy" className="text-ink-muted transition-colors hover:text-ink">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-ink-muted transition-colors hover:text-ink">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-8 text-center text-xs text-ink-muted">
          &copy; {new Date().getFullYear()} zentala. All rights reserved.
          No tracking. No cookies. Your privacy matters.
        </div>
      </div>
    </footer>
  );
}
